import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },

    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

   picture: {
  type: String,
  default: "",
  validate: {
    validator: function (v) {
      return (
        v === "" ||
        /^data:image\/(png|jpeg|jpg|webp|gif);base64,/.test(v)
      );
    },
    message: () => `Picture must be a valid Base64 image`,
    },
  },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
  },

  {
    timestamps: true,
    versionKey: false, // 🔥 THIS LINE REMOVES __v
  }
);

export default mongoose.model("Product", productSchema);