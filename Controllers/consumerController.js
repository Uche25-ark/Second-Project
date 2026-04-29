import Consumer from "../models/Consumer.js";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";
import { validateFields } from "../utils/validator.js";

// Generate JWT Token
const generateToken = (consumer) =>
  jwt.sign(
    {
      id: consumer._id,
      email: consumer.email,
      consumerName: consumer.consumerName,
      role: "consumer",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );


// CREATE CONSUMER
export const createConsumer = async (req, res) => {
  try {
    let { consumerName, email, password, phoneNumber, address } = req.body;

    // Validate input fields
    const errors = validateFields([
      { name: "consumerName", value: consumerName, type: "string", required: true },
      { name: "email", value: email, type: "string", required: true, pattern: /^\S+@\S+\.\S+$/ },
      { name: "password", value: password, type: "string", required: true, minLength: 6 },
      { name: "phoneNumber", value: phoneNumber, type: "string", required: true, pattern: /^\d{10,15}$/ },
      { name: "address", value: address, type: "string", required: true },
    ]);

    if (errors.length) {
      return sendResponse(res, {
        code: StatusCodes.UNPROCESSABLE_ENTITY,
        validation: true,
        errors,
      });
    }

    email = email.toLowerCase().trim();

    // Check for existing consumer
    const existing = await Consumer.findOne({ $or: [{ email }, { consumerName }] });

    if (existing) {
      return sendResponse(res, {
        code: StatusCodes.CONFLICT,
        message: existing.email === email
          ? "Email already exists"
          : "Consumer name already exists",
      });
    }

    // Create consumer
    const consumer = await Consumer.create({
      consumerName,
      email,
      password,
      phoneNumber,
      address,
    });

    // Remove password before sending response
    const consumerData = consumer.toObject();
    delete consumerData.password;
    delete consumerData.__v;

    return sendResponse(res, {
      code: StatusCodes.CREATED,
      message: "Consumer created successfully",
      data: consumerData,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to create consumer",
      errors: error.message,
    });
  }
};

// LOGIN CONSUMER
export const loginConsumer = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Validate input fields
    const errors = validateFields([
      { name: "email", value: email, required: true },
      { name: "password", value: password, required: true },
    ]);

    if (errors.length) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        validation: true,
        errors,
        message: "Validation failed",
      });
    }

    email = email.toLowerCase().trim();

    // Include password only for comparison
    const consumer = await Consumer.findOne({ email }).select("+password");

    if (!consumer || !(await consumer.comparePassword(password))) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: "Invalid Email or Password",
      });
    }

    //Remove password from response
    const consumerData = consumer.toObject();
    delete consumerData.password;
    delete consumerData.__v;

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Login successful",
      data: {
        ...consumerData,
        token: generateToken(consumer),
      },
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      validation: false,
      message: "Login failed",
      errors: error.message,
    });
  }
};

// GET CONSUMER
export const getConsumer = async (req, res) => {
  try {
    const consumer = await Consumer.findById(req.params.id).select("-password -__v");

    if (!consumer) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Consumer not found",
      });
    }

    if (req.consumer._id.toString() !== consumer._id.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN,
        message: "Access denied",
      });
    }

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Consumer retrieved successfully",
      data: consumer,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve consumer",
      errors: error.message,
    });
  }
};

// GET ALL CONSUMERS
export const getConsumers = async (req, res) => {
  try {
    const consumers = await Consumer.find().select("-password -__v");

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Consumers retrieved successfully",
      data: consumers,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to retrieve consumers",
      errors: error.message,
    });
  }
};

// UPDATE CONSUMER
export const updateConsumer = async (req, res) => {
  try {
    const { id } = req.params; // Get consumer ID from URL
    if (!id) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: "Consumer ID is required",
      });
    }

    // Ensure logged-in consumer is attached by middleware
    if (!req.consumer) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: "Not authorized",
      });
    }

    // Fetch consumer including password if updating
    const consumer = await Consumer.findById(id).select("+password");
    if (!consumer) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Consumer not found",
      });
    }

    // Only allow logged-in consumer to update their own info
    if (req.consumer._id.toString() !== consumer._id.toString()) {
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
      { name: "phoneNumber", value: updates.phoneNumber, pattern: /^\d{10,15}$/ },
    ]);

    if (errors.length) {
      return sendResponse(res, {
        code: StatusCodes.UNPROCESSABLE_ENTITY,
        validation: true,
        message: "Validation errors",
        errors,
      });
    }

    // Check email uniqueness if updating
    if (updates.email) {
      const exists = await Consumer.findOne({
        email: updates.email.toLowerCase().trim(),
        _id: { $ne: consumer._id },
      });
      if (exists) {
        return sendResponse(res, {
          code: StatusCodes.CONFLICT,
          message: "Email already exists",
        });
      }
      consumer.email = updates.email.toLowerCase().trim();
    }

    // Update only provided fields
    if (updates.consumerName) consumer.consumerName = updates.consumerName;
    if (updates.password) consumer.password = updates.password;
    if (updates.phoneNumber) consumer.phoneNumber = updates.phoneNumber;
    if (updates.address) consumer.address = updates.address;

    await consumer.save();

    // Remove password before sending response
    const consumerData = consumer.toObject();
    delete consumerData.password;
    delete consumerData.__v;

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Consumer updated successfully",
      data: consumerData,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to update consumer",
      errors: error.message,
    });
  }
};

// DELETE CONSUMER
export const deleteConsumer = async (req, res) => {
  try {
    const consumer = await Consumer.findById(req.params.id);

    if (!consumer) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Consumer not found",
      });
    }

    if (req.consumer._id.toString() !== consumer._id.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN,
        message: "Access denied",
      });
    }

    await consumer.deleteOne();

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Consumer deleted successfully",
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to delete consumer",
      errors: error.message,
    });
  }
};