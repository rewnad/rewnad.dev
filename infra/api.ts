import { subdomain } from "./domain";
import { bucket } from "./storage";

export const api = new sst.cloudflare.Worker("Worker", {
  domain: subdomain("api"),
  url: true,
  link: [bucket],
  handler: "packages/functions/src/api.ts",
});
