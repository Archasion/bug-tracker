const mongoose = require("mongoose");
const { Schema } = mongoose;

const devSchema = new Schema({
	blacklist: {
		type: Object,
		default: {}
	}
});

const Dev = mongoose.model("Dev", devSchema);
module.exports = Dev;
