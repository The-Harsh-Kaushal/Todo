import express from "express";
import listControllers from "../controllers/list.controller.js";
import { verifySession } from "../middlewares/auth.js";
const Router = express.Router();
Router.post("/addlist/:board_id",verifySession,listControllers.AddList, async(req,res)=>{
})
Router.patch("/updatelist/:list_id",verifySession,listControllers.UpdateList, async(req,res)=>{
})
Router.delete("/deletelist/:list_id",verifySession,listControllers.DeleteList, async(req,res)=>{
})
Router.patch("/changeorder/:list_id",verifySession,listControllers.ChangeOrder, async(req,res)=>{
    
})

Router.get("/getlists/:board_id",verifySession,listControllers.getLists, async(req,res)=>{
})  
export default Router;