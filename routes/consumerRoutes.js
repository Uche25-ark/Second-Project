import express from "express"
import {
    createConsumer,
    getConsumers,
    getConsumer,
    updateConsumer,
    deleteConsumer
} from "../Controllers/consumerController.js"

const router = express.Router();

router.post("/", createConsumer);
router.get("/", getConsumers);
router.get("/:id", getConsumer);
router.put("/:id", updateConsumer);
router.delete("/:id", deleteConsumer);

export default router;
