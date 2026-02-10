import boardSchema from "../models/boardSchema.js";
import listSchema from "../models/listSchema.js";
import taskSchema from "../models/taskSchema.js";
import commentSchema from "../models/commentSchema.js";
const AddList= async(req,res,next)=>{
    const {board_id} = req.params;
    const {list_name} = req.body;
    const {unique_id}= req.user;
    if(!list_name ) {
        return res.status(400).json({msg: "fill the required fields"});
    }
    if(!board_id){
        return res.status(400).json({msg: "board not found"});
    }
    try{
        const board = await boardSchema.findById(board_id);
        if(unique_id.toString() !== board.owner.toString()){
            return res.status(400).send("Unauthorized");
        }
        if(!board){
            return res.status(400).send("Board not found");
        }
        const list = new listSchema({name:list_name,owner:unique_id,board:board_id,order:board.lists.length});
        await list.save();
        board.lists.push(list._id);
        await board.save();
        res.status(200).json({msg:"List added"});

    }        
    catch(err){
        console.log("Error occurred while adding list:", err);
        res.status(500).send("Internal Server Error");
    }
}
const UpdateList = async(req,res,next)=>{
    const {list_id} = req.params;
    const {list_name} = req.body;
    if(!list_id || !list_name){
        return res.status(400).json({
            msg: "fill all the required fields"
        })
    }
    try{
        const list = await listSchema.findById(list_id);
        if(!list){
            return res.status(400).send("List not found");
        }
        list.name = list_name;
        await list.save();
        res.status(200).json({msg:"List updated"});
    }
    catch(err){
        console.log("Error occurred while updating list:", err);
        res.status(500).send("Internal Server Error");
    }
}
const DeleteList = async(req,res,next)=>{
    const {list_id} = req.params;
    if(!list_id) return res.status(400).json({msg:"select a list to delete"})
    try{
        const list = await listSchema.findById(list_id);
        if(!list){
            return res.status(400).send("List not found");
        }
        const tasks = await taskSchema.find({list:list_id});
        await Promise.all(tasks.map(async (task) => {
            await commentSchema.deleteMany({task:task._id});
        }))
        await taskSchema.deleteMany({list:list_id});
        await listSchema.deleteOne({_id:list_id});
        res.status(200).json({msg:"List deleted"});
    }
    catch(err){
        console.log("Error occurred while deleting list:", err);
        res.status(500).send("Internal Server Error");
    }
}
const ChangeOrder = async(req,res,next)=>{
    const {list_id} = req.params;
    const {new_order} = req.body;
    
    if(!list_id || !new_order) return res.status(400).json({
        msg: "fill the requried fields"
    })
    try{
       
        const list = await listSchema.findById(list_id);
        if(!list){
            return res.status(400).send("List not found");
        }
        const list2 = await listSchema.findOne({order:new_order});
        if(!list2){
            return res.status(400).send("Order should be less than total number of lists");
        }
        const temp = list.order;
        list.order = list2.order;
        list2.order = temp;
        await list.save();
        await list2.save();
        res.status(200).json({msg:"List order updated"});
    }
    catch(err){
        console.log("Error occurred while updating list order:", err);
        res.status(500).send("Internal Server Error");
    }
}
const getAllTasks = async(req,res,next)=>{
    const {list_id} = req.params;
    const {page} = req.query;
    if(!list_id) return res.status(400).json({msg:"select a list to get tasks"});
    try{
        const list = await listSchema.findById(list_id);
        if(!list){
            return res.status(400).send("List not found");
        }
        const tasks = await taskSchema.find({list:list_id}).skip((page)*10).limit(10).sort({order:1});
        res.status(200).json(tasks);
    }
    catch(err){
        console.log("Error occurred while getting tasks:", err);
        res.status(500).send("Internal Server Error");
    }
}

export default {AddList,UpdateList,DeleteList,ChangeOrder,getAllTasks};