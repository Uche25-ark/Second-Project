import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import { sendResponse } from "../utils/apiResponse.js"; // Standard response helper

// GET - VIEW CART
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ consumerId: req.consumer._id })
      .populate("items.productId", "name price stock");

    if (!cart) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Cart not found",
        data: null,
      });
    }

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to retrieve cart",
      errors: error.message,
    });
  }
};

// ADD ITEM TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 1) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: "ProductId and valid quantity are required",
        data: null,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: "Invalid product ID",
        data: null,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Product not found",
        data: null,
      });
    }

    if (quantity > product.stock) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: `Only ${product.stock} items available in stock`,
        data: null,
      });
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
          return sendResponse(res, {
            status: false,
            validation: true,
            message: `Cannot exceed stock of ${product.stock}`,
            data: null,
          });
        }

        existingItem.quantity = newQty;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId", "name price stock");

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Item added to cart successfully",
      data: populatedCart,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to add item to cart",
      errors: error.message,
    });
  }
};

// UPDATE ITEM QUANTITY
export const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 0) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: "ProductId and valid quantity are required",
        data: null,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: "Invalid product ID",
        data: null,
      });
    }

    const cart = await Cart.findOne({ consumerId: req.consumer._id });
    if (!cart) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Cart not found",
        data: null,
      });
    }

    const item = cart.items.find(item => item.productId.equals(productId));
    if (!item) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Product not found in cart",
        data: null,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Product not found",
        data: null,
      });
    }

    if (quantity > product.stock) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: `Cannot exceed stock of ${product.stock}`,
        data: null,
      });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(i => !i.productId.equals(productId));
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId", "name price stock");

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Cart updated successfully",
      data: populatedCart,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to update cart",
      errors: error.message,
    });
  }
};

// DELETE / CLEAR CART
export const deleteCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ consumerId: req.consumer._id });
    if (!cart) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Cart not found",
        data: null,
      });
    }

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return sendResponse(res, {
          status: false,
          validation: true,
          message: "Invalid product ID",
          data: null,
        });
      }

      const initialLength = cart.items.length;
      cart.items = cart.items.filter(item => !item.productId.equals(productId));

      if (cart.items.length === initialLength) {
        return sendResponse(res, {
          status: false,
          validation: false,
          message: "Product not found in cart",
          data: null,
        });
      }
    } else {
      cart.items = [];
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId", "name price stock");

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Cart cleared/updated successfully",
      data: populatedCart,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to delete cart",
      errors: error.message,
    });
  }
};