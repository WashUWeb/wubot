// Description:
//   wubot script to display comments put on kanbanize cards
//
// Dependencies:
//   xmlhttprequest
//
// Configuration:
//   None
//
// Commands:
//	 wubot any new comments ? - returns any new comments on kanbanize cards
//   hubot is it weekend ?  - returns whether is it weekend or not
//   hubot is it holiday ?  - returns whether is it holiday or not
 

module.exports = function(robot) {

 

    var KanbanizeJS = function(options) {
        var domain;
        if (null != options.email && null != options.password){
            this.email = options.email;
            this.password = options.password;
        }

        this.apikey = null != options.apikey ? options.apikey : kanEnum.API_KEY;
        domain = null != options.domain ? options.domain + '.' : kanEnum.BASE_DOMAIN + '.';
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

    KanbanizeJS.prototype.call = function(apiCall, msg) {
        var l, url, xmlhttp, response;
        if (apiCall["function"] !== 'login' && (this.apikey == null)) {
            l = this.login();
            this.apikey = l.apikey;
        }
        url = this._getUrl(apiCall);
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    response = xmlhttp.responseText;
                    return msg.reply(response);
                } else if(xmlhttp.status === 400) {
                    return msg.reply('No comments in the last hour')
                }else {
                    return console.log('something else other than 200 was returned');
                }
            }
        };

        xmlhttp.open("POST", url, true);
        console.log(decodeURI(url));
        xmlhttp.setRequestHeader("apikey", this.apikey);
        xmlhttp.send();        
    };

    KanbanizeJS.prototype.login = function() {
        var call;
        call = {
        "function": 'login',
        data: {
          email: this.email,
          password: this.password
        }
        };
        return this.call(call);
    };


    KanbanizeJS.prototype.date_repr = function(date){
        var newdate = date.getFullYear() + "-"  
                        + (date.getMonth()+1)  + "-" 
                        + date.getDate() + " "
                        + date.getHours() + ":"  
                        + date.getMinutes() + ":" 
                        + date.getSeconds();
            return newdate;
    };
	

	robot.respond(/any new comments\s?\?/i, function(msg){

		var kanbanize = new KanbanizeJS({
            apikey : kanEnum.API_KEY,
        });

        var today = new Date().getTime(); 
        var endtime = kanbanize.date_repr(new Date(today + (1000*60*60*24)));
        var hourago = kanbanize.date_repr(new Date(today - (1000*60*60)));

        get_board_activities = {
            "function": 'get_board_activities',
            data:{
                boardid : '9',
                fromdate : hourago,
                todate : endtime,
                history : 'yes',
                eventtype : 'Comments',
            }
        }

        kanbanize.call(get_board_activities, msg);
	});


} 
