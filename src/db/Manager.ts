import mongoose from "mongoose";

module.exports = async () => {
	console.log("Connecting to database...");

	await mongoose
		.connect(process.env.MONGO_URI!)
		.then(() => {
			console.log("Connected to MongoDB");
		});
};