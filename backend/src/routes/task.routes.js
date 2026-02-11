import express from "express";
import taskControllers from "../controllers/task.controller.js";
import commentsControllers from "../controllers/comment.controller.js";
import { verifySession } from "../middlewares/auth.js";
const Router = express.Router();
Router.post("/addtask/:list_id",verifySession,taskControllers.createTask, async(req,res)=>{
})
Router.patch("/updatetask/:task_id",verifySession,taskControllers.updateTask, async(req,res)=>{
})
Router.delete("/deletetask/:task_id",verifySession,taskControllers.deleteTask, async(req,res)=>{
})
// Router.patch("/changetaskorder/:task_id",verifySession,taskControllers.changeTaskOrder, async(req,res)=>{
    
// })
Router.patch("/changetaskstatus/:task_id",verifySession,taskControllers.taskStatusUpdate, async(req,res)=>{
    
})
Router.patch("/assigntask/:task_id",verifySession,taskControllers.assignTask, async(req,res)=>{
})
Router.get("/gettask/:task_id",verifySession,taskControllers.taskDetails, async(req,res)=>{
})
Router.post("/addcomment/:task_id",verifySession,commentsControllers.addComment, async(req,res)=>{
})
Router.get("/getcomments/:task_id",verifySession,commentsControllers.getAllComments, async(req,res)=>{
})
Router.delete("/deletecomment/:task_id/:comment_id",verifySession,commentsControllers.deleteComment, async(req,res)=>{
    
})
Router.get("/gettasks/:list_id",verifySession,taskControllers.getAllTasks, async(req,res)=>{
})
export default Router;