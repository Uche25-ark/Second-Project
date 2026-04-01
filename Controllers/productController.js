import Product from "../models/Product.js";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";

// ============================
// CREATE PRODUCT
// ============================
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, sellerId, picture } = req.body;

    const errors = [];

    if (!name) errors.push("Product name is required");
    if (price == null) errors.push("Price is required");
    if (!description) errors.push("Description is required");
    if (stock == null) errors.push("Stock is required");
    if (!sellerId) errors.push("Seller ID is required");
    if (!picture) errors.push("Picture is required");

    if (errors.length > 0) {
      return sendResponse(res, {
        code: StatusCodes.UNPROCESSABLE_ENTITY.code,
        validation: true,
        message: "Validation errors",
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
      code: StatusCodes.CREATED.code,
      message: "Product created successfully",
      data: product,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to create product",
      errors: error.message,
    });
  }
};

// ============================
// GET ALL PRODUCTS
// ============================
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Products retrieved successfully",
      data: products,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to retrieve products",
      errors: error.message,
    });
  }
};

// ============================
// GET SINGLE PRODUCT
// ============================
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        message: "Product not found",
      });
    }

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Product retrieved successfully",
      data: product,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to retrieve product",
      errors: error.message,
    });
  }
};

// ============================
// UPDATE PRODUCT
// ============================
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        message: "Product not found",
      });
    }

    // Ownership check
    if (req.seller?._id.toString() !== product.sellerId.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN.code,
        message: "Access denied",
      });
    }

    Object.assign(product, req.body);
    await product.save();

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Product updated successfully",
      data: product,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to update product",
      errors: error.message,
    });
  }
};

// ============================
// DELETE PRODUCT
// ============================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND.code,
        message: "Product not found",
      });
    }

    // Ownership check
    if (req.seller?._id.toString() !== product.sellerId.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN.code,
        message: "Access denied",
      });
    }

    await product.deleteOne();

    return sendResponse(res, {
      code: StatusCodes.OK.code,
      message: "Product deleted successfully",
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      validation: false,
      message: "Failed to delete product",
      errors: error.message,
    });
  }
};