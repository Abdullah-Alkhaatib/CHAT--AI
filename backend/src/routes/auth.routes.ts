import { Router } from "express";
import { register, login, refresh, logout } from "../controllers/auth.controller";
import validate from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const router = Router();

//  /api/auth/register
router.post("/register", validate(registerSchema), register);

//  /api/auth/login
router.post("/login", validate(loginSchema), login);

//  /api/auth/refresh
router.post("/refresh", refresh);

//  /api/auth/logout
router.post("/logout", logout);

export default router;