import asynHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import User from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import apiResponse from "../utils/apiResponse.js";

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
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImageLocalPath.length>0){
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

export default registerUser;