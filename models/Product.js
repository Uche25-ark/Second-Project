import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: 
    { 
        type: String, 
        required: true, 
        trim: true 
    },
  price: 
    { 
        type: Number, 
        required: true, 
        min: 0 
    },
  description: 
    { 
        type: String, 
        required: true, 
        maxlength: 500 
    },
  stock: 
    { 
        type: Number, 
        required: true, 
        min: 0 
    },
  picture: 
    { 
        type: String, 
        default: "" 
    },
  sellerId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Seller", 
        required: true 
    }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);