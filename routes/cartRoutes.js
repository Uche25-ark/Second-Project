import express from "express";
import {
    getCart,
    addToCart,
    updateCart,
    deleteCart
} from "../Controllers/cartController.js"

const router = express.Router()

router.get("/:consumerId", getCart);
router.post("/:consumerId", addToCart);
router.patch("/:consumerId", updateCart);
router.delete("/:consumerId", deleteCart);

export default router;