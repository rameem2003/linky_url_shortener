import z from "zod";

export const linkShortenerSchema = z.object({
  url: z
    .string({ required_error: "Please Enter the url" })
    .trim()
    .url({ message: "Please Enter a valid url" })
    .max(1024, { message: "URL cannot be longer than 1024 characters" }),
  shortCode: z
    .string({ required_error: "Please Enter the short code" })
    .trim()
    .min(3, {
      message: "Short code must be at least 3 characters long",
    })
    .max(50, {
      message: "Short code cannot be longer than 50 characters",
    }),
});
