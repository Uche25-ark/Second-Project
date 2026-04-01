import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import { sendResponse } from "../utils/apiResponse.js"; // Standard response helper

// ---------------------- GET CART ----------------------
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
        statusCode: 404,
      });
    }

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Cart retrieved successfully",
      data: cart,
      statusCode: 200,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to retrieve cart",
      errors: error.message,
      statusCode: 500,
    });
  }
};

// ---------------------- ADD ITEM TO CART ----------------------
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 1) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: "ProductId and valid quantity are required",
        data: null,
        statusCode: 400,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: "Invalid product ID",
        data: null,
        statusCode: 400,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Product not found",
        data: null,
        statusCode: 404,
      });
    }

    if (quantity > product.stock) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: `Only ${product.stock} items available in stock`,
        data: null,
        statusCode: 400,
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
            statusCode: 400,
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
      statusCode: 201,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to add item to cart",
      errors: error.message,
      statusCode: 500,
    });
  }
};

// ---------------------- UPDATE ITEM QUANTITY ----------------------
export const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 0) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: "ProductId and valid quantity are required",
        data: null,
        statusCode: 400,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: "Invalid product ID",
        data: null,
        statusCode: 400,
      });
    }

    const cart = await Cart.findOne({ consumerId: req.consumer._id });
    if (!cart) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Cart not found",
        data: null,
        statusCode: 404,
      });
    }

    const item = cart.items.find(item => item.productId.equals(productId));
    if (!item) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Product not found in cart",
        data: null,
        statusCode: 404,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Product not found",
        data: null,
        statusCode: 404,
      });
    }

    if (quantity > product.stock) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: `Cannot exceed stock of ${product.stock}`,
        data: null,
        statusCode: 400,
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
      statusCode: 200,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to update cart",
      errors: error.message,
      statusCode: 500,
    });
  }
};

// ---------------------- DELETE / CLEAR CART ----------------------
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
        statusCode: 404,
      });
    }

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return sendResponse(res, {
          status: false,
          validation: true,
          message: "Invalid product ID",
          data: null,
          statusCode: 400,
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
          statusCode: 404,
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
      statusCode: 200,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to delete cart",
      errors: error.message,
      statusCode: 500,
    });
  }
};