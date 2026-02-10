import mongoose from "mongoose";
const taskSchema  = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    list:{
        type:String,
        required:true
    },
    board:{
        type:String,
        required:true
    },
    owner:{
        type:String,
        required:true
    },
    order:{
        type:Number,
        required:true
    },
    status:{
        type:Boolean,
        default:false
    },
    description:{
        type:String,
        default:""
    },
    deadline:{
        type:Date,
        required:true
    },
    collabrators:{
        type:[String],
        default:[]
    },
    priority:{
        type:Number,
        default:0
    },
    comments:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment"
        }],
        default:[]
    }

});
taskSchema.index({ list: 1, order: 1,owner:1 });
export default mongoose.model("task",taskSchema);