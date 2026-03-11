import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
    sellerName: String,
    email: String,
    storeAddress: String
});

export default mongoose.model("Seller", sellerSchema);