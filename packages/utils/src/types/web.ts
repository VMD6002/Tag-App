import { ContentJsonSchema } from "./shared";
import z from "zod";

export const presetSchema = z.object({
  label: z.string(),
  value: z.string(),
  cookies: z.literal(true).optional(),
});

export type preset = z.infer<typeof presetSchema>;

const ContentDownloadSchema = z.object({
  type: z.enum(["yt-dlp", "curl"]),
  flags: z.union([z.string(), presetSchema]),
});
export type ContentDownload = z.infer<typeof ContentDownloadSchema>;

export const contentWebSchema = ContentJsonSchema.extend({
  url: z.string(),
  coverUrl: z.string(),
  download: ContentDownloadSchema,
});
export type ContentWebType = z.infer<typeof contentWebSchema>;

export type ContentWebDataType = Record<string, ContentWebType>;
