import mongoose from "mongoose";

const VariableSchema = new mongoose.Schema(
  {
    id: String,
    key: String,
    value: String,
    enabled: Boolean,
  },
  { _id: false }
);

const RequestItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  method: { type: String, default: "GET" },
  url: { type: String },
  headers: { type: Array, default: [] },
  body: { type: String },
  bodyType: { type: String, default: "none" },
  auth: { type: Object },
  params: { type: Array, default: [] },
  preRequestScript: { type: String },
  postRequestScript: { type: String },
  variables: [VariableSchema],
  query: { type: String },
  operationName: { type: String },
});

const CollectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    type: { type: String, enum: ["REST", "GRAPHQL"], default: "REST" },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      default: null,
    },
    requests: [RequestItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Collection ||
  mongoose.model("Collection", CollectionSchema);
