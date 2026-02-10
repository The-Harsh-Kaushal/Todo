import mongoose from "mongoose"

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    board: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    tasks: {
        type: [String],
        default: []
    }
})
listSchema.index({ owner: 1, order: 1,board: 1 });
export default mongoose.model("list",listSchema);