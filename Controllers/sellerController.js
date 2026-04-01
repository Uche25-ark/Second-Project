import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";

// Generate JWT Token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });


// ============================
// CREATE SELLER
// ============================
export const createSeller = async (req, res) => {
  try {
    let { sellerName, email, storeAddress, password } = req.body;

    // Normalize
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
        statusCode: StatusCodes.UNPROCESSABLE_ENTITY.code,
        message: "Validation errors",
        errors,
        data: null,
        validation: true,
      });
    }

    const existing = await Seller.findOne({
      $or: [{ email }, { sellerName }],
    });

    if (existing) {
      const field =
        existing.email === email ? "Email" : "Seller name";

      return sendResponse(res, {
        statusCode: StatusCodes.CONFLICT.code,
        message: `${field} already exists`,
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
      statusCode: StatusCodes.CREATED.code,
      message: "Seller created successfully",
      data: {
        _id: seller._id,
        sellerName: seller.sellerName,
        email: seller.email,
        storeAddress: seller.storeAddress,
        token: generateToken(seller._id),
      },
    });

  } catch (error) {
    return sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: "Failed to create seller",
      errors: error.message,
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
        statusCode: StatusCodes.BAD_REQUEST.code,
        message: "Email and password are required",
      });
    }

    const seller = await Seller.findOne({ email });

    if (!seller || !(await seller.comparePassword(password))) {
      return sendResponse(res, {
        statusCode: StatusCodes.UNAUTHORIZED.code,
        message: "Incorrect email or password",
      });
    }

    return sendResponse(res, {
      statusCode: StatusCodes.OK.code,
      message: "Login successful",
      data: {
        _id: seller._id,
        sellerName: seller.sellerName,
        email: seller.email,
        storeAddress: seller.storeAddress,
        token: generateToken(seller._id),
      },
    });

  } catch (error) {
    return sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: "Login failed",
      errors: error.message,
    });
  }
};


// ============================
// GET SELLER (OWN PROFILE)
// ============================
export const getSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return sendResponse(res, {
        statusCode: StatusCodes.NOT_FOUND.code,
        message: "Seller not found",
      });
    }

    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, {
        statusCode: StatusCodes.FORBIDDEN.code,
        message: "Access denied",
      });
    }

    return sendResponse(res, {
      statusCode: StatusCodes.OK.code,
      message: "Seller retrieved successfully",
      data: seller,
    });

  } catch (error) {
    return sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: "Failed to retrieve seller",
      errors: error.message,
    });
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
        statusCode: StatusCodes.NOT_FOUND.code,
        message: "No sellers found",
      });
    }

    return sendResponse(res, {
      statusCode: StatusCodes.OK.code,
      message: "Sellers retrieved successfully",
      data: sellers,
    });

  } catch (error) {
    return sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: "Failed to retrieve sellers",
      errors: error.message,
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
        statusCode: StatusCodes.NOT_FOUND.code,
        message: "Seller not found",
      });
    }

    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, {
        statusCode: StatusCodes.FORBIDDEN.code,
        message: "Access denied",
      });
    }

    Object.assign(seller, req.body);
    await seller.save();

    return sendResponse(res, {
      statusCode: StatusCodes.OK.code,
      message: "Seller updated successfully",
      data: seller,
    });

  } catch (error) {
    return sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: "Failed to update seller",
      errors: error.message,
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
        statusCode: StatusCodes.NOT_FOUND.code,
        message: "Seller not found",
      });
    }

    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, {
        statusCode: StatusCodes.FORBIDDEN.code,
        message: "Access denied",
      });
    }

    await seller.deleteOne();

    return sendResponse(res, {
      statusCode: StatusCodes.OK.code,
      message: "Seller deleted successfully",
    });

  } catch (error) {
    return sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: "Failed to delete seller",
      errors: error.message,
    });
  }
};