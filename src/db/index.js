import dns from "dns";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// hume database se baar baar baat toh krni hi hai, user k controller mein, video k controller mein baar baar baat krenge toh same syntax ko baar baar likhne se better hai hum ek utility file bna le usky method mein function pass krke apna data nikaal lu, wrapper lga denge usky aage
const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MONGODB connected !! DB Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MONGODB connection error ", error);
        process.exit(1)
    }
}
export default connectDB;