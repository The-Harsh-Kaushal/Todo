import userSchema from "../models/userSchema.js";
import boardSchema from "../models/boardSchema.js";
import taskSchema from "../models/taskSchema.js";
import listSchema from "../models/listSchema.js";
import commentSchema from "../models/commentSchema.js";

const getBoards= async(req,res,next)=>{
    const {unique_id} = req.user;
    try {
        const user = await userSchema.findOne({unique_id});
        if(!user){
            return res.status(400).send("User not found");
        }
        const boards= await  boardSchema.find({owner:unique_id});
        
    res.status(200).json({boards: boards});
    } catch (error) {
        console.log("Error occurred while getting boards:", error);
        res.status(500).send("Internal Server Error");
    }
}

const creteBoards = async(req,res,next)=>{
    const {unique_id} = req.user;
    const {board_name }= req.body;
    try {
        const user = await userSchema.findOne({unique_id});
        if(!user){
            return res.status(400).send("User not found");
        }1
        const board = new boardSchema({name:board_name,owner:unique_id});
        await board.save();
        user.boards.push(board._id);
        await user.save();
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
    const {unique_id}= req.user;
    const {new_name} = req.body;
    try{
        const board = await boardSchema.findById(board_id);
        if(!board){
            return res.status(400).send("Board not found");
        }
        if(board.owner.toString() !== unique_id){
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
    const {unique_id}= req.user;
    try{
        const board = await boardSchema.findById(board_id);
        if(!board){
            return res.status(400).send("Board not found");
        }
        if(board.owner.toString() !== unique_id){
            return res.status(400).send("Unauthorized");
        }
        
        await Promise.all(board.lists.map(async (listId) => {
            try{
                const tasks = await taskSchema.find({list:listId});
                await Promise.all(tasks.map(async (taskId) => {
                    await commentSchema.deleteMany({task:taskId});
                }))
                await taskSchema.deleteMany({list:listId});
            }
            catch(err){
                console.log("Error occurred while deleting list:", err);
                res.status(500).send("Internal Server Error");
            }
            
        }))
        await listSchema.deleteMany({board:board_id});
        await boardSchema.deleteOne({_id:board_id});
        await userSchema.updateOne({unique_id},{$pull:{boards:board_id}});
            res.status(200).json({msg:"Board deleted"});
    }
    catch(err){
        console.log("Error occurred while deleting board:", err);
        res.status(500).send("Internal Server Error");
    }
}

const getLists = async(req,res,next)=>{
    const {board_id} = req.params;
    const {page} = req.query;
    if(!board_id) return res.status(400).json({msg:"select a board to get lists"})
    try {
        const board = await boardSchema.findById(board_id);
        if(!board){
            return res.status(400).send("Board not found");
        }
        const lists= await  listSchema.find({board:board_id}).skip((page)*10).limit(10).sort({order:1});
        
    res.status(200).json({lists: lists});
    } catch (error) {
        console.log("Error occurred while getting lists:", error);
        res.status(500).send("Internal Server Error");
    }
}
export default {getBoards,creteBoards,updateBoard,deleteBoard,getLists};