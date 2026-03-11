import express from "express";
import {
    checkout,
    getOrders,
    getOrder,
    updateOrder,
    deleteOrder
} from "../Controllers/orderController.js"

const router = express.Router();

router.post("/checkout/:consumerId", checkout);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.patch("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;
