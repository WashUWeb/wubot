// Description:
//   test script
//
// Dependencies:
//   
//
// Configuration:
//   None
//
// Commands:
//   hubot is it weekend ?  - returns whether is it weekend or not
//   hubot is it holiday ?  - returns whether is it holiday or not

module.exports = function(robot) {

	robot.respond(/is it (weekend|holiday)\s?\?/i, function(msg){
	    var today = new Date();
	    msg.reply(today.getDay() === 0 || today.getDay() === 6 ? "YES" : "NO");
	});	

	robot.hear(/whatever/i, function(msg){
	    msg.reply("too sassy");
	});	
}