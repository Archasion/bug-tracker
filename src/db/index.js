const mongoose = require("mongoose");

module.exports = async () => {
	log.info("Connecting to MongoDB...");

	await mongoose
		.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		.then(() => {
			log.info("Connected to MongoDB");
		});
};
