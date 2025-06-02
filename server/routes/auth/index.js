import { Router } from "express";
import {
  login,
  logout,
  register,
} from "./../../controllers/auth.controller.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);

router.post("/auth/logout", logout);

export const authRouter = router;
