import mongoose from "mongoose";
const notificationsSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
notificationsSchema.index({ owner: 1 });
export default mongoose.model("Notifications", notificationsSchema);
