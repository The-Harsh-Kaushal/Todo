
import userSchema from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {SALT_ROUNDS,JWT_SECRET} from "../config/env.js";
import { AT_LIFE, RT_LIFE } from "../config/env.js";

const loginMiddleware = async (req, res, next) => {
   const {identifier,password} = req.body;
   if(!identifier || !password){
       return res.status(400).send("Identifier and password are required");
   }
   try {
    const user = await userSchema.findOne({$or: [{email: identifier}, {unique_id: identifier}]}).select("-_id -refresh_token -boards");
     if (!user) {
       return res.status(400).send("User not found");
     }
     const isMatch = await bcrypt.compare(password, user.password);
     if (!isMatch) {
       return res.status(400).send("Invalid credentials");
     }
     const refresh_token = jwt.sign({ unique_id: user.unique_id,email: user.email,name:user.name }, JWT_SECRET, { expiresIn: RT_LIFE });
     const access_token = jwt.sign({ unique_id: user.unique_id,email: user.email,name:user.name }, JWT_SECRET, { expiresIn: AT_LIFE });

     res.cookie("refresh_token", refresh_token, { httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
         });
        res.status(200).json({ msg: "Login successful", access: access_token });
     
   } catch (error) {
     console.log("Error occurred during login:", error);
     res.status(500).send("Internal Server Error");
   }
};
const signupMiddleware= async(req,res,next)=>{
  const {email,password,name,unique_id} = req.body;
  if(!email || !password || !name || !unique_id){
      return res.status(400).send("All fields are required");
  }
  try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const response = await userSchema.findOne({$or: [{email}, {unique_id}]});
      if (response) {
          return res.status(400).send("User already exists");
      }
      const refresh_token = jwt.sign({ unique_id, email, name }, JWT_SECRET, { expiresIn: RT_LIFE });
      const access_token = jwt.sign({ unique_id, email, name }, JWT_SECRET, { expiresIn: AT_LIFE });
      
      const newUser = new userSchema({ email, password: hashedPassword, name, unique_id, refresh_token: [refresh_token] });
      await newUser.save();
   res.cookie("refresh_token", refresh_token, { httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
     });
    res.status(201).json({ msg: "Signup successful" , access: access_token });
      next();
  } catch (error) {
      console.log("Error occurred during signup:", error);
      res.status(500).send("Internal Server Error");
  }
};

export default {loginMiddleware,signupMiddleware};


