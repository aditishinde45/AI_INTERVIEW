import mongoose from "mongoose";
const connectDb=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("database connected");
    }catch(err){
        console.log(`databse error ${err}`);
    }
}
export default connectDb;