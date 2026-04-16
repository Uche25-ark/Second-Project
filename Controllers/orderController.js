import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";
import { validateFields } from "../utils/validator.js";


// CHECKOUT / CREATE ORDER
export const checkout = async (req, res) => {
  try {
    const consumerId = req.consumer._id;

    const cart = await Cart.findOne({ consumerId })
      .populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
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

  const formattedOrder = {
  orderId: order._id.toString(),
  consumerId: order.consumerId.toString(),
  items: order.items.map(item => ({
    productId: item.productId.toString(),
    quantity: item.quantity,
    price: item.price * item.quantity,
  })),
  totalPrice: order.total,
  status: order.status,
};

    return sendResponse(res, {
      code: StatusCodes.CREATED,
      message: "Order created successfully",
      data: formattedOrder,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: error.message,
    });
  }
};

// GET ALL ORDERS
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("consumerId", "consumerName email")
      .populate("items.productId", "name price");

    return sendResponse(res, { data: orders });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: error.message,
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
      return sendResponse(res, { code: StatusCodes.NOT_FOUND });
    }

    // Authorization (consumer owns order)
    if (req.consumer._id.toString() !== order.consumerId._id.toString()) {
      return sendResponse(res, { code: StatusCodes.FORBIDDEN });
    }

    return sendResponse(res, { data: order });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: error.message,
    });
  }
};

// UPDATE ORDER
export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;

    const errors = validateFields([
      { name: "status", value: status, required: true },
    ]);

    if (errors.length) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        validation: true,
        errors,
      });
    }

    // First find order
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Order not found",
      });
    }

    // Authorization check
    if (req.consumer._id.toString() !== order.consumerId.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN,
        message: "Access denied",
      });
    }

    // Update status
    order.status = status;
    await order.save();

    // Clean response
    const formattedOrder = {
      orderId: order._id.toString(),
      consumerId: order.consumerId.toString(),
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: order.total,
      status: order.status,
    };

    return sendResponse(res, {
      message: "Order updated successfully",
      data: formattedOrder,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: error.message,
    });
  }
};


// DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendResponse(res, { code: StatusCodes.NOT_FOUND });
    }

    // Authorization
    if (req.consumer._id.toString() !== order.consumerId.toString()) {
      return sendResponse(res, { code: StatusCodes.FORBIDDEN });
    }

    await order.deleteOne();

    return sendResponse(res, {
      message: "Order cancelled successfully",
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: error.message,
    });
  }
};