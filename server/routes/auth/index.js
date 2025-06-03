import { Router } from "express";
import {
  getUserProfile,
  login,
  logout,
  register,
  sendEmailForVerification,
  updateUserPassword,
} from "./../../controllers/auth.controller.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/profile", getUserProfile);
router.patch("/auth/update-password", updateUserPassword);
router.post("/auth/send-verification-email", sendEmailForVerification);
router.post("/auth/logout", logout);

export const authRouter = router;
