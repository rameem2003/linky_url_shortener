import { Router } from "express";
let router = Router();
let base = process.env.API_BASE;
import links from "./links/index.js";
import { authRouter } from "./auth/index.js";

/**
 * Auth Routes
 * http://localhost:5000/api/v1/auth
 */
router.use(base, authRouter);

/**
 * Links Routes
 * http://localhost:5000/api/v1/links
 */
// router.use(base, links);

export default router;
