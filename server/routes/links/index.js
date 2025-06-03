import { Router } from "express";
import {
  deleteTheShortLink,
  getAllShortLinks,
  postShortLink,
  redirectShortLink,
  updateTheShortLink,
} from "../../controllers/links.controller.js";

let router = Router();

router.get("/links", getAllShortLinks);
router.get("/links/:shortCode", redirectShortLink);
router.post("/links/add", postShortLink);
router.patch("/links/:id", updateTheShortLink);
router.delete("/links/:id", deleteTheShortLink);

export const linksRouter = router;
