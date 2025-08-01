import asynHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import User from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}) //refresh token saved to DB
        
        return {accessToken, refreshToken};

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating Refresh and Access Token")
    }
}

const registerUser = asynHandler(async (req, res) =>{
    // get user details from frontend
    // validation
    // check if user already exists - Email
    // check for images
    // if images: upload to cloudinary
    // checks for image on frontend then-> multer then-> cloudinary then u get cloudinary url
    // create user onject - create entry in db
    // remove password and refreshToken field from response
    // check for user creation 
    // return response
    
    const {username, email, fullname, password} = req.body;

    // ek ek karke
    // if(fullname === ""){
    //     throw new apiError(400, "fullname is required");
    // }

    if(
        [username, email, fullname, password].some((field) => field?.trim() === "")
    ){
        throw new apiError(400, "All fields are required");
    }
// can add more validations like email @ or others

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if(existingUser){
        throw new apiError(409, "Username or Email already exists");
    }

    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new apiError(400, "Avatar is required");
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
    if(!createdUser){
        throw new apiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully")
    )
    

});

const loginUser = asynHandler(async (req, res) =>{
    //req.body -> data
    //email or username
    //find for user in DB
    //check password
    //access and refresh tokens
    //send cookies

    const {email, username, password} = req.body;

    if(!(username || email)){
        throw new apiError(400, "Username or Email is required");
    }
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new apiError(400, "User does not exist");
    }
    const validPassword = await user.isPasswordCorrect(password)
    if(!validPassword){
        throw new apiError(400, "Password does not match");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asynHandler(async (req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new apiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )
})

const refreshAccessToken = asynHandler( async(req, res) =>{
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
        if(!incomingRefreshToken){
            throw new apiError(401, "Unauthorized request - error in incomingRefreshToken")
        }
    
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new apiError(401, "Invalid Refresh Token");
        }
    
        if(!(incomingRefreshToken === user?.refreshToken)){
            throw new apiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(new apiResponse(
            200,
            {accessToken, newRefreshToken},
            "Access and refreshed "
        ))
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }
})

export default registerUser;
export {loginUser, logoutUser, refreshAccessToken};