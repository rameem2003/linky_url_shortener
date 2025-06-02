import { desc, eq } from "drizzle-orm";
import db from "./../config/db.js";
import { shortLinksTable } from "./../drizzle/schema.js";

// Get All Links
export const getAllLinks = async ({ userId }) => {
  const shortLinks = await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.userId, userId))
    .orderBy(desc(shortLinksTable.createdAt));

  return shortLinks;
};

// Get Short Link
export const getShortLinkByShortCode = async (shortCode) => {
  const [shortLink] = await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.shortCode, shortCode));

  return shortLink;
};

// insert short link
export const insertShortLink = async (url, shortCode, userId) => {
  await db.insert(shortLinksTable).values({ url, shortCode, userId });
};

// update short link
export const updateShortLink = async (id, url, shortCode) => {
  return await db
    .update(shortLinksTable)
    .set({ url, shortCode })
    .where(eq(shortLinksTable.id, id));
};

// delete short link
export const deleteShortLink = async (id) => {
  return await db.delete(shortLinksTable).where(eq(shortLinksTable.id, id));
};
