import express from "express";
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js";
import { protectSeller } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route
router.get("/", getProducts);
router.get("/:id", getProduct);

// Protected routes for sellers
router.post("/", protectSeller, createProduct);
router.put("/:id", protectSeller, updateProduct);
router.delete("/:id", protectSeller, deleteProduct);

export default router;