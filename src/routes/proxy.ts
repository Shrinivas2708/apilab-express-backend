import { Router, Request, Response } from "express";

const router = Router();

// POST /api/proxy — forwards requests on behalf of client to bypass CORS
router.post("/", async (req: Request, res: Response) => {
  try {
    const { method, url, headers, params, body } = req.body;

    if (!url) return res.status(400).json({ error: "URL is required" });

    const fullUrl = new URL(url);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fullUrl.searchParams.set(k, v as string);
      });
    }

    const startTime = performance.now();

    let fetchBody: string | undefined;
    if (body) {
      try {
        const parsed = JSON.parse(body);
        fetchBody = JSON.stringify(parsed);
      } catch {
        fetchBody = body;
      }
    }

    const upstream = await fetch(fullUrl.toString(), {
      method: method || "GET",
      headers: headers || {},
      body: fetchBody,
    });

    const upstreamLatency = Math.round(performance.now() - startTime);
    const contentType = upstream.headers.get("content-type") || "";

    const isBinary =
      contentType.startsWith("image/") ||
      contentType.startsWith("video/") ||
      contentType.startsWith("audio/") ||
      contentType.includes("application/pdf") ||
      contentType.includes("application/octet-stream");

    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const responsePayload: any = {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: Object.fromEntries(upstream.headers.entries()),
      isBinary,
      contentType,
      size: buffer.length,
      time: upstreamLatency,
      data: null,
      base64: "",
    };

    if (isBinary) {
      responsePayload.base64 = buffer.toString("base64");
    } else {
      const text = buffer.toString("utf8");
      try {
        if (contentType.includes("json")) {
          responsePayload.data = JSON.parse(text);
        } else {
          responsePayload.data = text;
        }
      } catch {
        responsePayload.data = text;
      }
    }

    return res.json(responsePayload);
  } catch (err: any) {
    console.error("Proxy error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
