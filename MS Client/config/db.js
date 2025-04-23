const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/service-client", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Database is connected");
    } catch (err) {
        console.error("❌ Connection échouée !", err);
    }
};

module.exports = connectDB;
