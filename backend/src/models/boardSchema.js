import mongoose from "mongoose";
const boardSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    owner:{
        type:String,
        required:true
    },
    lists:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "list",
            unique: true
        }],
        default:[]
    }
})
boardSchema.index({ owner: 1 });
export default mongoose.model("board",boardSchema);