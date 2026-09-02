import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const certifications = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/certifications" }),
  schema: z.object({
    track: z.enum(["ccao-f", "ccdv-f", "ccar-f", "ccar-p"]),
    kind: z.enum(["overview", "domain", "practice"]),
    title: z.string(),
    description: z.string(),
    order: z.number(),
    domain: z.string().optional(),
  }),
});

export const collections = { certifications };
