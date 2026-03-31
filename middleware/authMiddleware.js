import jwt from "jsonwebtoken";
import Consumer from "../models/Consumer.js";
import Seller from "../models/Seller.js";
import { sendResponse } from "../utils/apiResponse.js";

// ============================
// PROTECT CONSUMER ROUTES
// ============================
export const protectConsumer = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const consumer = await Consumer.findById(decoded.id).select("-password");
      if (!consumer) {
        return sendResponse(res, {
          status: false,
          validation: false,
          message: "Consumer not found",
          errors: null,
          data: null,
        });
      }

      req.consumer = consumer;
      return next();
    } else {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Not authorized, no token",
        errors: null,
        data: null,
      });
    }
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Not authorized, token failed",
      errors: error.message,
      data: null,
    });
  }
};

// ============================
// PROTECT SELLER ROUTES
// ============================
export const protectSeller = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const seller = await Seller.findById(decoded.id).select("-password");
      if (!seller) {
        return sendResponse(res, {
          status: false,
          validation: false,
          message: "Seller not found",
          errors: null,
          data: null,
        });
      }

      req.seller = seller;
      return next();
    } else {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Not authorized, no token",
        errors: null,
        data: null,
      });
    }
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Not authorized, token failed",
      errors: error.message,
      data: null,
    });
  }
};