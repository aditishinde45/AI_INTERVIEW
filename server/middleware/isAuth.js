import jwt from "jsonwebtoken";

const isAuth=async(req,res,next)=>{
try{
    let {token}=req.cookies;
    if(!token){
        return res.status(400).json({message:"user does not have token"});
    }
    const verifyToken=jwt.verify(token,process.env.JWT_SECRETE);
    if(!verifyToken){
        return res.status(400).json({message:"user does not have valid token"});
    }
    req.userId=verifyToken.userId;
    next();
}catch(err){
            return res.status(500).json({message:`isAuth error :${err}`});
}
}
export default isAuth;