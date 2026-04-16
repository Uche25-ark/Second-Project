import jwt from "jsonwebtoken";
import Consumer from "../models/Consumer.js";
import Seller from "../models/Seller.js";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";

// HELPER: EXTRACT TOKEN
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

// PROTECT CONSUMER
export const protectConsumer = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: "Not authorized, no token",
      });
    }

    if (!process.env.JWT_SECRET) {
      return sendResponse(res, {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "JWT secret not configured",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const consumer = await Consumer.findById(decoded.id).select("-password");

    if (!consumer) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Consumer not found",
      });
    }

    req.consumer = consumer;
    next();
  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: "Not authorized, token failed",
      errors: error?.message,
    });
  }
};

// PROTECT SELLER
export const protectSeller = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: "Not authorized, no token",
      });
    }

    if (!process.env.JWT_SECRET) {
      return sendResponse(res, {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "JWT secret not configured",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const seller = await Seller.findById(decoded.id).select("-password");

    if (!seller) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Seller not found",
      });
    }

    req.seller = seller;
    next();
  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: "Not authorized, token failed",
      errors: error?.message,
    });
  }
};