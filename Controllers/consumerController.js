import Consumer from "../models/Consumer.js";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/apiResponse.js";

// Generate JWT Token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ============================
// CREATE CONSUMER
// ============================
export const createConsumer = async (req, res) => {
  try {
    let { consumerName, email, password, phoneNumber, address } = req.body;

    // Normalize inputs
    consumerName = consumerName?.trim();
    email = email?.toLowerCase().trim();
    phoneNumber = phoneNumber?.trim();
    address = address?.trim();

    const errors = [];

    // Required fields
    if (!consumerName) errors.push("consumerName is required");
    if (!email) errors.push("email is required");
    if (!password) errors.push("password is required");
    if (!phoneNumber) errors.push("phoneNumber is required");
    if (!address) errors.push("address is required");

    // Format checks
    if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push("email is not valid");
    if (password && password.length < 6) errors.push("password must be at least 6 characters");
    if (phoneNumber && !/^\d{10,15}$/.test(phoneNumber)) errors.push("phoneNumber must be 10-15 digits");

    if (errors.length > 0) {
      return sendResponse(res, {
        status: false,
        validation: true,
        message: "Validation errors",
        errors,
        data: null,
      });
    }

    // Check duplicates
    const existing = await Consumer.findOne({
      $or: [{ email }, { consumerName }],
    });

    if (existing) {
      const duplicateField = existing.email === email ? "Email" : "Consumer name";
      return sendResponse(res, {
        status: false,
        validation: false,
        message: `${duplicateField} already exists`,
        errors: null,
        data: null,
      });
    }

    const consumer = await Consumer.create({ consumerName, email, password, phoneNumber, address });

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Consumer created successfully",
      data: {
        _id: consumer._id,
        consumerName: consumer.consumerName,
        email: consumer.email,
        phoneNumber: consumer.phoneNumber,
        address: consumer.address,
        token: generateToken(consumer._id),
      },
      errors: null,
    });
  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to create consumer",
      errors: error.message,
      data: null,
    });
  }
};

// ============================
// LOGIN CONSUMER
// ============================
export const loginConsumer = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim();

    // Check missing fields
    if (!email || !password) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Email and password are required",
        errors: null,
        data: null,
      });
    }

    const consumer = await Consumer.findOne({ email });
    if (!consumer || !(await consumer.comparePassword(password))) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "Incorrect email or password",
        errors: null,
        data: null,
      });
    }

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Login successful",
      data: {
        _id: consumer._id,
        consumerName: consumer.consumerName,
        email: consumer.email,
        phoneNumber: consumer.phoneNumber,
        address: consumer.address,
        token: generateToken(consumer._id),
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
// GET CONSUMER (OWN PROFILE)
// ============================
export const getConsumer = async (req, res) => {
  try {
    const consumer = await Consumer.findById(req.params.id);
    if (!consumer)
      return sendResponse(res, { status: false, validation: false, message: "Consumer not found", errors: null, data: null });

    if (req.consumer._id.toString() !== consumer._id.toString())
      return sendResponse(res, { status: false, validation: false, message: "Access denied", errors: null, data: null });

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Consumer retrieved successfully",
      data: {
        _id: consumer._id,
        consumerName: consumer.consumerName,
        email: consumer.email,
        phoneNumber: consumer.phoneNumber,
        address: consumer.address,
      },
      errors: null,
    });
  } catch (error) {
    return sendResponse(res, { status: false, validation: false, message: "Failed to retrieve consumer", errors: error.message, data: null });
  }
};

// ============================
// GET ALL CONSUMERS
// ============================
export const getConsumers = async (req, res) => {
  try {
    const consumers = await Consumer.find().select("-password");

    if (!consumers || consumers.length === 0) {
      return sendResponse(res, {
        status: false,
        validation: false,
        message: "No consumers found",
        data: null,
      });
    }

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Consumers retrieved successfully",
      data: consumers,
    });

  } catch (error) {
    return sendResponse(res, {
      status: false,
      validation: false,
      message: "Failed to retrieve consumers",
      errors: error.message,
      data: null,
    });
  }
};

// ============================
// UPDATE CONSUMER (OWN PROFILE)
// ============================
export const updateConsumer = async (req, res) => {
  try {
    const consumer = await Consumer.findById(req.params.id);
    if (!consumer)
      return sendResponse(res, { status: false, validation: false, message: "Consumer not found", errors: null, data: null });

    if (req.consumer._id.toString() !== consumer._id.toString())
      return sendResponse(res, { status: false, validation: false, message: "Access denied", errors: null, data: null });

    Object.assign(consumer, req.body);
    await consumer.save();

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Consumer updated successfully",
      data: {
        _id: consumer._id,
        consumerName: consumer.consumerName,
        email: consumer.email,
        phoneNumber: consumer.phoneNumber,
        address: consumer.address,
      },
      errors: null,
    });
  } catch (error) {
    const msg = error.code === 11000 ? "Duplicate field value detected" : error.message;
    return sendResponse(res, { status: false, validation: false, message: msg, errors: error.message, data: null });
  }
};

// ============================
// DELETE CONSUMER (OWN PROFILE)
// ============================
export const deleteConsumer = async (req, res) => {
  try {
    const consumer = await Consumer.findById(req.params.id);
    if (!consumer)
      return sendResponse(res, { status: false, validation: false, message: "Consumer not found", errors: null, data: null });

    if (req.consumer._id.toString() !== consumer._id.toString())
      return sendResponse(res, { status: false, validation: false, message: "Access denied", errors: null, data: null });

    await consumer.deleteOne();

    return sendResponse(res, {
      status: true,
      validation: true,
      message: "Consumer deleted successfully",
      data: null,
      errors: null,
    });
  } catch (error) {
    return sendResponse(res, { status: false, validation: false, message: "Failed to delete consumer", errors: error.message, data: null });
  }
};