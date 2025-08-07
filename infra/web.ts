import { api } from "./api";
import { domain } from "./domain";

export const web = new sst.cloudflare.x.Astro("Web", {
  domain,
  path: "packages/web",
  environment: {
    VITE_API_URL: api.url,
  },
});
