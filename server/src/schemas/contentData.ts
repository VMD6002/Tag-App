import z from "zod";

const presetSchema = z.object({
  label: z.string(),
  value: z.string(),
  cookies: z.literal(true).optional(),
});

export const docValidator = z.object({
  id: z.string(),
  Title: z.string(),
  Tags: z.string().array(),
  extraData: z.string(),
  Added: z.number(),
  LastUpdated: z.number(),
  Download: z
    .object({
      type: z.enum(["yt-dlp", "curl"]),
      flags: z.union([presetSchema, z.string()]),
    })
    .optional(),
});

export const dataValidator = z.array(docValidator);

export const queryValidator = z.object({
  any: z.string().array(), // 1st array - content with at least one of these tags
  all: z.string().array(), // 2nd array - content with all these tags
  none: z.string().array(), // 3rd array - content without any of these tags
  search: z.string(), // string for title search
  types: z.string().array(), // array of types to include (e.g., ["img", "video"])
  orderByLatest: z.boolean(),
});

export type queryFilters = z.infer<typeof queryValidator>;
export type ContentJsonType = z.infer<typeof docValidator>;

export interface IndividualContentDataType extends ContentJsonType {
  Type: "img" | "video" | "ImgSet" | "VideoSet";
  ext: string[];
}
