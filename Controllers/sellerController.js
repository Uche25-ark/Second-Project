import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/apiResponse.js";

// Generate JWT Token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ============================
// CREATE SELLER
// ============================
export const createSeller = async (req, res) => {
  try {
    let { sellerName, email, storeAddress, password } = req.body;

    // Normalize inputs
    sellerName = sellerName?.trim();
    email = email?.toLowerCase().trim();
    storeAddress = storeAddress?.trim();

    const errors = [];

    // Required fields
    if (!sellerName) errors.push("sellerName is required");
    if (!email) errors.push("email is required");
    if (!storeAddress) errors.push("storeAddress is required");
    if (!password) errors.push("password is required");

    // Data types
    if (sellerName && typeof sellerName !== "string") errors.push("sellerName must be a string");
    if (email && typeof email !== "string") errors.push("email must be a string");
    if (storeAddress && typeof storeAddress !== "string") errors.push("storeAddress must be a string");
    if (password && typeof password !== "string") errors.push("password must be a string");

    // Format checks
    if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push("email is not valid");
    if (password && password.length < 6) errors.push("password must be at least 6 characters");

    if (errors.length > 0) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Validation errors",
        errors,
        data: null,
      });
    }

    // Check duplicates
    const existing = await Seller.findOne({
      $or: [{ email }, { sellerName }],
    });

    if (existing) {
      const duplicateField = existing.email === email ? "Email" : "Seller name";
      return sendResponse(res, {
        status: false,
        validation: false,
        message: `${duplicateField} already exists`,
        errors: null,
        data: null,
      });
    }

    const seller = await Seller.create({ sellerName, email, storeAddress, password });

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Seller created successfully",
      data: {
        _id: seller._id,
        sellerName: seller.sellerName,
        email: seller.email,
        storeAddress: seller.storeAddress,
        token: generateToken(seller._id),
      },
      errors: null,
    });

  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to create seller",
      errors: error.message,
      data: null,
    });
  }
};

// ============================
// LOGIN SELLER
// ============================
export const loginSeller = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim();

    // Check if fields are missing
    if (!email || !password) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Email and password are required",
        errors: null,
        data: null,
      });
    }

    // Find seller by email
    const seller = await Seller.findOne({ email });

    // If no seller or password doesn't match, return generic error
    if (!seller || !(await seller.comparePassword(password))) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Incorrect email or password",
        errors: null,
        data: null,
      });
    }

    // Successful login
    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Login successful",
      data: {
        _id: seller._id,
        sellerName: seller.sellerName,
        email: seller.email,
        storeAddress: seller.storeAddress,
        token: generateToken(seller._id),
      },
      errors: null,
    });

  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Login failed",
      errors: error.message,
      data: null,
    });
  }
};

// ============================
// GET SELLER (OWN PROFILE)
// ============================
export const getSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return sendResponse(res, { status: false, message: "Seller not found", data: null });

    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, { status: false, message: "Access denied", data: null });
    }

    return sendResponse(res, { status: true, message: "Seller retrieved successfully", data: seller });
  } catch (error) {
    return sendResponse(res, { status: false, message: "Failed to retrieve seller", errors: error.message, data: null });
  }
};

// ============================
// GET ALL SELLERS
// ============================
export const getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select("-password");

    if (!sellers || sellers.length === 0) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "No sellers found",
        data: null,
      });
    }

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Sellers retrieved successfully",
      data: sellers,
    });

  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to retrieve sellers",
      errors: error.message,
      data: null,
    });
  }
};

// ============================
// UPDATE SELLER
// ============================
export const updateSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return sendResponse(res, { status: false, message: "Seller not found", data: null });

    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, { status: false, message: "Access denied", data: null });
    }

    Object.assign(seller, req.body);
    await seller.save();

    return sendResponse(res, { status: true, message: "Seller updated successfully", data: seller });
  } catch (error) {
    return sendResponse(res, { status: false, message: "Failed to update seller", errors: error.message, data: null });
  }
};

// ============================
// DELETE SELLER
// ============================
export const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return sendResponse(res, { status: false, message: "Seller not found", data: null });

    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, { status: false, message: "Access denied", data: null });
    }

    await seller.deleteOne();
    return sendResponse(res, { status: true, message: "Seller deleted successfully", data: null });
  } catch (error) {
    return sendResponse(res, { status: false, message: "Failed to delete seller", errors: error.message, data: null });
  }
};