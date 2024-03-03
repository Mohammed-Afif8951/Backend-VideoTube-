import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"  
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser  = asyncHandler( async (req,res) =>{
    // get user details from fronted
    // validation - not empty
    // check if user already exists : username , email
    // check for images , check for avatar
    // upload them to cloudinary : avatar
    // create user object - create entry in DB
    // remove password and refresh token field from response 
    // check for user creation 
    // return res

    const {fullname, email, username, password} = req.body
    console.log("email : ", email);

   /* we can use multiple if condiion for checking all 
    if (fullname ==="") {
        throw new ApiError(400,"fullname is required")
    }
    */

    // validation - not empty
    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() ==="")
    ) {
        throw new ApiError(400,"All field all required")
    }


    // check if user already exists : username , email
    const existedUser = User.findOne({ //use console.log and see existed user
        $or:[{ username },{ email }]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    // check for images , check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path; //use console.log and see req.files
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // check for avatar
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    // upload them to cloudinary : avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    // create user object - create entry in DB
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //check if user is created : (User.findById(user._id))
    // remove password and refresh token field from response 
    const crreatedUser = await User.findById(user._id).select(
        "-password -refreshToken" //in .select() all fields are selected so remove the that we dont need
    )

     // check for user creation 
    if(!crreatedUser){
        throw new ApiError(500,"Something went wrong while registering user")
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200,crreatedUser,"USer registered successfully")
    )



})


export {registerUser}

