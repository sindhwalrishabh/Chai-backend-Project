import { Router } from "express";
import {loginUser, logOutUser, refreshAccessToken, registerUser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
const router = Router()
import { verifyJWT } from "../middlewares/auth.middleware.js";


//routes method
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser) //http method 
// router.route("/login").post(login)
    router.route("/login").post(loginUser)

    //secured routes
    router.route("/logout").post(verifyJWT, logOutUser)

    // refresh token route
    router.route("/refresh-token").post(refreshAccessToken)
    
export default router