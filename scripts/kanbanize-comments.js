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

        var comments = response.activities;
        outputString = " ";

        for (var i =0; i <comments.length; i++){
            comment = comments[i];
            console.log(comment);
            output = comment.author + " commented on task id " + comment.taskid + " at " + comment.date + ", saying: " + comment.text + "\n";
            outputString += output;
        }
        return outputString;
    }

    //Returns any new comments added within the hour every  
    //hour during the working week.
    var cronJob = cron.job("*/15 06-16 * * 1-5", function(){
        //TODO: Find out how to get Slack room name
        /*var room = 'general';
        kanbanize.retrieveComments(function(response){
            newComments = parseResponse(response);
            robot.messageRoom(room, newComments);
        });*/
        console.log("Running cron");
    }); 
    cronJob.start();

	
    //One-off reply to any user query for any new comments
	robot.respond(/any new comments\s?\?/i, function(res){
        kanbanize.retrieveComments(function(response){
            newComments = parseResponse(response);
            res.send(newComments);
        });
	});


    //simple function to bypass xmlhttprequest
    robot.respond(/give me a new comment/i, function(res){
        console.log('giving new comment');
        data = JSON.stringify({
                boardid : process.env.KANBANIZE_BOARD_ID,
                fromdate : '2015-07-16',
                todate : '2015-07-17',
                history : 'yes',
                eventtype : 'Comments',
                format: 'json',
            });
        
        url = "http://" + process.env.KANBANIZE_BASE_DOMAIN + '.' + process.env.KANBANIZE_BASE_URL + '/get_board_activities';
        robot.http(url)
            .header('apikey', 'JJ5kg0O7zmuJLMQbmKYNdsZtzHOZA4tKYTTbTfX2')
            .header('Accept', 'application/json')
            .post(data)(function(err, res, body){
                data = JSON.parse(body);
                console.log(data.activities);
            });
    });

} 
