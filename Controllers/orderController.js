import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";

// ============================
// CHECKOUT / CREATE ORDER
// ============================
export const checkout = async (req, res) => {
  try {
    const consumerId = req.consumer._id;

    const cart = await Cart.findOne({ consumerId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST.code,
        message: "Cart is empty",
      });
    }

    let total = 0;

    const orderItems = cart.items.map(item => {
      const price = item.productId.price;
      const quantity = item.quantity;

      total += price * quantity;

      return {
        productId: item.productId._id,
        quantity,
        price,
      };
    });

    const order = await Order.create({
      consumerId,
      items: orderItems,
      total,
      status: "pending",
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    const populatedOrder = await order.populate("items.productId", "name price");

    return sendResponse(res, {
      code: StatusCodes.CREATED.code,
      message: "Checkout successful",
      data: populatedOrder,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Checkout failed",
      errors: error.message,
    });
  }
};

// ============================
// GET ALL ORDERS
// ============================
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("consumerId", "consumerName email")
      .populate("items.productId", "name price");

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Orders retrieved successfully",
      data: orders,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to retrieve orders",
      errors: error.message,
    });
  }
};

// ============================
// GET SINGLE ORDER
// ============================
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("consumerId", "consumerName email")
      .populate("items.productId", "name price");

    if (!order) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        message: "Order not found",
      });
    }

    if (req.consumer._id.toString() !== order.consumerId._id.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN.code,
        message: "Access denied",
      });
    }

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Order retrieved successfully",
      data: order,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to retrieve order",
      errors: error.message,
    });
  }
};

// ============================
// UPDATE ORDER STATUS
// ============================
export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST.code,
        validation: true,
        message: "Status is required",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("items.productId", "name price");

    if (!order) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        message: "Order not found",
      });
    }

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Order status updated",
      data: order,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to update order",
      errors: error.message,
    });
  }
};

// ============================
// DELETE ORDER
// ============================
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        message: "Order not found",
      });
    }

    if (req.consumer._id.toString() !== order.consumerId.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN.code,
        message: "Access denied",
      });
    }

    await order.deleteOne();

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Order cancelled successfully",
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to cancel order",
      errors: error.message,
    });
  }
};