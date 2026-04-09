import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consumer",
      required: true,
      unique: true, 
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
  },
  { timestamps: true }
);

// Add a method to calculate total items in cart
cartSchema.methods.getTotalItems = function () {
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
};

export default mongoose.model("Cart", cartSchema);