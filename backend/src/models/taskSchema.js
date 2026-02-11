import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    default: "",
  },
  deadline: {
    type: Date,
    required: true,
  },
  collabrators: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  priority: {
    type: Number,
    default: 0,
  },
});
taskSchema.index({ list: 1, owner: 1 });
export default mongoose.model("task", taskSchema);
