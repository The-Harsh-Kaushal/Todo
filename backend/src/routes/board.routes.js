import express from "express"
import { verifySession } from "../../../backend/src/middlewares/auth.js";
import boardControllers from "../controllers/board.controller.js";


const Router = express.Router();
Router.get("/boards",verifySession,boardControllers.getBoards, async(req,res)=>{
})
Router.post("/createboard",verifySession,boardControllers.creteBoard, async(req,res)=>{
})
// Router.get("/getboard/:board_id",verifySession,boardControllers.getBoardDetails, async(req,res)=>{    
    
// })
Router.patch("/updateboard/:board_id",verifySession,boardControllers.updateBoard, async(req,res)=>{

})
Router.delete("/deleteboard/:board_id",verifySession,boardControllers.deleteBoard, async(req,res)=>{
})

export default Router;