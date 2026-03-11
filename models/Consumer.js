import mongoose from "mongoose";

const consumerSchema = new mongoose.Schema({
    name: String,
    email: String,
    password:String,
    phoneNumber: String,
    address: String
});

export default mongoose.model("Consumer", consumerSchema);