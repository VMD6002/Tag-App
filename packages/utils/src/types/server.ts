import z from "zod";
import { ContentJsonSchema } from "./shared";

export const CtypeSchema = z.enum(["img", "video", "gallery", "audio", "txt"]);
export type CType = z.infer<typeof CtypeSchema>;

export const contentServerSchema = ContentJsonSchema.extend({
  type: CtypeSchema,
  cover: z.string().optional(),
});

export type ContentServerType = z.infer<typeof contentServerSchema>;
