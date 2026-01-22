import { z } from "zod";

export const ContactSchema = z.object({
  instagramId: z.string().min(1),
  pageId: z.string().min(1),
  name: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  username: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  isFollower: z.boolean().optional().default(false),
  lastInteraction: z.date().optional(),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export const ContactUpdateSchema = ContactSchema.partial();
export type ContactUpdateInput = z.infer<typeof ContactUpdateSchema>;
