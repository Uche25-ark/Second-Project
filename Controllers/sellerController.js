import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";
import { validateFields } from "../utils/validator.js";

// Generate JWT Token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });


// CREATE SELLER
export const createSeller = async (req, res) => {
  try {
    let { sellerName, email, password, storeAddress } = req.body;

    // Validate input fields
    const errors = validateFields([
      { name: "sellerName", value: sellerName, type: "string", required: true },
      { name: "email", value: email, type: "string", required: true, pattern: /^\S+@\S+\.\S+$/ },
      { name: "password", value: password, type: "string", required: true, minLength: 6 },
      { name: "storeAddress", value: storeAddress, type: "string", required: true },
    ]);

    if (errors.length) {
      return sendResponse(res, {
        code: StatusCodes.UNPROCESSABLE_ENTITY,
        validation: true,
        message: "Validation errors",
        errors,
      });
    }

    email = email.toLowerCase().trim();

    // Check for existing seller
    const existing = await Seller.findOne({ $or: [{ email }, { sellerName }] });
    if (existing) {
      return sendResponse(res, {
        code: StatusCodes.CONFLICT,
        message: existing.email === email ? "Email already exists" : "Seller name already exists",
      });
    }

    // Create seller
    const seller = await Seller.create({ sellerName, email, password, storeAddress });

    // ✅ Remove password from response
    const sellerData = seller.toObject();
    delete sellerData.password;

    return sendResponse(res, {
      code: StatusCodes.CREATED,
      message: "Seller created successfully",
      data: sellerData, 
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to create seller",
      errors: error.message,
    });
  }
};

// LOGIN SELLER
export const loginSeller = async (req, res) => {
  try {
    let { email, password } = req.body;

    const errors = validateFields([
      { name: "email", value: email, required: true },
      { name: "password", value: password, required: true },
    ]);

    if (errors.length) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        validation: true,
        message: "Validation errors",
        errors,
      });
    }

    email = email.toLowerCase().trim();

    //include password only for comparison
    const seller = await Seller.findOne({ email }).select("+password");

    if (!seller || !(await seller.comparePassword(password))) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: "Invalid Email or Password",
      });
    }

    //REMOVE PASSWORD
    const sellerData = seller.toObject();
    delete sellerData.password;

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Login successful",
      data: {
        ...sellerData,
        token: generateToken(seller._id),
      },
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to login",
      errors: error.message,
    });
  }
};

// GET SELLER
export const getSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Seller not found",
      });
    }

    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN,
        message: "Access denied",
      });
    }

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Seller retrieved successfully",
      data: seller,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve seller",
      errors: error.message,
    });
  }
};

// GET ALL SELLERS
export const getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Sellers retrieved successfully",
      data: sellers,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve sellers",
      errors: error.message,
    });
  }
};

// UPDATE SELLER
export const updateSeller = async (req, res) => {
  try {
    const { id } = req.params; // get seller ID from URL
    if (!id) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: "Seller ID is required",
      });
    }

    // Ensure the logged-in seller is attached by middleware
    if (!req.seller) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: "Not authorized",
      });
    }

    // Fetch seller including password (if updating)
    const seller = await Seller.findById(id).select("+password");
    if (!seller) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Seller not found",
      });
    }

    // Only allow logged-in seller to update their own info
    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN,
        message: "Access denied",
      });
    }

    const updates = req.body;

    // Validate fields if present
    const errors = validateFields([
      { name: "email", value: updates.email, pattern: /^\S+@\S+\.\S+$/ },
      { name: "password", value: updates.password, minLength: 6 },
    ]);

    if (errors.length) {
      return sendResponse(res, {
        code: StatusCodes.UNPROCESSABLE_ENTITY,
        validation: true,
        message: "Validation errors",
        errors,
      });
    }

    // Check email uniqueness
    if (updates.email) {
      const exists = await Seller.findOne({
        email: updates.email.toLowerCase().trim(),
        _id: { $ne: seller._id },
      });
      if (exists) {
        return sendResponse(res, {
          code: StatusCodes.CONFLICT,
          message: "Email already exists",
        });
      }
      seller.email = updates.email.toLowerCase().trim();
    }

    // Update only provided fields
    if (updates.sellerName) seller.sellerName = updates.sellerName;
    if (updates.password) seller.password = updates.password;
    if (updates.storeAddress) seller.storeAddress = updates.storeAddress;

    await seller.save();

    // Remove password before sending response
    const sellerData = seller.toObject();
    delete sellerData.password;

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Seller updated successfully",
      data: sellerData,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to update seller",
      errors: error.message,
    });
  }
};

// DELETE SELLER
export const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Seller not found",
      });
    }

    if (req.seller._id.toString() !== seller._id.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN,
        message: "Access denied",
      });
    }

    await seller.deleteOne();

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Seller deleted successfully",
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to delete seller",
      errors: error.message,
    });
  }
};