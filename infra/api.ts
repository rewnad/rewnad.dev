import { bucket } from "./storage";

export const api = new sst.cloudflare.Worker("Worker", {
  url: true,
  link: [bucket],
  handler: "packages/functions/src/api.ts",
});
