import jwt from "jsonwebtoken";
import Consumer from "../models/Consumer.js";
import Seller from "../models/Seller.js";

export const protectConsumer = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.consumer = await Consumer.findById(decoded.id).select("-password");

      if (!req.consumer) {
        return res.status(401).json({ message: "Consumer not found" });
      }

      next(); 
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const protectSeller = async (req, res, next) => {
  let token;
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.seller = await Seller.findById(decoded.id).select("-password");
      if (!req.seller) return res.status(401).json({ message: "Seller not found" });
      next();
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};