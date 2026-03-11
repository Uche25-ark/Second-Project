import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    consumerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consumer"
    },
    items:[
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: Number,
            price: Number,
        }
    ],
    total: Number,
    status: String,
    orderDate: {
        type: Date,
        default: Date.now
    }
});


export default mongoose.model("Order", orderSchema);