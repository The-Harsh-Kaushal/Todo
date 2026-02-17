import mongoose from "mongoose";
const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
});
boardSchema.index({ owner: 1 });
export default mongoose.model("board", boardSchema);
