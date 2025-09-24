import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  dueDate: Date,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: String,
}, { timestamps: true });

export default mongoose.model("Todo", todoSchema);
