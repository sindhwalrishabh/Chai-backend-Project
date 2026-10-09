import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js"
const router = Router()


//routes method
router.route("/register").post(registerUser) //http method 
// router.route("/login").post(login)

export default router