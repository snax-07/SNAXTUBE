import bcrypt from "bcrypt"
import {ApiError}  from "../utils/ApiError.js"
import {ApiResponse} from  "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import { asynchandler } from "../utils/asynchandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"



const genrateAccessRefreshTokens = async (userID) => {
    try {
        const user = await  User.findById(userID)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500 , "Something went wrong refresh and access token")
    }
}
const registerUser  = asynchandler( async (req, res) => {
    //  GET USER DETAIL FROM FRONTEND USING REQ PARAMETER
    //  VALIDATION - not empty
    //  CHECK IF USER IS ALREADY EXIST : USING username and email
    //  CHECK FOR IMAGES , CHECK FOR AVATAR 
    //  UPLOAD THEM TO CLOUDINARY , AVATAR
    //  CREATE OBJECT - CREATE ENTRY IN DB
    //  REMOVE PASSWORD AND REFRESH TOKEN FROM RESPONSE
    //  CHECK FOR USER CREATION 
    //  RETURN RESPONSE


    const {fullname , username , password , email} = req.body;
    if(
        [fullname , email , username , password].some((feild) => feild?.trim() === "")
    ){
        throw new ApiError(400 , "All feilds are required")
    }

    const existedUser = await User.findOne({
        $or:[{  username } , { email }]
    })

    if(existedUser){
        throw new ApiError(409,"User with email is existed")
    }

    const avatarlocalPath = req.files?.avatar[0]?.path
    const coverImagelocalPath = req.files?.coverImage[0]?.path

    if(!avatarlocalPath) throw new ApiError(400 , "Avatar file is required")
    
        const avatar = await uploadOnCloudinary(avatarlocalPath)
        const coverImage = await uploadOnCloudinary(coverImagelocalPath)

        if(!avatar) throw new ApiError(400 , "Avatar file is required")
    
        const user = await User.create({
            fullname ,
            avatar : avatar.url,
            coverImage : coverImage?.url || "",
            email,
            password ,
            username
        })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new ApiError(500 , "Something went wrong registering user")
    
        return res.status(201).json(
            new ApiResponse(200 , createdUser , "User registered successfully")
        )
    
})


const loginUser = asynchandler(async (req, res) => {

    //USERNAME OR EMAIL 
    // FIND THE USER 
    //PASS CGHECK
    //ACCESS AND REFRESH TOKEN
    //SEND COOKIE

    const {email ,username , password} =req.body;

    if(!username && !email) throw new ApiError(400 , "Username is required.")

        const user = await User.findOne({
            $or : [{username} , {email}]
        })
        
        if (!user) {
            throw new ApiError(404 , "User not found")
        }
        const isPassValid = await bcrypt.compare( password , user.password)
        
        
        if(!isPassValid) throw new ApiError(401 , "Invalid credentials")

            const {accessToken , refreshToken} =  await genrateAccessRefreshTokens(user._id)


        const loggedInUser = await User.findById(user._id).select("-password  -refreshToken")

        const options = {
            httpOnly : true,
            secure : true
        }

        return res.status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json(
            new ApiResponse(200 , 
                {
                    user : loggedInUser , accessToken , refreshToken
                },
                "User logged in successfully"
            )
        )
})

const loggedOutUser = asynchandler(async (req, res) => {
 await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true 
        }
    )


    const options = {
        httpOnly : true ,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))


    })


export  {registerUser , loginUser  , loggedOutUser}