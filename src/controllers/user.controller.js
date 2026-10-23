import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/User.model.js";
import {uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
}

const generateAccessAndRefreshTokens = async(userId) =>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const newRefreshToken = user.generateRefreshToken()

        user.newRefreshToken = newRefreshToken
        await user.save({validateBeforeSave: false})

        return {newRefreshToken,accessToken}

    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}
const registerUser = asyncHandler(async (req,res)=>{
   //get user details from frontend
   // validation lgana pdega at least (check krege empty to nhi h)
   //check if user register mtlb user ka account phle se to nhi bnawa check: username se,email se
   //check coverImage ya phir cover image
   //upload them cloudinary,check coverImage again 
   //create user object - create entry in db
   // remove password and refresh token field from response
   // check response aaya hai(user creation hua ki nhi) yha nhi agr nhi aaya to error ayga
   // return respnse or nhi aya to error bj denge

const { fullName, username, email, password } = req.body;

// if(fullName == ""){
//     throw new ApiError(400,"fullName is required")
// }
if ([fullName, username, email, password].some(
    (field) => typeof field !== "string" || field.trim() === ""
)) {
    throw new ApiError(400, "All fields are required");
}

    const existedUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    
    

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage file is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if(!coverImage){
        throw new ApiError(400,"coverImage file is required")
    }

    const user = await User.create({
        fullName: fullName.trim(),
        coverImage: coverImage.url,
        coverImage: coverImage?.url || "",
        email: email.toLowerCase(),
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -newRefreshToken"
    ) 
    if(! createdUser){
        throw new ApiError(500,"Something went wrong registering a user")
    }
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})
// yh  method hai user logged in ke liye
const loginUser = asyncHandler(async (req,res) => {
    //req body se data le aao
    //username or email
    //find the user - user hai ki nhi
    //  access and refresh token
    //send cookie

    const { email, password, username } = req.body
    const identifiers = [username, email]
        .filter((value) => typeof value === "string" && value.trim() !== "")
        .map((value) => value.trim().toLowerCase())

    if (identifiers.length === 0 || typeof password !== "string" || password === "") {
        throw new ApiError(400, "Username or email and password are required")
    }

    const user = await User.findOne({
        $or: identifiers.flatMap((identifier) => [
            { username: identifier },
            { email: identifier }
        ])
    })

    if(!user){
        throw new ApiError(404,"User does not find")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentails")
    }
    const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

    // optional steps
    const loggedInUser = await User.findById(user._id).
.select("-password -newRefreshToken")

    // now I create cookies
    // yeh sirf server se modify hoti h
    // is method se ab hume return krna h response
    // yha pe humne cookies set kr diye h access and newRefreshToken ke
    return res
    .status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("newRefreshToken",newRefreshToken,cookieOptions)
    .json(
        // Yha pe vo case handle krre jha pe user khud refresh/accesstoken local storage ya phir kud koi application
        // bnara h to save krna chahra h
        //optional h 
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,newRefreshToken
            },
            "user logged In successfully"
        )
    )    

})
// now I create a method for logout
const logOutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                newRefreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    return res
    .status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("newRefreshToken",cookieOptions)
    .json(new ApiResponse(200,{},"User logged out"))

})
// now I create a endpoint to create new refreshtoken
const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookie.newRefreshToken || req.body.newRefreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
        if(incomingRefreshToken !== user?.newRefreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken,newRefreshAccessToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new  ApiResponse(
                200,
                {accessToken,refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        ) 
    } catch (error) {
        throw new ApiError(401,error?.message ||
            "Invalid refresh token"
        )
    }
})
const  changeCurrentPassword = await asyncHandler(async(req,res) => {
    const {oldPassword, newPassword} = req.body

    const user = User.findById(req.user?.id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid password")
    }

    user.password = newPassword
    user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))

})
const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(200,req.user,"current user fetched successfully")
})

const  updateAccountDetails = asyncHandler(async(req,res) => {
    const{fullName,email} = req.body
    
    if(!fullName && !email){
        throw new ApiError(400,"All fields are required")
    }
    const user = user.findByIdAndUpdate(
        req.user?._id,
        { // set received object
            $set:{
                fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated sucessfully"))
})
// now I use multer to accept request 
// only those person updated who already logged in

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
       throw new ApiError(400,"Error while uploading on avatar")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
       throw new ApiError(400,"Error while uploading on coverImage")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"cover Image updated successfully")
    )
})
export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}
