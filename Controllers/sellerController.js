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

    sellerName = sellerName?.trim();
    email = email?.toLowerCase().trim();
    storeAddress = storeAddress?.trim();

    const errors = [];

    if (!sellerName) errors.push("sellerName is required");
    if (!email) errors.push("email is required");
    if (!storeAddress) errors.push("storeAddress is required");
    if (!password) errors.push("password is required");

    if (email && !/^\S+@\S+\.\S+$/.test(email))
      errors.push("email is not valid");

    if (password && password.length < 6)
      errors.push("password must be at least 6 characters");

    if (errors.length > 0) {
      return sendResponse(res, {
        code: 422, // ✅ use 'code' here
        status: false,
        validation: true,
        message: "Validation errors",
        errors,
        data: null,
      });
    }

    const existing = await Seller.findOne({
      $or: [{ email }, { sellerName }],
    });

    if (existing) {
      const field = existing.email === email ? "Email" : "Seller name";
      return sendResponse(res, {
        code: 409, // ✅ use 'code' here
        status: false,
        validation: false,
        message: `${field} already exists`,
        errors: null,
        data: null,
      });
    }

    const seller = await Seller.create({
      sellerName,
      email,
      storeAddress,
      password,
    });

    return sendResponse(res, {
      code: 201, // ✅ correct status code
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
      code: 500,
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

    if (!email || !password) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: "Email and password are required",
        errors: null,
        data: null,
        statusCode: 400,
      });
    }

    const seller = await Seller.findOne({ email });

    if (!seller || !(await seller.comparePassword(password))) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Incorrect email or password",
        errors: null,
        data: null,
        statusCode: 401,
      });
    }

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
      statusCode: 200,
    });

  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Login failed",
      errors: error.message,
      data: null,
      statusCode: 500,
    });
  }
};


// ============================
// GET SELLER (OWN PROFILE)
// ============================
export const getSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).select("-password");

    if (!seller) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Seller not found",
        data: null,
        errors: null,
        statusCode: 404,
      });
    }

    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Access denied",
        data: null,
        errors: null,
        statusCode: 403,
      });
    }

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Seller retrieved successfully",
      data: seller,
      errors: null,
      statusCode: 200,
    });

  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to retrieve seller",
      errors: error.message,
      data: null,
      statusCode: 500,
    });
  }
};


// ============================
// ✅ GET ALL SELLERS (KEPT)
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
        errors: null,
        statusCode: 404,
      });
    }

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Sellers retrieved successfully",
      data: sellers,
      errors: null,
      statusCode: 200,
    });

  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to retrieve sellers",
      errors: error.message,
      data: null,
      statusCode: 500,
    });
  }
};


// ============================
// UPDATE SELLER
// ============================
export const updateSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Seller not found",
        data: null,
        errors: null,
        statusCode: 404,
      });
    }

    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Access denied",
        data: null,
        errors: null,
        statusCode: 403,
      });
    }

    Object.assign(seller, req.body);
    await seller.save();

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Seller updated successfully",
      data: seller,
      errors: null,
      statusCode: 200,
    });

  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to update seller",
      errors: error.message,
      data: null,
      statusCode: 500,
    });
  }
};


// ============================
// DELETE SELLER
// ============================
export const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Seller not found",
        data: null,
        errors: null,
        statusCode: 404,
      });
    }

    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Access denied",
        data: null,
        errors: null,
        statusCode: 403,
      });
    }

    await seller.deleteOne();

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Seller deleted successfully",
      data: null,
      errors: null,
      statusCode: 200,
    });

  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to delete seller",
      errors: error.message,
      data: null,
      statusCode: 500,
    });
  }
};