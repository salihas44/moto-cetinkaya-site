// netlify/functions/save-products.js
import { getStore } from "@netlify/blobs";

export default async (req) => {
  // Simple auth: check Bearer token matches env ADMIN_TOKEN
  const auth = req.headers.get("authorization") || "";
  const token = (auth.startsWith("Bearer ") ? auth.slice(7) : "").trim();
  const secret = process.env.ADMIN_TOKEN || "";
  if (!secret) {
    return new Response(JSON.stringify({ error: "Server misconfig: ADMIN_TOKEN not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!token || token !== secret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (req.method === "OPTIONS") {
    return new Response("", {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
  }

  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return new Response(JSON.stringify({ error: "Invalid payload: expected array" }), { status: 400 });
    }
    // Basic validation for product items
    for (const p of body) {
      if (typeof p !== "object" || p == null || typeof p.id === "undefined") {
        return new Response(JSON.stringify({ error: "Invalid product item" }), { status: 400 });
      }
    }

    const store = getStore({ name: "products-store", consistency: "strong" });
    await store.setJSON("products.json", body);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};