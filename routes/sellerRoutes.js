import express from "express";
import {
    createSeller,
    loginSeller,
    getSellers,
    getSeller,
    updateSeller,
    deleteSeller
} from "../Controllers/sellerController.js";
import { protectSeller } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", createSeller);
router.post("/signin", loginSeller);

// Protected routes
router.get("/", protectSeller, getSellers);
router.get("/:id", protectSeller, getSeller);
router.put("/:id", protectSeller, updateSeller);
router.delete("/:id", protectSeller, deleteSeller);

export default router;