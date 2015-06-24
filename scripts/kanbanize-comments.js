// Description:
//   wubot script to display comments put on kanbanize cards
//
// Dependencies:
//   xmlhttprequest
//   xml2json
//
// Configuration:
//   Should either have a config.json file containing board id, api key and base domain or 
//   environment variables containing this info
//
// Commands:
//	 wubot any new comments ? - returns any new comments on kanbanize cards
 

module.exports = function(robot) {

    var KanbanizeJS = require('../libs/KanbanizeJS');
    var cron = require('cron');
    var kanbanize = KanbanizeJS.create({});

    function parseResponse(response){
        if (typeof response === "string"){
            return response;
        }

        var comments = response.xml.activities.item;

        outputString = " ";

        for (var key in comments){
            comment = comments[key];
            author = comment.author;
            taskId = comment.taskid;
            text = comment.text;
            time = comment.date;

            output = author + " commented on task id " + taskId + " at " + time + ", saying: " + text + "\n";
            outputString += output;
        }
        return outputString;
    }

    //Returns any new comments added within the hour every  
    //hour during the working week.
    var cronJob = cron.job("00 09-17 * * 1-5", function(){
        //TODO: Find out how to get Slack room name
        var room = 'Shell';
        kanbanize.retrieveComments(function(response){
            newComments = parseResponse(response);
            robot.messageRoom(room, newComments);
        });
    }); 
    cronJob.start();

	
    //One-off reply to any user query for any new comments
	robot.respond(/any new comments\s?\?/i, function(res){
        kanbanize.retrieveComments(function(response){
            newComments = parseResponse(response);
            res.send(newComments);
        });
	});


} 
