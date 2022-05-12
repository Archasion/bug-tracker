const mongoose = require("mongoose");
const { Schema } = mongoose;

const guildSchema = new Schema({
	id: {
		type: String,
		required: true
	},
	bugs: {
		type: Array,
		default: []
	},
	reports: {
		type: Array,
		default: []
	},
	suggestions: {
		type: Array,
		default: []
	},
	auto: {
		type: Object,
		default: {
			thread: {
				bugs: false,
				suggestions: false
			},
			delete: [],
			roles: []
		}
	},
	roles: {
		type: Object,
		default: {
			moderator: null,
			administrator: null
		}
	},
	channels: {
		type: Object,
		default: {
			bugs: null,
			reports: null,
			suggestions: null,
			archive: null,
			bot_updates: null
		}
	}
});

const Guilds = mongoose.model("Guilds", guildSchema);
module.exports = Guilds;
