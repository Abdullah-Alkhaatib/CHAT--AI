import { Router } from "express";
import { chat, getChat } from "../controllers/chat.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";

const router = Router();

router.post("/", authMiddleware, upload.array("image", 10), chat);

router.get("/", authMiddleware, getChat);

export default router;