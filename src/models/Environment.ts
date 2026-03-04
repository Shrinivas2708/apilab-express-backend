import mongoose from "mongoose";

const VariableSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    key: { type: String, default: "" },
    value: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const EnvironmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    variables: [VariableSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Environment ||
  mongoose.model("Environment", EnvironmentSchema);
