import mongoose from "mongoose";
import Product from "./Product.js";

const orderSchema = new mongoose.Schema({
  consumerId: { 
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
  status: { 
    type: String, 
    enum: ["pending","paid","shipped","delivered","cancelled"], 
    default: "pending" 
  },
  shippingAddress: { 
    type: String 
  },
  paymentMethod: { 
    type: String, 
    enum: ["card","cash","transfer"], 
    default: "cash" 
  }
}, { timestamps: true });

// Pre-save hook to reduce product stock
orderSchema.pre("save", async function(next) {
  try {
    for (const item of this.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }
      product.stock -= item.quantity;
      await product.save();
    }
    
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Order", orderSchema);