import mongoose, { Schema } from "mongoose";

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
			dm: {
				status: false
			},
			threads: {
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

export default mongoose.model("Guilds", guildSchema);