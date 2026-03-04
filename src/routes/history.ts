import { Router, Response } from "express";
import connectDB from "../lib/db";
import History from "../models/History";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /api/history
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    await History.create({ userId: req.user!.id, ...req.body });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to save history" });
  }
});

// GET /api/history
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const history = await History.find({ userId: req.user!.id })
      .sort({ date: -1 })
      .limit(50);
    return res.json(history);
  } catch {
    return res.status(500).json({ error: "Failed to fetch history" });
  }
});

// DELETE /api/history — clear all
router.delete("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    await History.deleteMany({ userId: req.user!.id });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
