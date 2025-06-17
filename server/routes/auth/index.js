import { Router } from "express";
import {
  editProfile,
  getUserProfile,
  googleLoginCallback,
  login,
  logout,
  oauthGoogle,
  register,
  resetPassword,
  sendEmailForVerification,
  sendResetPasswordEmail,
  updateUserPassword,
  verifyEmailToken,
  verifyResetPasswordToken,
} from "./../../controllers/auth.controller.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/profile", getUserProfile);
router.patch("/auth/update-username", editProfile);
router.patch("/auth/update-password", updateUserPassword);
router.post("/auth/send-verification-email", sendEmailForVerification);
router.get("/auth/verify-email", verifyEmailToken);
router.post("/auth/reset-password", sendResetPasswordEmail);
router.get("/auth/reset-password/:token", verifyResetPasswordToken);
router.post("/auth/reset-password/:token", resetPassword);
router.get("/auth/google", oauthGoogle);
router.get("/auth/google/callback", googleLoginCallback);
router.post("/auth/logout", logout);

export const authRouter = router;
