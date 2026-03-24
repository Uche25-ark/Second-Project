import express from "express";
import {
    checkout,
    getOrders,
    getOrder,
    updateOrder,
    deleteOrder
} from "../controllers/orderController.js";
import { protectConsumer } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkout/:consumerId", protectConsumer, checkout);
router.get("/", protectConsumer, getOrders);
router.get("/:id", protectConsumer, getOrder);
router.patch("/:id", protectConsumer, updateOrder);
router.delete("/:id", protectConsumer, deleteOrder);

export default router;