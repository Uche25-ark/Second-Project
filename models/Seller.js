import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const sellerSchema = new mongoose.Schema({
  sellerName: { 
    type: String,
    required: [true, "Seller name is required"],
    unique: true,
    trim: true
  },
  email: { 
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
  },
  password: { 
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  storeAddress: { 
    type: String,
    required: [true, "Store address is required"],
    trim: true
  },
}, { timestamps: true });

// Hash password before saving
sellerSchema.pre("save", async function(next) {
  if (!this.isModified("password"));
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
sellerSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("Seller", sellerSchema);