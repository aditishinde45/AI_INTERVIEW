import jwt from "jsonwebtoken";

const getToken=async(userId)=>{
try{
const token=jwt.sign({userId},process.env.JWT_SECRETE,{expiresIn:"7d"});
return token;
}catch(err){
    console.log(err);
}
}
export default getToken;