import { Router, Request, Response } from "express";

const router = Router();

// GET /api/echo
router.get("/", (req: Request, res: Response) => {
  const headers = Object.fromEntries(
    Object.entries(req.headers).map(([k, v]) => [k, v])
  );
  return res.json({
    method: req.method,
    url: req.protocol + "://" + req.get("host") + req.originalUrl,
    headers,
  });
});

// GET /api/echo/sse — Server-Sent Events demo
router.get("/sse", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  let count = 0;
  const interval = setInterval(() => {
    try {
      res.write(`data: Message ${++count}\n\n`);
    } catch {
      clearInterval(interval);
    }
  }, 1000);

  req.on("close", () => clearInterval(interval));
  req.on("aborted", () => clearInterval(interval));
});

export default router;
