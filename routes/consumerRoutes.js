import express from "express";
import {
    createConsumer,
    loginConsumer,
    // getConsumers,
    getConsumer,
    updateConsumer,
    deleteConsumer
} from "../Controllers/consumerController.js";
import { protectConsumer } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", createConsumer);
router.post("/login", loginConsumer);

// Protected routes
// router.get("/", protectConsumer, getConsumers);
router.get("/:id", protectConsumer, getConsumer);
router.put("/:id", protectConsumer, updateConsumer);
router.delete("/:id", protectConsumer, deleteConsumer);

export default router;