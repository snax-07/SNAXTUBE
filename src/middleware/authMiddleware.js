import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import {asynchandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
export const verifyJWT  =  asynchandler( async (req , res , next) => { 
       try {
        const token = req.cookies.accessToken // || req.header("Authorization")?.replace("Bearer ", "")

        if(!token) throw new ApiError(401 , "Unauthorised request")

        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user) throw new ApiError(401, "Inavalid Access Token")

                req.user = user;
                next()
        
       } catch (error) {
                throw new ApiError(401 , error?.message || "Invalid Token")
       }
                
})