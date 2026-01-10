import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../Models/user.models.js";


export const isAdmin = asyncHandler(async(req,res,next)=>{
    try {
        const user = await User.findById(req.user?._id)

        console.log(user.role);
        
        
        if(user.role !== 'admin'){
            throw new ApiError(402 , "Admin Access Only")
        }

        next()
    } 
    catch (error) {
        throw new ApiError(500 , `Internal Server Error : ${error}`)
    }

})
