import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../Models/user.models.js"

export const verifyJwt = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer","")

        if(!token){
            throw new ApiError(400 , "You are not Authorized User")
        }

        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

        if(!decodedToken){
            throw new ApiError(400 , "Invalid Access Token")
        }

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(400 , "User not found")
        }

        req.user = user
        next()
    } 
    catch (error) {
        console.log("Invalid Access Token" , error);
        
    }
})