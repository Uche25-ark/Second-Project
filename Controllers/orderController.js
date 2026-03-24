import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// CHECKOUT
export const checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ consumerId: req.consumer._id })
      .populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    // Validate stock
    for (const item of cart.items) {
      if (!item.productId) {
        return res.status(400).json({
          message: "Some products no longer exist"
        });
      }

      if (item.quantity > item.productId.stock) {
        return res.status(400).json({
          message: `Not enough stock for ${item.productId.name}`
        });
      }
    }

    // Create order items
    const items = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price,
    }));

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      consumerId: req.consumer._id,
      items,
      total,
      status: "pending"
    });

    // Reduce stock
    for (const item of cart.items) {
      item.productId.stock -= item.quantity;
      await item.productId.save();
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET ALL ORDERS
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("consumerId", "consumerName email")
      .populate("items.productId", "name price");

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET SINGLE ORDER
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("consumerId", "consumerName email")
      .populate("items.productId", "name price");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// UPDATE ORDER STATUS
export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required"
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(order);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// DELETE / CANCEL ORDER
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      message: "Order cancelled successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};