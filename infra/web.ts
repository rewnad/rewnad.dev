import { api } from "./api";

export const web = new sst.cloudflare.x.Astro("Web", {
  path: "packages/web",
  environment: {
    VITE_API_URL: api.url,
  },
});
