import User from "../models/user.model.js";


const getCurrentUser=async(req,res)=>{
    try{
        const userId=req.userId;
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"user not found!"});
        }
        return res.status(200).json(user);
    }catch(err){
                return res.status(500).json({message:`failed to get user details error :${err}`})
    }
}
export default getCurrentUser;