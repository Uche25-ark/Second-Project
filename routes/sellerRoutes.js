import express from "express"

import {
    createSeller,
    getSellers,
    getSeller,
    updateSeller,
    deleteSeller
} from "../Controllers/sellerController.js"

const router = express.Router()

router.post("/", createSeller);
router.get("/", getSellers);
router.get("/:id", getSeller);
router.put("/:id", updateSeller);
router.delete("/:id", deleteSeller);

export default router;