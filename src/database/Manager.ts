import mongoose from "mongoose";
import clc from "cli-color";

module.exports = (async () => {
    console.log("%s Connecting to database...", clc.cyan("(DATABASE)"));

    await mongoose
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .connect(process.env.MONGO_URI!)
        .then(() => {
            console.log("%s Connected to MongoDB", clc.cyan("(DATABASE)"));
        });
})();