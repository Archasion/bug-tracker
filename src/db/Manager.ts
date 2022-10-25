import Properties from "../data/Properties";
import mongoose from "mongoose";

module.exports = async () => {
    console.log("%s Connecting to database...", Properties.cli.db);

    await mongoose
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .connect(process.env.MONGO_URI!)
        .then(() => {
            console.log("%s Connected to MongoDB", Properties.cli.db);
        });
};