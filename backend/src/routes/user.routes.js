import express from "express"
import { verifySession, refreshSession } from "../../../backend/src/middlewares/auth.js";
const Router = express.Router();

Router.get("/profile",verifySession, async(req,res)=>{
    res.status(200).json({msg:"Profile",user:req.user});
})
Router.get("/refreshsession",refreshSession, async(req,res)=>{
    })
    
export default Router;