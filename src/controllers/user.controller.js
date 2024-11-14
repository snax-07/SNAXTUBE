import {ApiError}  from "../utils/ApiError.js"
import {ApiResponse} from  "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import { asynchandler } from "../utils/asynchandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


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
        
        // userSchema.methods.isPasswordCorrect = async function(inputPassword) {
        //     return await bcrypt.compare(inputPassword, this.password);
        // };
        
        const isValid = await user.isPasswordCorrect(password)

        if(!isValid) throw new ApiError(401 , "Invalid credentials")

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
            $unset : {
                refreshToken : 1
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

const refreshAccessToken = asynchandler(async (req , res) => {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingToken) throw new ApiError(401, "Unauthorised Request")
   try {
         
    const decodedToken = jwt.verify(incomingToken , process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)
    if(!user) throw new ApiError(401 , "Invalid refresh token")

    //MATCH TOKEN 

    if(incomingToken != user?.refreshToken) throw new ApiError(401 , "Refresh token is expired or used")
    const {accessToken , refreshToken : newRefreshToken} = await genrateAccessRefreshTokens(user._id)

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200).cookie("accessToken" , accessToken , options).cookie("refreshToken" , newRefreshToken , options).json(new ApiResponse(200, 
        {accessToken  }
    ))
   } catch (error) {
        throw new ApiError(401 , "Invalid Refresh Token")
   }
})


const changeCurrentPassword = asynchandler(async (req, rse) =>{
        //CHECK LGGED IN 
        //RFERSH TOKEN -> USER DECODE


        //FETCH USER PASS 
        //OLDVALID = AWAIT ISPASSWORDCORRECY(OLDPASSWORD) -> ()TRUE USER.SAVE("PASSWORD" , AWAIT BCYPT.HYASH(NEWPASWORD , 12)) 
        //RES.STATUS(200).JSON(API(200 , {} , "PASSWORD CHANGED SUCCEFULLY"))
    const {oldPassword , newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

        if(!isPasswordCorrect) throw new ApiError(400 , "Invalid old password")

            user.password = newPasswordpassword
            await user.save({validateBeforeSave : false})

            return res.status(200)
                   .json(new ApiResponse(200 , { } , "password changed succefully"))

})

const getCurrentUser = asynchandler(async (req, res) => {
    return res.status(200).json(200,req.user,"Current user")
})

const updateAccountDetails = asynchandler(async (req,res) => {
    const {fullname ,email} = req.body
    if(!fullname || !email) throw new ApiError(400 , "All feilds required")

    const UpdaedUser = User.findByIdAndUpdate(req.user?._id , {
        $set : {
            fullname,
            email
        }
    } , {new : true}).select("-password")

    return res.status(200).json(new ApiResponse(200 , UpdaedUser , "User Updated Succefully"))
})

const updateAvatar = asynchandler(async (req , res) => {
    //local
    //cloudniry use upload


    const avatarlocalPath = req.file?.path

    if(!avatarlocalPath) throw new ApiError(400 , "Avatar file is missing")

    const avatar = await uploadOnCloudinary(avatarlocalPath)
    if(!avatar) throw new ApiError(400, "Error while uploading avatar")


        const user = await User.findByIdAndUpdate(req.user?._id , {
            $set : {
                avatar : avatar.url
            }
        },
        {new : true})
        return res.status(200).json( new ApiResponse (200 , user , "Avatar updated scuccess"))
})

const updateCoverImage = asynchandler(async (req , res) => {
    //local
    //cloudniry use upload


    const coverImagelocalPath = req.file?.path

    if(!coverImagelocalPath) throw new ApiError(400 , "coverImage file is missing")

    const coverImage = await uploadOnCloudinary(coverImagelocalPath)
    if(!coverImage) throw new ApiError(400, "Error while uploading avatar")


        const user = await User.findByIdAndUpdate(req.user?._id , {
            $set : {
                avatar : coverImage.url
            }
        },
        {new : true})


        return res.status(200).json( new ApiResponse (200 , user , "Coverimage updated scuccess"))
})

const getUserChannelProfile = asynchandler(async (req , res) => {
    const username = req.params

    if(!username?.trim) throw new ApiError(400 , "Username is missing")

        const channel = await User.aggregate([
            {
                $match : {
                    username : username?.toLowerCase()
                }
            },
            {
               $lookup : {
                from : "Subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
               }
            },
            {
                $lookup : {
                    $lookup : {
                        from : "Subscriptions",
                        localField : "_id",
                        foreignField : "subscriber",
                        as : "subscriberedTo"
                       }
                }
            },
            {
                $addFields : {
                    subscribersCount : {
                        $size : "$subscribers"
                    },
                    channelSubscribedCount : {
                        $size : "$subscriberedTo"
                    },
                    isSubscribed : {
                        $cond : {
                            if : {$in : [req.user?._id , "$subscribers.subscriber"]},
                            then : true,
                            else : false 
                        }
                    }
                }
            },
            {
                $project : {
                    fullname : 1,
                    username : 1,
                    subscribersCount : 1,
                    channelSubscribedCount : 1,
                    isSubscribed : 1,
                    avatar : 1,
                    coverImage : 1

                }
            }
        ])

        if(!channel?.length)  throw new ApiError(404 , "Channel does not exist")

            return res.status(200).json(
                new ApiResponse(
                    200,
                    channel[0],
                    "User channel fetched successfully"
                )
            )
})

const getWatchHistory = asynchandler(async (req , res) => {
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            },
            $lookup :{
                from : "Videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "ownerShip",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project :{
                                        fullname: 1,
                                        username :  1,
                                        avatar :1 
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
    ))
})

export  {
registerUser , 
loginUser  ,
loggedOutUser ,
refreshAccessToken ,
changeCurrentPassword ,
getCurrentUser,
updateAccountDetails ,
updateAvatar ,
updateCoverImage,
getUserChannelProfile,
getWatchHistory
}


