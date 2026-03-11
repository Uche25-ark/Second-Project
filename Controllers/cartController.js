import Cart from "../models/Cart.js";

// GET - VIEW CART
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ consumerId: req.params.consumerId })
      .populate("items.productId", "name price");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - ADD ITEM TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || quantity == null) {
      return res.status(400).json({ message: "ProductId and quantity are required" });
    }

    let cart = await Cart.findOne({ consumerId: req.params.consumerId });

    if (!cart) {
      cart = new Cart({
        consumerId: req.params.consumerId,
        items: [{ productId, quantity }]
      });
    } else {
      // Check if item already exists
      const existingItem = cart.items.find(
        item => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity; // increment quantity
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();

    res.status(201).json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH - UPDATE QUANTITY
export const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      return res.status(400).json({ message: "ProductId and quantity are required" });
    }

    const cart = await Cart.findOne({ consumerId: req.params.consumerId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      item => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ITEM FROM CART
export const deleteCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ consumerId: req.params.consumerId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (productId) {
      // Remove single product
      cart.items = cart.items.filter(
        item => item.productId.toString() !== productId
      );
    } else {
      // If no productId, clear the entire cart
      cart.items = [];
    }

    await cart.save();
    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};