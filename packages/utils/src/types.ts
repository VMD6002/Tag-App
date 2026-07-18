import { z } from "zod";

// ContentData

export const PresetSchema = z.object({
  label: z.string(),
  value: z.string(),
});
export type PresetType = z.infer<typeof PresetSchema>;
export const ContentDownloadSchema = z.object({
  type: z.string(),
  flags: PresetSchema.optional(),
});
export type ContentDownloadType = z.infer<typeof ContentDownloadSchema>;

export const ContentWebBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  tags: z.array(z.string()),
  extraData: z.string(),
  cover: z.string().optional(),
  url: z.string(),
  scraper: z.string(),

  download: ContentDownloadSchema.optional(),
  contentUrl: z.string().optional(),
});
export type ContentWebBaseType = z.infer<typeof ContentWebBaseSchema>;

export const ContentWebSchema = ContentWebBaseSchema.extend({
  added: z.number(),
  lastUpdated: z.number(),
});
export type ContentWebType = z.infer<typeof ContentWebSchema>;

export type ContentWebDataType = Record<string, ContentWebType>;

// FilterData Types

export const FilterQuerySchema = z.object({
  any: z.string().array(), // 1st array - content with at least one of these tags
  all: z.string().array(), // 2nd array - content with all these tags
  none: z.string().array(), // 3rd array - content without any of these tags
  search: z.string(), // string for title search
  orderByLatest: z.boolean(),
});

export type FilterDataType = z.infer<typeof FilterQuerySchema>;

// Tag - ParentTag Types

export const TagSchema = z.object({
  count: z.number(),
  cover: z.string().optional(),
});
export type TagsType = Record<string, z.infer<typeof TagSchema>>;

export const ParentTagSchema = z.object({
  cover: z.string().optional(),
});
export type ParentTagsType = Record<string, z.infer<typeof ParentTagSchema>>;

// Backup - Restore

export const BackUpSchema = z.object({
  contentData: z.record(z.string(), ContentWebSchema),
  tags: z.record(z.string(), TagSchema),
  parentTags: z.record(z.string(), ParentTagSchema),
});

export type BackUpType = z.infer<typeof BackUpSchema>;
