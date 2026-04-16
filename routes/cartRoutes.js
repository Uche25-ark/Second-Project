import express from "express";
import { getCart, addToCart, updateCart, deleteCart } from "../Controllers/cartController.js";
import { protectConsumer } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protectConsumer, getCart);
router.post("/", protectConsumer, addToCart);
router.patch("/", protectConsumer, updateCart);
router.delete("/", protectConsumer, deleteCart);

export default router;