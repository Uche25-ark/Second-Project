import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const consumerSchema = new mongoose.Schema(
  {
    consumerName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\d{10,15}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`,
      },
    },
    address: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
consumerSchema.pre("save", async function (next) {
  if (!this.isModified("password"));

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
consumerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("Consumer", consumerSchema);