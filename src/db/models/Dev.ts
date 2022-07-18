import mongoose, { Schema } from "mongoose";

const devSchema = new Schema({
	blacklist: {
		type: Object,
		default: {}
	}
});

export default mongoose.model("Dev", devSchema);