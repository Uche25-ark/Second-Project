import Consumer from "../models/Consumer.js";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";

// Generate JWT Token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ============================
// CREATE CONSUMER
// ============================
export const createConsumer = async (req, res) => {
  try {
    let { consumerName, email, password, phoneNumber, address } = req.body;

    consumerName = consumerName?.trim();
    email = email?.toLowerCase().trim();
    phoneNumber = phoneNumber?.trim();
    address = address?.trim();

    const errors = [];

    if (!consumerName) errors.push("consumerName is required");
    if (!email) errors.push("email is required");
    if (!password) errors.push("password is required");
    if (!phoneNumber) errors.push("phoneNumber is required");
    if (!address) errors.push("address is required");

    if (email && !/^\S+@\S+\.\S+$/.test(email))
      errors.push("email is not valid");

    if (password && password.length < 6)
      errors.push("password must be at least 6 characters");

    if (phoneNumber && !/^\d{10,15}$/.test(phoneNumber))
      errors.push("phoneNumber must be 10-15 digits");

    if (errors.length > 0) {
      return sendResponse(res, {
        code: StatusCodes.UNPROCESSABLE_ENTITY.code,
        validation: true,
        message: "Validation errors",
        errors,
      });
    }

    const existing = await Consumer.findOne({
      $or: [{ email }, { consumerName }],
    });

    if (existing) {
      const duplicateField =
        existing.email === email ? "Email" : "Consumer name";

      return sendResponse(res, {
        code: StatusCodes.CONFLICT.code,
        message: `${duplicateField} already exists`,
      });
    }

    const consumer = await Consumer.create({
      consumerName,
      email,
      password,
      phoneNumber,
      address,
    });

    return sendResponse(res, {
      code: StatusCodes.CREATED.code,
      message: "Consumer created successfully",
      data: {
        _id: consumer._id,
        consumerName: consumer.consumerName,
        email: consumer.email,
        phoneNumber: consumer.phoneNumber,
        address: consumer.address,
        token: generateToken(consumer._id),
      },
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to create consumer",
      errors: error.message,
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

    if (!email || !password) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST.code,
        message: "Email and password are required",
      });
    }

    const consumer = await Consumer.findOne({ email });

    if (!consumer || !(await consumer.comparePassword(password))) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED.code,
        message: "Incorrect email or password",
      });
    }

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Login successful",
      data: {
        _id: consumer._id,
        consumerName: consumer.consumerName,
        email: consumer.email,
        phoneNumber: consumer.phoneNumber,
        address: consumer.address,
        token: generateToken(consumer._id),
      },
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Login failed",
      errors: error.message,
    });
  }
};

// ============================
// GET CONSUMER (OWN PROFILE)
// ============================
export const getConsumer = async (req, res) => {
  try {
    const consumer = await Consumer.findById(req.params.id);

    if (!consumer) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        message: "Consumer not found",
      });
    }

    if (req.consumer._id.toString() !== consumer._id.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN.code,
        message: "Access denied",
      });
    }

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Consumer retrieved successfully",
      data: {
        _id: consumer._id,
        consumerName: consumer.consumerName,
        email: consumer.email,
        phoneNumber: consumer.phoneNumber,
        address: consumer.address,
      },
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to retrieve consumer",
      errors: error.message,
    });
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
        code: StatusCodes.NOT_FOUND.code,
        message: "No consumers found",
      });
    }

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Consumers retrieved successfully",
      data: consumers,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to retrieve consumers",
      errors: error.message,
    });
  }
};

// ============================
// UPDATE CONSUMER
// ============================
export const updateConsumer = async (req, res) => {
  try {
    const consumer = await Consumer.findById(req.params.id);

    if (!consumer) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        message: "Consumer not found",
      });
    }

    if (req.consumer._id.toString() !== consumer._id.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN.code,
        message: "Access denied",
      });
    }

    Object.assign(consumer, req.body);
    await consumer.save();

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Consumer updated successfully",
      data: consumer,
    });

  } catch (error) {
    const msg =
      error.code === 11000
        ? "Duplicate field value detected"
        : error.message;

    return sendResponse(res, {
      code: StatusCodes.BAD_REQUEST.code,
      message: msg,
      errors: error.message,
    });
  }
};

// ============================
// DELETE CONSUMER
// ============================
export const deleteConsumer = async (req, res) => {
  try {
    const consumer = await Consumer.findById(req.params.id);

    if (!consumer) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        message: "Consumer not found",
      });
    }

    if (req.consumer._id.toString() !== consumer._id.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN.code,
        message: "Access denied",
      });
    }

    await consumer.deleteOne();

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Consumer deleted successfully",
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to delete consumer",
      errors: error.message,
    });
  }
};