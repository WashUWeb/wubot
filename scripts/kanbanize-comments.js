// Description:
//   wubot script to display comments put on kanbanize cards in slack
//
// Dependencies:
//   node-cron
//   
//
// Configuration:
//  should set the following environment variables:
//  HUBOT_SLACK_TOKEN - for communication with Slack       
//  KANBANIZE_API_KEY - to link with Kanbanize.com
//  KANBANIZE_API_URL - specify Kanbanize api url, 
//      e.g. http://<subdomain>.kanbanize.com/index.php/api/kanbanize/
//  KANBANIZE_BOARD_ID - specify which Kanban board to check
//
// Commands:
//	 wubot any new comments ? - returns any new comments on kanbanize cards
 

module.exports = function(robot) {

    /*Load node-cron module to enable cron job to run*/
    var cron = require('cron');

    /*Simple function to format date in manner acceptable by Kanbanize API*/
    var kanbanizeDate = function(date){
        var newDate = date.getFullYear() + "-"  
                    + (date.getMonth() + 1)  + "-" 
                    + date.getDate();
        return newDate;
    };
    
    /*Function to call one of the methods provided by the Kanbanize API*/
    var callKanbanize = function(apiCall, callback){
        var command_url =  process.env.KANBANIZE_API_URL + apiCall.command;

        robot.http(api_url)
            .header("apikey", process.env.KANBANIZE_API_KEY)
            .header("Accept", "application/json")
            .post(JSON.stringify(apiCall.parameters))
            (function(err, res, body){
                comments = JSON.parse(body);
                calback(comments);
            });
    };

    /*Function to get name of lane a comment's task is in. Used to determine
        what channel said comment should be posted in. Assumes that the lane
        name and channel name are analogous. Can link the lane name and channel
        name using a json file if necessary*/
    var getLane = function(){

    };

    /*Function to format and display any obtained comments on Slack*/
    var displayComments = function(comments){

    };

    /*Function to get all comments made from a given time to now*/
    var getComments = function(time){
        var from = kanbanizeDate(new Date());
        //next day; ensures all comments are from current day.
        var end = kanbanizeDate(new Date(Date.now() + (1000*60*60*24))) 
        
        /*required parameters to retrieve comments from Kanbanize api*/
        var board_data = JSON.stringify({
                            command: "get_board_activities",
                            data:{
                                boardid : process.env.KANBANIZE_BOARD_ID,
                                fromdate : from,
                                todate : end,
                                history : "yes",
                                eventtype : "Comments",
                                format: "json",
                            }
                        });

        var apiCall = JSON.parse(board_data);
        callKanbanize(apiCall, function(comments){
            if(null != time){
                earliestTime = Date.now() - time;
                console.log(earliestTime);
            }
            console.log(comments);
            //displaycomments(comments);
        });
    };
    


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


	/*Returns any new comments added within the hour every  
      hour during the working week.*/
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
        getComments();
	});


} 
