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
        const isSecure = process.env.NODE_ENV === "production" || req.secure || req.headers["x-forwarded-proto"] === "https";
        res.cookie("token", token, {
          httpOnly: true,
          secure: isSecure,
          sameSite: isSecure ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json(user);
    }catch(err){
    console.error(err);
    return res.status(500).json({
        message: err.message
    });
    }
}
export const logout=async(req,res)=>{
    try{
        const isSecure = process.env.NODE_ENV === "production" || req.secure || req.headers["x-forwarded-proto"] === "https";
        res.clearCookie("token", {
          httpOnly: true,
          secure: isSecure,
          sameSite: isSecure ? "none" : "lax",
        });
        return res.status(200).json({message:"LogOut Successfully!"});
    }catch(err){
        return res.status(500).json({message:`log out error :${err}`})
        console.log(err);
    }
}