import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// CREATE SELLER (SIGNUP + AUTO LOGIN)
export const createSeller = async (req, res) => {
  try {
    let { sellerName, email, storeAddress, loginId, password } = req.body;

    // Normalize inputs
    sellerName = sellerName?.trim();
    email = email?.toLowerCase().trim();
    loginId = loginId?.trim();
    storeAddress = storeAddress?.trim();

    // Validation
    if (!sellerName || !email || !storeAddress || !loginId || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check duplicates
    const existing = await Seller.findOne({ $or: [{ email }, { sellerName }, { loginId }] });
    if (existing) {
      if (existing.email === email) return res.status(400).json({ message: "Email already exists" });
      if (existing.sellerName === sellerName) return res.status(400).json({ message: "Seller name already exists" });
      if (existing.loginId === loginId) return res.status(400).json({ message: "Login ID already exists" });
    }

    const seller = await Seller.create({ sellerName, email, storeAddress, loginId, password });

    res.status(201).json({
      _id: seller._id,
      sellerName: seller.sellerName,
      email: seller.email,
      token: generateToken(seller._id),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// LOGIN SELLER (email OR loginId)
export const loginSeller = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim();

    if (!email || !password) return res.status(400).json({ message: "Email/LoginId and password required" });

    const seller = await Seller.findOne({ $or: [{ email }, { loginId: email }] });
    if (!seller) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await seller.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      _id: seller._id,
      sellerName: seller.sellerName,
      email: seller.email,
      token: generateToken(seller._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET / SINGLE / UPDATE / DELETE SELLER
export const getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json(seller);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "Duplicate field value detected" });
    res.status(400).json({ message: error.message });
  }
};

export const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndDelete(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json({ message: "Seller deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};