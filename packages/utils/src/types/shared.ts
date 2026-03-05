import { z } from "zod";

// Define the Schema
export const ContentJsonSchema = z.object({
  id: z.string(),
  title: z.string(),
  tags: z.array(z.string()),
  extraData: z.string(),
  // Unix Timestamps
  added: z.number(),
  lastUpdated: z.number(),
});

// Automatically generate the Type from the Schema
export type ContentJsonType = z.infer<typeof ContentJsonSchema>;

export type FilterDataType = {
  any?: string[];
  all?: string[];
  none?: string[];
  types?: string[];
  search?: string;
  orderByLatest?: boolean;
};
