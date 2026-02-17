import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "board"
  },
  order: {
    type: String,
    required: true,
  },
});
listSchema.index({ owner: 1 });
listSchema.index({ board: 1, order: 1 }, { unique: true });
export default mongoose.model("list", listSchema);
