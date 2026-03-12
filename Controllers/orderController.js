import Cart from "../models/Cart.js"
import Order from "../models/Order.js";

//POST -CHECKOUT
export const checkout = async (req, res) => {
    try {
    const cart = await Cart.findOne({consumerId: req.params.consumerId})
    .populate("items.productId");

    if (!cart)
        return res.status(404).json({message: "Cart not Found"});

    const items = cart.items
    .filter(item => item.productId)
    .map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price
    }));

    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const order = await Order.create({
        consumerId: req.params.consumerId,
        items,
        total,
        status: "pending"
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};

//GET ALL ORDER
export const getOrders = async (req, res) =>{
    try {
        const orders = await Order.find()
        res.json(orders);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};

//GET SINGLE ORDER
export const getOrder = async (req, res)=>{
    try {
        const order = await Order.findById(req.params.id)

         if (!order)
        return res.status(404).json({message: "Order not Found"});

        res.json(order);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};

//PATCH - UPDATE ORDER
export const updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
        res.json(order);
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};

//DELETE ORDER
export const deleteOrder = async (req, res) =>{
    try {
        await Order.findByIdAndDelete(req.params.id);
        if (!Order) {
            return res.status(404).json({message: "Order not found"})
        }
        res.json({ message: "Order Cancelled"});
    }catch (error) {
        res.status(500).json({message:error.message});
    }
};