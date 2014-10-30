# Description:
#   A script to troll Chrisbot
#

module.exports = (robot) ->

	robot.hear /ChrisBot/i, (msg) ->
		msg.send "ChrisBot better watch his back."