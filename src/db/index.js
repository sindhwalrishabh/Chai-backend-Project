import mongoose from 'mongoose';
import {db_name} from '../constants.js';

// db in another contient
const ConnectDB = async () => {
    try{
        const mongoUri = process.env.MONGODB_URI?.trim();
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not set");
        }
        const connectionString = new URL(mongoUri);
        connectionString.pathname = `/${db_name}`;
        const connectionInstance = await mongoose.connect(connectionString.toString());
        console.log(`\nMongoDB connected: ${connectionInstance.connection.host}\n`);}
    catch(error){
        console.log("MongoDB connection Error:",error)
        process.exit(1)
    }
}
export default ConnectDB;