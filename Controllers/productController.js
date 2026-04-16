import Product from "../models/Product.js";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";
import { validateFields } from "../utils/validator.js";


// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, sellerId, picture } = req.body;

  const errors = validateFields([
    { name: "name", value: name, type: "string", required: true },
    { name: "price", value: price, type: "number", required: true },
    { name: "description", value: description, type: "string", required: true },
    { name: "stock", value: stock, type: "number", required: true },
    { name: "sellerId", value: sellerId, type: "string", required: true },
    { name: "picture", value: picture, type: "string", required: true },
  ]);

    if (errors.length) {
      return sendResponse(res, {
        code: StatusCodes.UNPROCESSABLE_ENTITY,
        validation: true,
        errors,
      });
    }

    const product = await Product.create({
      name,
      price,
      description,
      stock,
      sellerId,
      picture,
    });

    const productData = product.toObject();
    delete productData.__v;

    return sendResponse(res, {
      code: StatusCodes.CREATED,
      data: productData,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: error.message,
    });
  }
};

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const productData = products.map((product) => {
    const obj = product.toObject();
    delete obj.__v;
    return obj;
    });

    return sendResponse(res, { data: productData });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: error.message,
    });
  }
};

// GET SINGLE PRODUCT
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, { code: StatusCodes.NOT_FOUND });
    }

    const productData = product.toObject();
    delete productData.__v;

    return sendResponse(res, { data: productData });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: error.message,
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Product not found",
      });
    }

    // Ownership check
    if (req.seller?._id.toString() !== product.sellerId.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN,
        message: "Access denied",
      });
    }

    const updates = req.body;

    // Optional validation
    const errors = validateFields([
      { name: "price", value: updates.price },
      { name: "stock", value: updates.stock },
    ]);

    if (errors.length) {
      return sendResponse(res, {
        code: StatusCodes.UNPROCESSABLE_ENTITY,
        validation: true,
        message: "Validation errors",
        errors,
      });
    }

    // ✅ SAFE UPDATE (prevent overwriting everything)
    const allowedFields = [
      "name",
      "price",
      "description",
      "stock",
      "picture",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        product[field] = updates[field];
      }
    });

    await product.save();

    // ✅ CLEAN RESPONSE (remove __v)
    const productData = product.toObject();
    delete productData.__v;

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Product updated successfully",
      data: productData,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to update product",
      errors: error.message,
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, { code: StatusCodes.NOT_FOUND });
    }

    // Ownership check
    if (req.seller?._id.toString() !== product.sellerId.toString()) {
      return sendResponse(res, { code: StatusCodes.FORBIDDEN });
    }

    await product.deleteOne();

    return sendResponse(res, {
      message: "Product deleted successfully",
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: error.message,
    });
  }
};