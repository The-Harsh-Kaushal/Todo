import taskSchema from "../models/taskSchema.js"
import listSchema from "../models/listSchema.js"
import userSchema from "../models/userSchema.js";

const createTask = async(req,res,next)=>{
      const {list_id} = req.params;
      const {task_name,task_description,task_deadline} = req.body;
      if(!list_id || !task_name || !task_description || !task_deadline){
          return res.status(400).json({
              msg: "fill all the required fields"
          })
      }
      try{
          const list = await listSchema.findById(list_id);
          if(!list){
              return res.status(400).send("List not found");
          }
          const deadline = new Date(task_deadline);
          const task = new taskSchema({name:task_name,list:list_id,owner:list.owner,order:list.tasks.length,description:task_description,deadline:deadline,board:list.board});
          await task.save();
          list.tasks.push(task._id);
          await list.save();
          res.status(200).json({msg:"Task added"});
      }
      catch(err){
          console.log("Error occurred while adding task:", err);
          res.status(500).send("Internal Server Error");
      }
}
const taskDetails = async(req,res,next)=>{
      const {task_id} = req.params;
      if(!task_id){
          return res.status(400).json({
              msg: "fill all the required fields"
          })
      }
      try{
          const task = await taskSchema.findById(task_id);
          if(!task){
              return res.status(400).send("Task not found");
          }
          res.status(200).json(task);
      }
      catch(err){
          console.log("Error occurred while getting task details:", err);
          res.status(500).send("Internal Server Error");
      }
}
const updateTask = async(req,res,next)=>{
      const {task_id} = req.params;
      const task_name = req.body.task_name;
      const task_description=req.body.task_description;
      const task_deadline=req.body.task_deadline;
      const task_order=req.body.task_order;
      if(!task_id) return res.status(400).json({msg:"select a task to update"})

      try{
          const task = await taskSchema.findById(task_id);
          if(!task){
              return res.status(400).send("Task not found");
          }
          if(task.owner.toString() !== req.user.unique_id){
              return res.status(400).send("Unauthorized");
          }
          if(task_name) task.name = task_name;
         if(task_description) task.description = task_description;
         if(task_deadline) task.deadline = task_deadline;
         if(task_order) task.order = task_order;
          await task.save();
          res.status(200).json({msg:"Task updated"});
      }
      catch(err){
          console.log("Error occurred while updating task:", err);
}}
const taskStatusUpdate=async(req,res,next)=>{
      const {task_id} = req.params;
      if(!task_id) return res.status(400).json({msg:"select a task to update"})
      try{
          const task = await taskSchema.findById(task_id);
          if(!task){
              return res.status(400).send("Task not found");
          }
          task.status = !task.status;
          await task.save();
          res.status(200).json({msg:"Task status updated"});
      }
      catch(err){
          console.log("Error occurred while updating task status:", err);
          res.status(500).send("Internal Server Error");
      }
}
const deleteTask = async(req,res,next)=>{
      const{task_id} = req.params;
      if(!task_id) return res.status(400).json({msg:"select a task to delete"});
      try{
          const task = await taskSchema.findById(task_id);
          if(!task){
              return res.status(400).send("Task not found");
          }
          const list = await listSchema.findById(task.list);
          list.tasks.pull(task_id);
          await taskSchema.deleteOne({_id:task_id});
          await list.save();
          res.status(200).json({msg:"Task deleted"});
      }
      catch(err){
          console.log("Error occurred while deleting task:", err);
          res.status(500).send("Internal Server Error");
      }
}
const assignTask = async(req,res,next)=>{
      const {task_id} = req.params;
      const {unique_id} = req.user;
      const {user_id} = req.body;
      if(!task_id) return res.staus(400).json({msg:"select a task to assign"});
      try{
          const task = await taskSchema.findById(task_id);
          if(!task){
              return res.status(400).send("Task not found");
          }
          if(task.owner.toString() !== unique_id){
              return res.status(400).send("Unauthorized");
          }
          const collabrator=await userSchema.findOne({unique_id:user_id});
          if(!collabrator){
              return res.status(400).send("Collabrator not found");
          }
          if(task.collabrators.includes(user_id)){
              return res.status(400).json({msg:"Task already assigned"});
          }
          task.collabrators.push(user_id);
          collabrator.boards.push(task.board);
          await collabrator.save();
          await task.save();
          res.status(200).json({msg:"Task assigned"});
      }
      catch(err){
          console.log("Error occurred while assigning task:", err);
          res.status(500).send("Internal Server Error");
      }
}
const changeTaskOrder = async(req,res,next)=>{
      const {task_id} = req.params;
      const {order} = req.body;
      if(!task_id) return res.status(400).json({msg:"select a task to change order"});
      try{
          const task = await taskSchema.findById(task_id);
          if(!task){
              return res.status(400).send("Task not found");
          }
          const task2= await taskSchema.findOne({order:order});
          if(!task2) return res.status(400).json({msg:"Order should be less than total number of tasks"});
          const temp = task.order;
          task.order = task2.order;
          task2.order = temp;
          await task.save();
          await task2.save();
          res.status(200).json({msg:"Task order changed"});
      }
      catch(err){
          console.log("Error occurred while changing task order:", err);
          res.status(500).send("Internal Server Error");
      }
}

export default {createTask,taskDetails,updateTask,taskStatusUpdate,deleteTask,assignTask,changeTaskOrder};