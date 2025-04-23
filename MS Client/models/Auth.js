const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    code : {
        type: Number,
        default: 0,
    },
});

const Auth = mongoose.model("authentifications", authSchema);
module.exports = Auth;
