// netlify/functions/get-products.js
import { getStore } from "@netlify/blobs";

export default async (req) => {
  try {
    const store = getStore({ name: "products-store", consistency: "strong" });
    // Read current products from blobs
    const json = await store.get("products.json");
    if (json) {
      return new Response(json, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-cache"
        }
      });
    }
    // Fallback: serve the repo file if blobs missing (first deploy)
    const fs = await import("node:fs/promises");
    const path = new URL("../../data/products.json", import.meta.url);
    const file = await fs.readFile(path, "utf-8");
    return new Response(file, {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};