import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import { extractPublicId } from "../utils/cloudinaryHelpers.js";
import { sendResponse } from "../utils/apiResponse.js";
import { StatusCodes } from "../utils/statusCodes.js";
import { compressBase64Image } from "../utils/compressImage.js";

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

    // 🔥 IMAGE VALIDATION
    if (!picture || !picture.startsWith("data:image")) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: "Invalid image format. Must be Base64 data URL",
      });
    }

    let imageUrl = "";

    try {
      // 🔥 COMPRESS IMAGE FIRST
      const compressedPicture = await compressBase64Image(picture);

      // 🔥 UPLOAD TO CLOUDINARY
      const uploaded = await cloudinary.uploader.upload(compressedPicture, {
        folder: "products",
        resource_type: "image",
      });

      imageUrl = uploaded.secure_url;

    } catch (uploadError) {
      console.log("🔥 CLOUDINARY ERROR:", uploadError);

      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: "Image upload failed",
        errors: uploadError.message,
      });
    }

    const product = await Product.create({
      name,
      price,
      description,
      stock,
      picture: imageUrl,
      sellerId: req.seller._id,
    });

    const data = await Product.findById(product._id).populate(sellerPopulate);

    return sendResponse(res, {
      code: StatusCodes.CREATED,
      message: "Product created successfully",
      data,
    });

  } catch (error) {
    console.log("🔥 CREATE PRODUCT ERROR:", error);

    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
      errors: error.stack,
    });
  }
};



// GET PRODUCTS
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
      data: products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    return sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};


// GET SINGLE PRODUCT
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      sellerPopulate
    );

    if (!product) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: "Product not found",
      });
    }

    return sendResponse(res, {
      code: StatusCodes.OK,
      data: product,
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

    // 🔥 IMAGE UPDATE WITH COMPRESSION
    if (picture && picture.startsWith("data:image")) {
      try {
        if (product.picture) {
          await cloudinary.uploader.destroy(
            extractPublicId(product.picture)
          );
        }

        const compressedPicture = await compressBase64Image(picture);

        const uploaded = await cloudinary.uploader.upload(compressedPicture, {
          folder: "products",
          resource_type: "image",
        });

        product.picture = uploaded.secure_url;

      } catch (uploadError) {
        console.log("🔥 UPDATE IMAGE ERROR:", uploadError);

        return sendResponse(res, {
          code: StatusCodes.BAD_REQUEST,
          message: "Image update failed",
        });
      }
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
    console.log("🔥 UPDATE PRODUCT ERROR:", error);

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

    if (product.picture) {
      try {
        await cloudinary.uploader.destroy(
          extractPublicId(product.picture)
        );
      } catch (err) {
        console.log("🔥 DELETE IMAGE ERROR:", err);
      }
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