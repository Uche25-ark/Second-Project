import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";

// ---------------------- GET CART ----------------------
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ consumerId: req.consumer._id })
      .populate("items.productId", "name price stock");

    if (!cart || cart.items.length === 0) {
      return sendResponse(res, { code: StatusCodes.NOT_FOUND, message: "Cart is empty" });
    }

    return sendResponse(res, { data: cart });

  } catch (error) {
    return sendResponse(res, { code: StatusCodes.INTERNAL_SERVER_ERROR, errors: error.message });
  }
};

// ---------------------- ADD ITEM TO CART ----------------------
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 1) {
      return sendResponse(res, { code: StatusCodes.BAD_REQUEST, message: "Valid productId and quantity required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendResponse(res, { code: StatusCodes.BAD_REQUEST, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) return sendResponse(res, { code: StatusCodes.NOT_FOUND, message: "Product not found" });

    let cart = await Cart.findOne({ consumerId: req.consumer._id });

    if (!cart) {
      cart = new Cart({ consumerId: req.consumer._id, items: [{ productId, quantity }] });
    } else {
      const item = cart.items.find(i => i.productId.equals(productId));
      if (item) {
        const newQty = item.quantity + quantity;
        if (newQty > product.stock) return sendResponse(res, { code: StatusCodes.BAD_REQUEST, message: `Cannot exceed stock of ${product.stock}` });
        item.quantity = newQty;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId", "name price stock");

    return sendResponse(res, { code: StatusCodes.CREATED, data: populatedCart });

  } catch (error) {
    return sendResponse(res, { code: StatusCodes.INTERNAL_SERVER_ERROR, errors: error.message });
  }
};

// ---------------------- UPDATE CART ----------------------
export const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 0) {
      return sendResponse(res, { code: StatusCodes.BAD_REQUEST, message: "Valid productId and quantity required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendResponse(res, { code: StatusCodes.BAD_REQUEST, message: "Invalid product ID" });
    }

    const cart = await Cart.findOne({ consumerId: req.consumer._id });
    if (!cart) return sendResponse(res, { code: StatusCodes.NOT_FOUND, message: "Cart not found" });

    const item = cart.items.find(i => i.productId.equals(productId));
    if (!item) return sendResponse(res, { code: StatusCodes.NOT_FOUND, message: "Product not in cart" });

    const product = await Product.findById(productId);
    if (!product) return sendResponse(res, { code: StatusCodes.NOT_FOUND, message: "Product not found" });

    if (quantity === 0) {
      cart.items = cart.items.filter(i => !i.productId.equals(productId));
    } else {
      if (quantity > product.stock) return sendResponse(res, { code: StatusCodes.BAD_REQUEST, message: `Cannot exceed stock of ${product.stock}` });
      item.quantity = quantity;
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId", "name price stock");

    return sendResponse(res, { data: populatedCart });

  } catch (error) {
    return sendResponse(res, { code: StatusCodes.INTERNAL_SERVER_ERROR, errors: error.message });
  }
};

// ---------------------- DELETE / CLEAR CART ----------------------
export const deleteCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ consumerId: req.consumer._id });
    if (!cart) return sendResponse(res, { code: StatusCodes.NOT_FOUND, message: "Cart not found" });

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) return sendResponse(res, { code: StatusCodes.BAD_REQUEST, message: "Invalid product ID" });
      cart.items = cart.items.filter(i => !i.productId.equals(productId));
    } else {
      cart.items = [];
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId", "name price stock");

    return sendResponse(res, { data: populatedCart });

  } catch (error) {
    return sendResponse(res, { code: StatusCodes.INTERNAL_SERVER_ERROR, errors: error.message });
  }
};