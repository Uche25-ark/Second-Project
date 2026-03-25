import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// GET - VIEW CART
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ consumerId: req.consumer._id })
      .populate("items.productId", "name price stock");

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD ITEM TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // ✅ Validation
    if (!productId || quantity === undefined || quantity < 1) {
      return res.status(400).json({ message: "ProductId and valid quantity are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
    }

    let cart = await Cart.findOne({ consumerId: req.consumer._id });

    if (!cart) {
      cart = new Cart({
        consumerId: req.consumer._id,
        items: [{ productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(item => item.productId.equals(productId));

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;

        if (newQty > product.stock) {
          return res.status(400).json({ message: `Cannot exceed stock of ${product.stock}` });
        }

        existingItem.quantity = newQty;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId", "name price stock");

    res.status(201).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ITEM QUANTITY
export const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // ✅ Validation
    if (!productId || quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: "ProductId and valid quantity are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const cart = await Cart.findOne({ consumerId: req.consumer._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(item => item.productId.equals(productId));
    if (!item) return res.status(404).json({ message: "Product not found in cart" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (quantity > product.stock) {
      return res.status(400).json({ message: `Cannot exceed stock of ${product.stock}` });
    }

    if (quantity === 0) {
      // Remove item
      cart.items = cart.items.filter(i => !i.productId.equals(productId));
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId", "name price stock");

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE / CLEAR CART
export const deleteCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ consumerId: req.consumer._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const initialLength = cart.items.length;

      cart.items = cart.items.filter(item => !item.productId.equals(productId));

      if (cart.items.length === initialLength) {
        return res.status(404).json({ message: "Product not found in cart" });
      }
    } else {
      // Clear entire cart
      cart.items = [];
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId", "name price stock");

    res.json({ message: "Cart updated successfully", cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};