
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const consumerSchema = new mongoose.Schema({
  consumerName: 
    { 
        type: String, 
        required: true, 
        unique: true 
    },
  email: 
    { 
        type: String, 
        required: true, 
        unique: true 
    },
  password: 
    { 
        type: String, 
        required: true 
    },
  phoneNumber: String,
  address: String,
});

consumerSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
 
});

consumerSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("Consumer", consumerSchema);