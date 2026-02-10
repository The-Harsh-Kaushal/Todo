import taskSchema from "../models/taskSchema.js";
import commentSchema from "../models/commentSchema.js";

const addComment = async(req,res,next)=>{
    const {task_id} = req.params;
    const {comment} = req.body;
    const {unique_id} = req.user;
    if(!task_id) return res.status(400).json({msg:"select a task to add comment"});
    try{
        const task = await taskSchema.findById(task_id);
        if(!task){
            return res.status(400).send("Task not found");
        }
        const newComment = new commentSchema({
            text: comment,
            owner: unique_id,
            task: task_id
        })
        await newComment.save();
        task.comments.push(newComment._id);
        await task.save();
        res.status(200).json({msg:"Comment added"});
    }
    catch(err){
        console.log("Error occurred while adding comment:", err);
        res.status(500).send("Internal Server Error");
    }
}
const deleteComment = async(req,res,next)=>{
    const {task_id,comment_id} = req.params;
    const {unique_id} = req.user;
    if(!task_id) return res.status(400).json({msg:"select a task to delete comment"});
    try{
        const task = await taskSchema.findById(task_id);
        if(!task){
            return res.status(400).send("Task not found");
        }
        const comment = await commentSchema.findById(comment_id);
        if(!comment){
            return res.status(400).send("Comment not found");
        }
        if(unique_id!=comment.owner && unique_id!=task.owner) return res.status(400).json({msg:"You can delete only your comments"});
        task.comments.pull(comment_id);
        await task.save();
        await commentSchema.deleteOne({_id:comment_id});
        res.status(200).json({msg:"Comment deleted"});
    }
    catch(err){
        console.log("Error occurred while deleting comment:", err);
        res.status(500).send("Internal Server Error");
    }
}
const getAllComments = async(req,res,next)=>{
    const {task_id} = req.params;
    const {page} = req.query;
    if(!task_id) return res.status(400).json({msg:"select a task to get comments"});
    try{
        const task = await taskSchema.findById(task_id);
        if(!task){
            return res.status(400).send("Task not found");
        }
        const comments = await commentSchema.find({task:task_id}).skip((page-1)*10).limit(10).sort({date:-1});
        res.status(200).json(comments);
    }
    catch(err){
        console.log("Error occurred while getting comments:", err);
        res.status(500).send("Internal Server Error");
    }
}

export default {addComment,deleteComment,getAllComments};