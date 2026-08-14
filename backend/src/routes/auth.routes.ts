import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import validate from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const router = Router();

//  /api/auth/register
router.post("/register", validate(registerSchema), register);

//  /api/auth/login
router.post("/login", validate(loginSchema), login);

export default router;