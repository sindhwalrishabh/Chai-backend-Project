// require('dotenv').config({path: './config.env'})\

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import ConnectDB from './db/index.js'

dotenv.config({path: './env'})
ConnectDB()

















// import express from 'express'
// const App = express()
// // create a fxn to connect to the database
// function connectDB(){}


// // ifee approach
// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`)
//         App.on("error",(error) =>{
//             console.log("Error:",error);
//             throw err
//         })   
//         App.listen(process.env.PORT,() => {
//             console.log(`Server is running on port ${process.env.PORT}`)
//         })
//     }
//     catch(err){
//         console.log("Error:",error)
//         throw error
// }
// })

//yh jada bheter  approach hai  alg se sara db ka code likho 