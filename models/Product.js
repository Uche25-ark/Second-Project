import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: String,
    price: String,
    description: String,
    stock: Number,
    picture: String,
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller"
    }
});

export default mongoose.model("Product", productSchema);