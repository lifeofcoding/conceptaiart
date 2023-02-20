import { z } from "zod";
export const GenerateSchema = z.object({
  prompt: z
    .string()
    .min(10, "Length need to be atleast 10 characters.")
    .max(250, "Prompt too long!"),
  file: z.string().nullish(),
});

export type GenerateSchemaType = z.infer<typeof GenerateSchema>;
