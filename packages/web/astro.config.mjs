import solidJs from "@astrojs/solid-js";
import cloudflare from "@astrojs/cloudflare";
// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough",
  }),
  integrations: [solidJs()],
});
