import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  consumerId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Consumer", 
        required: true 
    },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  total: { 
    type: Number, 
    required: true, 
    min: 0 
   },
  status: 
    { 
        type: String, 
        enum: ["pending","paid","shipped","delivered","cancelled"], 
        default: "pending" 
    }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);