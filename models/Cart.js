import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  consumerId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Consumer", 
        required: true 
    },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 }
  }]
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);