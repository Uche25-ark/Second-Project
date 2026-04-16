import Product from "../models/Product.js";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";
import { validateFields } from "../utils/validator.js";


// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, sellerId, picture } = req.body;

    const errors = validateFields([
      { name: "name", value: name, required: true },
      { name: "price", value: price, required: true },
      { name: "description", value: description, required: true },
      { name: "stock", value: stock, required: true },
      { name: "sellerId", value: sellerId, required: true },
      { name: "picture", value: picture, required: true },
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

    return sendResponse(res, {
      code: StatusCodes.CREATED,
      data: product,
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

    return sendResponse(res, { data: products });

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

    return sendResponse(res, { data: product });

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
      return sendResponse(res, { code: StatusCodes.NOT_FOUND });
    }

    // Ownership check
    if (req.seller?._id.toString() !== product.sellerId.toString()) {
      return sendResponse(res, { code: StatusCodes.FORBIDDEN });
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
        errors,
      });
    }

    Object.assign(product, updates);
    await product.save();

    return sendResponse(res, { data: product });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
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