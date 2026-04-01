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

    if (!cart) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        validation: false,
        message: "Cart not found",
      });
    }

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Cart retrieved successfully",
      data: cart,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to retrieve cart",
      errors: error.message,
    });
  }
};

// ---------------------- ADD ITEM TO CART ----------------------
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 1) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST.code,
        validation: true,
        message: "ProductId and valid quantity are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST.code,
        validation: true,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        validation: false,
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST.code,
        validation: true,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    let cart = await Cart.findOne({ consumerId: req.consumer._id });

    if (!cart) {
      cart = new Cart({
        consumerId: req.consumer._id,
        items: [{ productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(item =>
        item.productId.equals(productId)
      );

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;

        if (newQty > product.stock) {
          return sendResponse(res, {
            code: StatusCodes.BAD_REQUEST.code,
            validation: true,
            message: `Cannot exceed stock of ${product.stock}`,
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
      code: StatusCodes.CREATED.code,
      message: "Item added to cart successfully",
      data: populatedCart,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to add item to cart",
      errors: error.message,
    });
  }
};

// ---------------------- UPDATE CART ----------------------
export const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 0) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST.code,
        validation: true,
        message: "ProductId and valid quantity are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST.code,
        validation: true,
        message: "Invalid product ID",
      });
    }

    const cart = await Cart.findOne({ consumerId: req.consumer._id });
    if (!cart) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        validation: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(item =>
      item.productId.equals(productId)
    );

    if (!item) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        validation: false,
        message: "Product not found in cart",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST.code,
        validation: true,
        message: `Cannot exceed stock of ${product.stock}`,
      });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(i =>
        !i.productId.equals(productId)
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId", "name price stock");

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Cart updated successfully",
      data: populatedCart,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to update cart",
      errors: error.message,
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
        code: StatusCodes.NOT_FOUND.code,
        validation: false,
        message: "Cart not found",
      });
    }

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return sendResponse(res, {
          code: StatusCodes.BAD_REQUEST.code,
          validation: true,
          message: "Invalid product ID",
        });
      }

      const initialLength = cart.items.length;
      cart.items = cart.items.filter(item =>
        !item.productId.equals(productId)
      );

      if (cart.items.length === initialLength) {
        return sendResponse(res, {
          code: StatusCodes.NOT_FOUND.code,
          message: "Product not found in cart",
        });
      }

    } else {
      cart.items = [];
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId", "name price stock");

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Cart cleared/updated successfully",
      data: populatedCart,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to delete cart",
      errors: error.message,
    });
  }
};