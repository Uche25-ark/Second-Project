import mongoose from "mongoose";

const LoginSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: {
        type: String,
        enum: ["consumer", "seller"]
    },
    userId: String
});

export default mongoose.model("Login", LoginSchema);