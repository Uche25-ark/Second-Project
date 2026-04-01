import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendResponse } from "../utils/apiResponse.js";

// CREATE ORDER / CHECKOUT
export const checkout = async (req, res) => {
  try {
    const consumerId = req.consumer._id;

    const cart = await Cart.findOne({ consumerId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Cart is empty",
        data: null,
        statusCode: 400,
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

    // Clear cart after checkout
    cart.items = [];
    await cart.save();

    const populatedOrder = await order.populate("items.productId", "name price");

    return sendResponse(res, {
      status: true,
      validation: false,
      message: "Checkout successful",
      data: populatedOrder,
      statusCode: 201,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Checkout failed",
      errors: error.message,
      data: null,
      statusCode: 500,
    });
  }
};

// GET ALL ORDERS
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("consumerId", "consumerName email")
      .populate("items.productId", "name price");

    return sendResponse(res, {
      status: true,
      validation: false,
      message: "Orders retrieved successfully",
      data: orders,
      statusCode: 200,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to retrieve orders",
      errors: error.message,
      data: null,
      statusCode: 500,
    });
  }
};

// GET SINGLE ORDER
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("consumerId", "consumerName email")
      .populate("items.productId", "name price");

    if (!order) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Order not found",
        data: null,
        statusCode: 404,
      });
    }

    if (req.consumer._id.toString() !== order.consumerId._id.toString()) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Access denied",
        data: null,
        statusCode: 403,
      });
    }

    return sendResponse(res, {
      status: true,
      validation: false,
      message: "Order retrieved successfully",
      data: order,
      statusCode: 200,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to retrieve order",
      errors: error.message,
      data: null,
      statusCode: 500,
    });
  }
};

// UPDATE ORDER STATUS
export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: "Status is required",
        data: null,
        statusCode: 400,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("items.productId", "name price");

    if (!order) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Order not found",
        data: null,
        statusCode: 404,
      });
    }

    return sendResponse(res, {
      status: true,
      validation: false,
      message: "Order status updated",
      data: order,
      statusCode: 200,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to update order",
      errors: error.message,
      data: null,
      statusCode: 500,
    });
  }
};

// DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Order not found",
        data: null,
        statusCode: 404,
      });
    }

    if (req.consumer._id.toString() !== order.consumerId.toString()) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Access denied",
        data: null,
        statusCode: 403,
      });
    }

    await order.deleteOne();

    return sendResponse(res, {
      status: true,
      validation: false,
      message: "Order cancelled successfully",
      data: null,
      statusCode: 200,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to cancel order",
      errors: error.message,
      data: null,
      statusCode: 500,
    });
  }
};