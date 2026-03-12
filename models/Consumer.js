import mongoose from "mongoose";

const consumerSchema = new mongoose.Schema({
    consumerName:{
        type: String,
        required: true,
        unique: true,
    },
    email: String,
    password:String,
    phoneNumber: String,
    address: String
});

export default mongoose.model("Consumer", consumerSchema);