import mongoose from 'mongoose';
import {db_name} from '../constants.js';

// db in another contient
const ConnectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`);
        console.log(`\nMongoDB connected: ${connectionInstance.connection.host}\n`);}
    catch(error){
        console.log("MongoDB connection Error:",error)
        process.exit(1)
    }
}
export default ConnectDB;