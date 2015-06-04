// Description:
//   wubot script to display comments put on kanbanize cards
//
// Dependencies:
//   xmlhttprequest
//   xml2json
//
// Configuration:
//   Should have a config.json file containing api key and base domain
//
// Commands:
//	 wubot any new comments ? - returns any new comments on kanbanize cards
 

module.exports = function(robot) {

    var kanEnum = require('../config.json');

    var KanbanizeJS = function(options) {
        var domain;
        if (null != options.email && null != options.password){
            this.email = options.email;
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

    KanbanizeJS.prototype.call = function(apiCall, res) {
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
                    var parser = require('xml2json');
                    var json = JSON.parse(parser.toJson(response));
                    var comments = json.xml.activities.item;
                    //console.log(comments[0]);
                    return res.reply(JSON.stringify(comments));
                } else if(xmlhttp.status === 400) {
                    return res.reply('No comments in the last hour')
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
                        + (date.getMonth() + 1)  + "-" 
                        + date.getDate()// + " "
                        //+ date.getHours() + ":"  
                        //+ date.getMinutes() + ":" 
                        //+ date.getSeconds();
            return newdate;
    };
	
	robot.respond(/any new comments\s?\?/i, function(res){

		var cron = require('cron');
        var cronJob = cron.job("0 */10 * * * *", function(){
            var kanbanize = new KanbanizeJS({
                apikey : kanEnum.API_KEY,
            });

            var today = new Date().getTime(); 
            var fromtime = kanbanize.date_repr(new Date(today));
            var endtime = kanbanize.date_repr(new Date(today + (1000*60*60*24)));

            get_board_activities = {
                "function": 'get_board_activities',
                data:{
                    boardid : '9',
                    fromdate : fromtime,
                    todate : endtime,
                    history : 'yes',
                    eventtype : 'Comments',
                }
            }

            kanbanize.call(get_board_activities, res);
        }); 
        cronJob.start();

	});


} 
