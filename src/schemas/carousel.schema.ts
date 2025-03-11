import { z } from "zod";

const buttonSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("WEB_URL"),
    title: z.string().min(1, "Button title is required").max(20, "Button title must be less than 20 characters"),
    url: z.string().url("Please enter a valid URL").min(1, "URL is required")
  }),
  z.object({
    type: z.literal("POSTBACK"),
    title: z.string().min(1, "Button title is required").max(20, "Button title must be less than 20 characters"),
    payload: z.string().min(1, "Payload is required")
  })
]);

const carouselElementSchema = z.object({
  title: z.string().min(1, "Title is required").max(80, "Title must be less than 80 characters"),
  subtitle: z.string().max(80, "Subtitle must be less than 80 characters").optional(),
  imageUrl: z.string().url("Please enter a valid image URL").optional(),
  defaultAction: z.string().url("Please enter a valid URL").optional(),
  buttons: z.array(buttonSchema)
    .min(1, "At least one button is required")
    .max(3, "Maximum 3 buttons allowed per element")
});

export const carouselTemplateSchema = z.array(carouselElementSchema)
  .min(1, "At least one element is required")
  .max(10, "Maximum 10 elements allowed");

export type CarouselTemplateSchema = z.infer<typeof carouselTemplateSchema>;