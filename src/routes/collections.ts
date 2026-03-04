import { Router, Response } from "express";
import { z } from "zod";
import connectDB from "../lib/db";
import Collection from "../models/Collection";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const CreateCollectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().nullable().optional(),
  type: z.enum(["REST", "GRAPHQL"]).optional().default("REST"),
});

const AddRequestSchema = z.object({
  collectionId: z.string().min(1, "Collection ID is required"),
  requestId: z.string().optional(),
  request: z.object({
    name: z.string().min(1, "Request name is required"),
    method: z.string(),
    url: z.string(),
    headers: z.array(z.any()).optional(),
    body: z.string().optional(),
    bodyType: z.string().optional(),
    auth: z.any().optional(),
    params: z.array(z.any()).optional(),
    preRequestScript: z.string().optional(),
    postRequestScript: z.string().optional(),
    variables: z.array(z.any()).optional(),
    query: z.string().optional(),
    operationName: z.string().optional(),
  }),
});

// GET /api/collections
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { type } = req.query;
    const query: any = { userId: req.user!.id };

    if (type === "GRAPHQL") {
      query.type = "GRAPHQL";
    } else {
      query.$or = [
        { type: "REST" },
        { type: { $exists: false } },
        { type: null },
      ];
    }

    const collections = await Collection.find(query).sort({ createdAt: -1 });
    return res.json(collections);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/collections
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const validation = CreateCollectionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.flatten() });
    }

    const { name, parentId, type } = validation.data;
    const validParentId = parentId && parentId.trim() !== "" ? parentId : null;

    let finalType = type;
    if (validParentId) {
      const parent = await Collection.findById(validParentId);
      if (parent && parent.type) finalType = parent.type as "REST" | "GRAPHQL";
    }

    const newCol = await Collection.create({
      userId: req.user!.id,
      name,
      parentId: validParentId,
      type: finalType,
      requests: [],
    });

    return res.status(201).json(newCol);
  } catch (err: any) {
    console.error("Collection Create Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/collections — add or update a request
router.put("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const validation = AddRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.flatten() });
    }

    const { collectionId, requestId, request } = validation.data;
    let updatedCollection;

    if (requestId) {
      updatedCollection = await Collection.findOneAndUpdate(
        { _id: collectionId, userId: req.user!.id, "requests._id": requestId },
        { $set: { "requests.$": { ...request, _id: requestId } } },
        { new: true },
      );
    } else {
      updatedCollection = await Collection.findOneAndUpdate(
        { _id: collectionId, userId: req.user!.id },
        { $push: { requests: request } },
        { new: true },
      );
    }

    if (!updatedCollection) {
      return res.status(404).json({ error: "Collection or Request not found" });
    }

    const savedRequest = requestId
      ? updatedCollection.requests.find(
          (r: any) => r._id.toString() === requestId,
        )
      : updatedCollection.requests[updatedCollection.requests.length - 1];

    return res.json(savedRequest);
  } catch (err: any) {
    console.error("Save Request Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections?id=xxx
router.delete("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID required" });

    await Collection.findOneAndDelete({ _id: id, userId: req.user!.id });
    await Collection.deleteMany({ parentId: id, userId: req.user!.id });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:collectionId/requests/:requestId
router.delete(
  "/:collectionId/requests/:requestId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      await connectDB();
      const { collectionId, requestId } = req.params;

      const updated = await Collection.findOneAndUpdate(
        { _id: collectionId, userId: req.user!.id },
        { $pull: { requests: { _id: requestId } } },
        { new: true },
      );

      if (!updated)
        return res.status(404).json({ error: "Collection not found" });
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
);

export default router;
