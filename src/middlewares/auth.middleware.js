import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
export const verifyJWT = asyncHandler(async(req,res,next) => {
    // iska mtlb hai yh to cookies se token nikaldo ya phir header se nikaldo
   try {
    const authorizationParts = req.get("Authorization")?.trim().split(/\s+/)
    const headerToken =
        authorizationParts?.length === 2 &&
        authorizationParts[0].toLowerCase() === "bearer"
            ? authorizationParts[1]
            : undefined
    const token = req.cookies?.accessToken || headerToken
 
     if(!token){
         throw new ApiError(401,"unauthorised request");
     }
 
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!user){
         // next_ video : discuss in frontend
         throw new ApiError(401,"Invalid Access Token")
     }
     req.user = user;
     next()
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid access token") 
   }

})
// auth middleware bss itna dekhega ki user hai ya nhi h 