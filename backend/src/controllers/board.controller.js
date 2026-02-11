import userSchema from "../models/userSchema.js";
import boardSchema from "../models/boardSchema.js";
import taskSchema from "../models/taskSchema.js";
import listSchema from "../models/listSchema.js";
import commentSchema from "../models/commentSchema.js";

const getBoards= async(req,res,next)=>{
    const page = req.query.page;
    try {
        const boards= await  boardSchema.find().skip((page)*10).limit(10).sort({owner:1});
        res.status(200).json({boards});
    } catch (error) {
        console.log("Error occurred while getting boards:", error);
        res.status(500).send("Internal Server Error");
    }
}

const creteBoard = async(req,res,next)=>{
    const {id} = req.user;
    const {board_name }= req.body;
    try {
        const board = new boardSchema({name:board_name,owner:id});
        await board.save();
    res.status(200).json({msg:"Board created"});
    } catch (error) {
        console.log("Error occurred while creating board:", error);
        res.status(500).send("Internal Server Error");
    }
}
// const getBoardDetails = async(req,res,next)=>{
//     const {board_id} = req.params;
//     try {
//         const board = await boardSchema.findById(board_id);
//         if(!board){
//             return res.status(400).send("Board not found");
//         }
        
//         res.status(200).json({msg:"Board details",board});
//     } catch (error) {
//         console.log("Error occurred while getting board details:", error);
//         res.status(500).send("Internal Server Error");
//     }
// }
const updateBoard= async(req,res,next)=>{
    const {board_id} = req.params;
    const {id}= req.user;
    const {new_name} = req.body;
    try{
        const board = await boardSchema.findById(board_id);
        if(!board){
            return res.status(400).send("Board not found");
        }
        if(board.owner.toString() !== id){
            return res.status(400).send("Unauthorized");
        }
        board.name = new_name;
        await board.save();
          res.status(200).json({msg:"Board updated"});
    }
    catch(err){
        console.log("Error occurred while updating board:", err);
        res.status(500).send("Internal Server Error");
    }
}
const deleteBoard= async(req,res,next)=>{
    const {board_id} = req.params;
    const {id}= req.user;
    try{
        const board = await boardSchema.findById(board_id);
        if(!board){
            return res.status(400).send("Board not found");
        }
        if(board.owner.toString() !== id){
            return res.status(400).send("Unauthorized");
        }
        const lists = listSchema.find({board:board_id}).select("_id");
        const tasks = taskSchema.find({list:{$in: lists}}).select("_id");
        await commentSchema.deleteMany({task:{$in:tasks}});
        await taskSchema.deleteMany({list:{$in:lists}});
        await listSchema.deleteMany({board:board_id});
        res.status(200).json({msg:"Board deleted"});
    }
    catch(err){
        console.log("Error occurred while deleting board:", err);
        res.status(500).send("Internal Server Error");
    }
}


export default {getBoards,creteBoard,updateBoard,deleteBoard};