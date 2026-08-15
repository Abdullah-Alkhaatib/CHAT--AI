import { Router } from "express";
import upload from "../middleware/upload.middleware";
import { uploadImage } from "../controllers/upload.controller";

const router = Router();

router.post("/", upload.single("image"), uploadImage);

export default router;