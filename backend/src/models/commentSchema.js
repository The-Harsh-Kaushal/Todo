import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "task"
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
commentSchema.index({ task: 1 });
export default mongoose.model("comment", commentSchema);
