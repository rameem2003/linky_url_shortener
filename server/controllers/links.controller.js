import {
  deleteShortLink,
  getAllLinks,
  getShortLinkByShortCode,
  insertShortLink,
  updateShortLink,
} from "../services/links.service.js";
import { linkShortenerSchema } from "../validator/shortener.validator.js";
import crypto from "crypto";

// get all short links
export const getAllShortLinks = async (req, res) => {
  try {
    const shortLinks = await getAllLinks({ userId: req.user.id });

    return res.status(200).json({ success: true, data: shortLinks });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// insert short link
export const postShortLink = async (req, res) => {
  try {
    const { url, shortCode } = req.body;

    // validate user data
    const { data, error } = linkShortenerSchema.safeParse({ url, shortCode });

    if (error)
      return res
        .status(400)
        .json({ success: false, msg: error.errors[0].message });

    const finalShortCode =
      data.shortCode || crypto.randomBytes(4).toString("hex");

    // check short code
    const shortCodeExist = await getShortLinkByShortCode(finalShortCode);

    if (shortCodeExist) {
      return res
        .status(400)
        .json({ success: false, msg: "Short code already exist" });
    }

    // insert short link
    await insertShortLink(data.url, finalShortCode, req.user.id);

    return res
      .status(200)
      .json({ success: true, msg: "Short link created successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// redirect short link
export const redirectShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // find short link
    const link = await getShortLinkByShortCode(shortCode);

    if (!link) {
      return res.status(404).json({ success: false, msg: "Link not found" });
    }

    return res.redirect(link.url);
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// update short link
export const updateTheShortLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, shortCode } = req.body;

    // validate user data
    const { data, error } = linkShortenerSchema.safeParse({ url, shortCode });

    if (error)
      return res
        .status(400)
        .json({ success: false, msg: error.errors[0].message });

    const shortCodeExist = await getShortLinkByShortCode(data.shortCode);

    if (shortCodeExist) {
      return res
        .status(400)
        .json({ success: false, msg: "Short code already exist" });
    }

    const newShortCode = await updateShortLink(id, data.url, data.shortCode);

    if (!newShortCode) {
      return res.status(404).json({ success: false, msg: "Link not found" });
    }

    return res
      .status(200)
      .json({ success: true, msg: "Short link updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// delete the short link
export const deleteTheShortLink = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteShortLink(id);

    return res
      .status(200)
      .json({ success: true, msg: "Short link deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};
