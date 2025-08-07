import { Resource } from "sst";
import { Hono } from "hono";

const app = new Hono().put("/*", async (c) => {
  const key = crypto.randomUUID();
  await Resource.Bucket.put(key, c.req.raw.body, {
    httpMetadata: {
      contentType: c.req.header("content-type"),
    },
  });
  return c.text(`Object created with key: ${key}`);
});

export default app;
