import { Router } from "express";
let router = Router();
let base = process.env.API_BASE;

import { authRouter } from "./auth/index.js";
import { linksRouter } from "./links/index.js";

/**
 * Auth Routes
 * http://localhost:5000/api/v1/auth
 */
router.use(base, authRouter);

/**
 * Links Routes
 * http://localhost:5000/api/v1/links
 */
router.use(base, linksRouter);

export default router;
