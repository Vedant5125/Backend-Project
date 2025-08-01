import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema(
    {
        username: {
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
            index:true
        },
        email: {
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
        },
        fullname: {
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar: {
            type:String,  //cloudinary image url
            required:true
        },
        coverImage: {
            type:String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password: {
            type:String,
            required:[true, "Password is required"]
        },
        refreshToken: {
            type:String
        },

    },{timestamps:true}
);

// mongoDB hook pre and also bcrypt
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d"
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
                _id: this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "1d"
            }
        )
}

const User = mongoose.model("User", userSchema);
export default User;