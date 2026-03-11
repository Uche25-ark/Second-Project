import express from "express";
import { 
    createLogin, 
    getLogins,
    getLogin,
    deleteLogin
} from "../Controllers/LoginController.js";

const router = express.Router();

router.post("/", createLogin);
router.get("/", getLogins);
router.get("/:id", getLogin);
router.delete("/:id", deleteLogin);

export default router;