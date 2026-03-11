import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    consumerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consumer"
    },
    items:[
        {
            productId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: Number
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
});

export default mongoose.model("Cart", cartSchema);