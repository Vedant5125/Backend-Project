import apiError from "../utils/apiError.js";
import asynHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js"

const verifyJWT = asynHandler(async (req, _ , next) =>{ // _ given as res is unused
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!token){
            throw new apiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken") //here _id is from generateAccessToken in user model
        if(!user){
            throw new apiError(401, "Invalid access token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401, error?.message ||  "Invalid access token")
    }
})

export default verifyJWT