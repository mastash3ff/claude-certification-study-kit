import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mastash3ff.github.io",
  base: "/claude-certification-study-kit",
  output: "static",
  trailingSlash: "always",
  integrations: [preact(), sitemap()],
});
