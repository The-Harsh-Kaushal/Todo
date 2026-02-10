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
  unique_id: {
    type: String,
    required: true,
    unique: true
  },
  refresh_token: {
    type: [String],
    default: []
  },
  boards:
  {
    type:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "board"
    }],
    default:[]
  }
}
);
userSchema.index({ email: 1, unique_id: 1 });

export default mongoose.model("User", userSchema);