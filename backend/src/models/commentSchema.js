import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    task: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
commentSchema.index({ task: 1 });
export default mongoose.model("comment",commentSchema);