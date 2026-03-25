// controllers/orderController.js
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ✅ CREATE ORDER / CHECKOUT
export const checkout = async (req, res) => {
  try {
    const consumerId = req.consumer._id;

    const cart = await Cart.findOne({ consumerId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let total = 0;
    const orderItems = cart.items.map(item => {
      const price = item.productId.price;
      const quantity = item.quantity;
      total += price * quantity;

      return {
        productId: item.productId._id,
        quantity,
        price
      };
    });

    const order = await Order.create({
      consumerId,
      items: orderItems,
      total,
      status: "pending"
    });

    // Clear cart after checkout
    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: "Checkout failed", error: error.message });
  }
};

// ✅ GET ALL ORDERS
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

// ✅ GET SINGLE ORDER
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("consumerId", "consumerName email")
      .populate("items.productId", "name price");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE ORDER STATUS
export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE / CANCEL ORDER
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};