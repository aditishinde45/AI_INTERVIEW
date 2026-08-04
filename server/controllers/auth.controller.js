import User from "../models/user.model.js";
import getToken from "../config/token.js";
export const googleAuth=async(req,res)=>{
    try{
        const {name,email}=req.body;
        let user=await User.findOne({email});
        if(!user){
            user=await User.create({
                name,
                email
            })
        }
        let token=await getToken(user._id);
        res.cookie("token",token,{
            http:true,
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        })
        return res.status(200).json(user);
    }catch(err){
        return res.status(500).json({message:`google Auth error :${err}`})
        console.log(err);
    }
}
export const logout=async(req,res)=>{
    try{
        await res.clearCookie("token")
        return res.status(200).json({message:"LogOut Successfully!"});
    }catch(err){
        return res.status(500).json({message:`log out error :${err}`})
        console.log(err);
    }
}