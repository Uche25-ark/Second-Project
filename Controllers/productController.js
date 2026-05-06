import Product from "../models/Product.js";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";

const sellerPopulate = {
  path: "sellerId",
  select: "sellerName email storeAddress -_id",
};


// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, picture } = req.body;

    if (!req.seller) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: "Not authorized",
      });
    }

    if (!picture || !picture.startsWith("data:image")) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: "Image must be Base64 format",
      });
    }

    // Optional: prevent huge images
    if (picture.length > 500000) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: "Image too large",
      });
    }

    const product = await Product.create({
      name,
      price,
      description,
      stock,
      picture, // ✅ Save Base64 directly
      sellerId: req.seller._id,
    });

    const data = await Product.findById(product._id).populate(sellerPopulate);

    return sendResponse(res, {
      code: StatusCodes.CREATED,
      message: "Product created successfully",
      data,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};


// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keyword = req.query.search
      ? { name: { $regex: req.query.search, $options: "i" } }
      : {};

    let sort = { createdAt: -1 };
    if (req.query.sort === "low") sort = { price: 1 };
    if (req.query.sort === "high") sort = { price: -1 };

    const total = await Product.countDocuments(keyword);

    const products = await Product.find(keyword)
      .populate(sellerPopulate)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Products fetched successfully",
      data: products, // ✅ Base64 images returned
      page,
      pages: Math.ceil(total / limit),
      total,
    });

  } catch (error) {
    console.log("🔥 GET PRODUCTS ERROR:", error);

    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};


// GET SINGLE PRODUCT
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("sellerId", "sellerName email storeAddress");

    if (!product) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Product not found",
      });
    }

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Product fetched successfully",
      data: product, // ✅ Base64 image
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
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

    if (product.sellerId.toString() !== req.seller._id.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN,
        message: "Access denied",
      });
    }

    const { picture } = req.body;

    // ✅ Update Base64 image directly
    if (picture && picture.startsWith("data:image")) {

      if (picture.length > 500000) {
        return sendResponse(res, {
          code: StatusCodes.BAD_REQUEST,
          message: "Image too large",
        });
      }

      product.picture = picture;
    }

    product.name = req.body.name ?? product.name;
    product.price = req.body.price ?? product.price;
    product.description = req.body.description ?? product.description;
    product.stock = req.body.stock ?? product.stock;

    await product.save();

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Updated successfully",
      data: product,
    });

  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};


// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Product not found",
      });
    }

    if (product.sellerId.toString() !== req.seller._id.toString()) {
      return sendResponse(res, {
        code: StatusCodes.FORBIDDEN,
        message: "Access denied",
      });
    }

    await product.deleteOne();

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: "Deleted successfully",
    });

  } catch (error) {
    console.log("🔥 DELETE PRODUCT ERROR:", error);

    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};