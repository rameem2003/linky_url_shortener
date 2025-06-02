import { insertLink, loadLinks } from "../services/links.service.js";
import crypto from "crypto";

/**
 * Get All Links
 */
const getAllLinks = async (req, res) => {
  try {
    let links = await loadLinks();

    res.status(200).send({
      success: true,
      message: "Links loaded successfully",
      data: links,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
};

/**
 * Insert Link
 */
const addLink = async (req, res) => {
  const { link, shortCode } = req.body;

  if (!link && !shortCode) {
    return res
      .status(400)
      .send({ success: false, message: "Link is required" });
  }

  let finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

  try {
    let result = await insertLink(link, finalShortCode);

    res.status(200).send({
      success: true,
      message: "Link added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
};

/**
 * Redirect Link
 */
const linkRedirect = async (req, res) => {
  const { shortCode } = req.params;

  try {
    let link = await findLink(shortCode);

    if (link.length > 0) {
      res.redirect(link[0].link);
    } else {
      res.status(404).send({ success: false, message: "Link not found" });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
};

export { getAllLinks, addLink, linkRedirect };
