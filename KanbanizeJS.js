var kanEnum = require('./config.json');

var KanbanizeJS = function(options) {        
    this.apikey = null != options.apikey ? options.apikey : kanEnum.API_KEY;
    var domain = null != options.domain ? options.domain + '.' : kanEnum.BASE_DOMAIN + '.';
    this.kanbanize_url = "http://" + domain + kanEnum.BASE_URL;
}

KanbanizeJS.prototype._getUrl = function(call) {
    var key, url, val, _ref;
    url = [this.kanbanize_url, call["function"]];
    _ref = call.data;
    for (key in _ref) {
    val = _ref[key];
    url.push(key, encodeURIComponent(val));
    }
    return url.join('/');
};

KanbanizeJS.prototype.call = function(apiCall, callback) {
    var url, xmlhttp, response;
    url = this._getUrl(apiCall);
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        var noComments = "No comments in the last hour";
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                var parser = require('xml2json');
                var options =   { 
                                    "sanitize" : false,
                                };
                response = JSON.parse(parser.toJson(xmlhttp.responseText, options));
                callback(response);
            } else if(xmlhttp.status === 400) {
                callback(noComments);
            }else {
                console.log('error code ' + xmlhttp.status + "was received");
                callback(noComments);
            }
        }
    };

    xmlhttp.open("POST", url, true);
    //console.log(decodeURI(url));   Debugging
    xmlhttp.setRequestHeader("apikey", this.apikey);
    xmlhttp.send();        
};

KanbanizeJS.prototype.dateRep = function(date){
    var newDate = date.getFullYear() + "-"  
                    + (date.getMonth() + 1)  + "-" 
                    + date.getDate();
    return newDate;
};

KanbanizeJS.prototype.retrieveComments = function(callback){
    var today = new Date().getTime(); 
    var fromTime = this.dateRep(new Date(today));
    var endTime = this.dateRep(new Date(today + (1000*60*60*24)));  //next day

    get_board_activities = {
        "function": 'get_board_activities',
        data:{
            boardid : kanEnum.BOARD_ID,
            fromdate : fromTime,
            todate : endTime,
            history : 'yes',
            eventtype : 'Comments',
        }
    }

    this.call(get_board_activities, callback);
}

if (exports) {
    exports.create = function(options) {
        return new KanbanizeJS(options);
    }
    exports.KanbanizeJS = KanbanizeJS;
}
