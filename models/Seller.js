import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
    sellerName:{
        type: String,
        required: true,
        unique: true,
    },
    email: String,
    storeAddress: String,
    loginId: { type: mongoose.Schema.Types.ObjectId, ref: "Login" },
    status: { type: String, default: "active" }
});

export default mongoose.model("Seller", sellerSchema);