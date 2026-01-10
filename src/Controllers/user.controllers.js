import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../Models/user.models.js";


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);

        const refreshToken = await user.generateRefreshToken()
        const accessToken = await user.generateAccessToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false})
        return {refreshToken , accessToken}
    } 
    catch (error) {
        throw new ApiError(400 , "Refresh And Access Token cannot be generated")
    }
}


const userRegister = asyncHandler(async(req,res)=>{
    const {fullName , email, password , userName , adminKey} = req.body

    let role = "user"

    if(adminKey === process.env.ADMIN_SECRET_KEY){
        role = "admin"
    }

    if([fullName,email,password,userName].some((field)=>field?.trim()==="")){
        throw new ApiError(402 , "All fields are Required")
    }

    const existedUser = await User.findOne({
        $or:[{email} , {userName}]
    })

    if(existedUser){
        throw new ApiError(400 , "User Already existed with Email or User Name")
    }

    const user = await User.create({
        userName,
        fullName,
        email,
        password,
        role
    })

    if(!user){
        throw new ApiError(400 , "User cannot be Registerd Successfully")
    }

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    
    if(!createdUser){
        throw new ApiError(400 , "User does not created successfully")
    }

    return res.json(
        new ApiResponse(200 , createdUser , "User Created successfully")
    )

})

const loginUser = asyncHandler(async(req,res)=>{
    const  {email , password} = req.body;

    if(!email || !password){
        throw new ApiError(400 , "Password and email both are required to login a user")
    }

    const user = await User.findOne({
        $or:[{email} , {password}]
    })

    if(!user){
        throw new ApiError(400 , "User Not found")
    }

    const isValidPassword = await user.isPasswordCorrect(password);

    if(!isValidPassword){
        throw new ApiError(403 , "Password is Incorrect")
    }

    const {refreshToken , accessToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    if(!loggedInUser){
        throw new ApiError(400 , "User cannot be logged in due to some problem")
    }

    const option = {
        httpOnly : true,
        secure : true
    }

    return res
    .cookie("accessToken" , accessToken , option)
    .cookie("refreshToken" , refreshToken , option)
    .json(
        new ApiResponse(200 , {user : loggedInUser , refreshToken , accessToken} , "User Logged in Successfully")
    )
})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset : {refreshToken : 1}
        },
        {
            new : true
        }
    )

    const option = {
        httpOnly:true,
        secure : true
    }

    return res
    .cookie("accessToken" , option)
    .cookie("refreshToken" , option)
    .json(
        new ApiResponse(200 , {} , "User Logout Successfully")
    )
})

const viewProfile = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user?._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError("You are not authorized to access this route")
    }

    return res.json(
        new ApiResponse(200 , user , "User Profile fetched Successfully")
    )
})

export {userRegister,loginUser,logoutUser,viewProfile}