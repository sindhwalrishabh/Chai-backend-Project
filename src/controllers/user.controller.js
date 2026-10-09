import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/User.model.js";
import {uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req,res)=>{
   //get user details from frontend
   // validation lgana pdega at least (check krege empty to nhi h)
   //check if user register mtlb user ka account phle se to nhi bnawa check: username se,email se
   //check avatar ya phir cover image
   //upload them cloudinary,check avatar again 
   //create user object - create entry in db
   // remove password and refresh token field from response
   // check response aaya hai(user creation hua ki nhi) yha nhi agr nhi aaya to error ayga
   // return respnse or nhi aya to error bj denge

// destructuring
const {fullname,username,email,password} = req.body
console.log("email:",email);

// if(fullName == ""){
//     throw new ApiError(400,"fullname is required")
// }
if(
    [fullname,email,username,password].some((field) => field?.trim === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or : [{username},{email},{fullname}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username or fullname is already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) 
    if(! createdUser){
        throw newApiError(500,"Something went wrong registering a user")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )
})
export {
    registerUser,
}