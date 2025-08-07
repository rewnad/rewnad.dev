import { subdomain } from "./domain";
import { bucket } from "./storage";

const OPENROUTER_API_KEY = new sst.Secret("OpenRouterApiKey");
export const api = new sst.cloudflare.Worker("Worker", {
  domain: subdomain("api"),
  url: true,
  link: [bucket, OPENROUTER_API_KEY],
  handler: "packages/functions/src/api.ts",
});
