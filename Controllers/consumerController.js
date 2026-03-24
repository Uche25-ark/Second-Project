import Consumer from "../models/Consumer.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// CREATE CONSUMER (SIGNUP + AUTO LOGIN)
export const createConsumer = async (req, res) => {
  try {
    let { consumerName, email, password, phoneNumber, address } = req.body;

    // Normalize inputs
    consumerName = consumerName?.trim();
    email = email?.toLowerCase().trim();
    phoneNumber = phoneNumber?.trim();
    address = address?.trim();

    // Validation
    if (!consumerName || !email || !password || !phoneNumber || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check duplicates
    const existing = await Consumer.findOne({
      $or: [{ email }, { consumerName }],
    });

    if (existing) {
      if (existing.email === email) return res.status(400).json({ message: "Email already exists" });
      if (existing.consumerName === consumerName) return res.status(400).json({ message: "Name already exists" });
    }

    const consumer = await Consumer.create({ consumerName, email, password, phoneNumber, address });

    res.status(201).json({
      _id: consumer._id,
      consumerName: consumer.consumerName,
      email: consumer.email,
      token: generateToken(consumer._id),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// LOGIN CONSUMER
export const loginConsumer = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim();

    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const consumer = await Consumer.findOne({ email });
    if (!consumer) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await consumer.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      _id: consumer._id,
      consumerName: consumer.consumerName,
      email: consumer.email,
      token: generateToken(consumer._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL / SINGLE / UPDATE / DELETE CONSUMER
export const getConsumers = async (req, res) => {
  try {
    const consumers = await Consumer.find();
    res.json(consumers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConsumer = async (req, res) => {
  try {
    const consumer = await Consumer.findById(req.params.id);
    if (!consumer) return res.status(404).json({ message: "Consumer not found" });
    res.json(consumer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateConsumer = async (req, res) => {
  try {
    const consumer = await Consumer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!consumer) return res.status(404).json({ message: "Consumer not found" });
    res.json(consumer);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "Duplicate field value detected" });
    res.status(400).json({ message: error.message });
  }
};

export const deleteConsumer = async (req, res) => {
  try {
    const consumer = await Consumer.findByIdAndDelete(req.params.id);
    if (!consumer) return res.status(404).json({ message: "Consumer not found" });
    res.json({ message: "Consumer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};