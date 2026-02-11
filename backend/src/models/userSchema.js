import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  refresh_token: {
    type: [String],
    default: []
  },
}
);
userSchema.index({ email: 1});

export default mongoose.model("User", userSchema);