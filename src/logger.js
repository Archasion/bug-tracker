const { path } = require("./utils/fs");
const Logger = require("leekslazylogger");
module.exports = new Logger({
	debug: config.debugging,
	directory: path("./logs/"),
	keepFor: 30,
	levels: {
		_logger: { format: "&f&!7{timestamp}&r [LOGGER] {text}" },
		basic: { format: "&f&!7{timestamp} {text}" },

		commands: {
			format: "&f&!7{timestamp}&r &3[INFO] &d(COMMANDS)&r {text}",
			type: "info"
		},

		buttons: {
			format: "&f&!7{timestamp}&r &3[INFO] &1(BUTTONS)&r {text}",
			type: "info"
		},

		modals: {
			format: "&f&!7{timestamp}&r &3[INFO] &a(MODALS)&r {text}",
			type: "info"
		},

		console: { format: "&f&!7{timestamp} [INFO] {text}" },
		debug: { format: "&f&!7{timestamp}&r &1[DEBUG] &9{text}" },
		error: { format: "&f&!7{timestamp}&r &4[ERROR] &c{text}" },

		http: {
			format: "&f&!7{timestamp}&r &3[INFO] &d(HTTP)&r {text}",
			type: "info"
		},

		info: { format: "&f&!7{timestamp}&r &3[INFO] &b{text}" },
		notice: { format: "&f&!7{timestamp}&r &0&!6[NOTICE] {text}" },
		success: { format: "&f&!7{timestamp}&r &2[SUCCESS] &a{text}" },
		warn: { format: "&f&!7{timestamp}&r &6[WARN] &e{text}" },

		ws: {
			format: "&f&!7{timestamp}&r &3[INFO] &d(WS)&r {text}",
			type: "info"
		}
	},
	logToFile: true,
	name: "Bug Tracker by Archasion",
	splitFile: true,
	timestamp: "YYYY-MM-DD HH:mm:ss"
});
