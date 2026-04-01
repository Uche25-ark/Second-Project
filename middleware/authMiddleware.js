import jwt from "jsonwebtoken";
import Consumer from "../models/Consumer.js";
import Seller from "../models/Seller.js";
import { sendResponse } from "../utils/apiResponse.js";

// ============================
// HELPER: EXTRACT TOKEN
// ============================
const getTokenFromHeader = (req) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

// ============================
// PROTECT CONSUMER ROUTES
// ============================
export const protectConsumer = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Not authorized, no token",
        errors: null,
        data: null,
        statusCode: 401,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const consumer = await Consumer.findById(decoded.id).select("-password");

    if (!consumer) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Consumer not found",
        errors: null,
        data: null,
        statusCode: 404,
      });
    }

    req.consumer = consumer;
    next();

  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Not authorized, token failed",
      errors: error.message,
      data: null,
      statusCode: 401,
    });
  }
};


// ============================
// PROTECT SELLER ROUTES
// ============================
export const protectSeller = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Not authorized, no token",
        errors: null,
        data: null,
        statusCode: 401,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const seller = await Seller.findById(decoded.id).select("-password");

    if (!seller) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Seller not found",
        errors: null,
        data: null,
        statusCode: 404,
      });
    }

    req.seller = seller;
    next();

  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Not authorized, token failed",
      errors: error.message,
      data: null,
      statusCode: 401,
    });
  }
};