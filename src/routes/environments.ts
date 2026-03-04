import { Router, Response } from "express";
import connectDB from "../lib/db";
import Environment from "../models/Environment";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/environments
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const envs = await Environment.find({ userId: req.user!.id });
    return res.json(envs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/environments
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { name, variables } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const newEnv = await Environment.create({
      userId: req.user!.id,
      name,
      variables: variables || [],
    });

    return res.status(201).json(newEnv);
  } catch (err: any) {
    console.error("Create Env Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

// PUT /api/environments
router.put("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { _id, name, variables } = req.body;

    const updated = await Environment.findOneAndUpdate(
      { _id, userId: req.user!.id },
      { name, variables },
      { new: true },
    );

    if (!updated)
      return res.status(404).json({ error: "Environment not found" });
    return res.json(updated);
  } catch (err: any) {
    console.error("Update Env Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/environments?id=xxx
router.delete("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { id } = req.query;
    await Environment.findOneAndDelete({ _id: id, userId: req.user!.id });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
