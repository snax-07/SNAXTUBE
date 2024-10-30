import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    username : {
        type :  String,
        required : true ,
        unique : true ,
        lowercase : true,
        trim:true,
        index : true
    },

    email : {
        type :  String,
        required : true ,
        unique : true ,
        lowercase : true,
        trim:true
    },

    fullname : {
        type :  String,
        required : true ,
        trim:true,
        index : true
    },

    avatar : {
        type : String, //THIS IS URL FOR IMAGE BY CLOUDINARY FOR IMAGE 
        required : true,
    },

    coverImage : {
        type : String, //THIS IS URL FOR IMAGE BY CLOUDINARY FOR IMAGE 
    },

    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],


    password : {
        type : String,
        required : [true , "Password is required"]
    },

    refreshToken : {
        type : String
    }
} , {timestamps : true})

//     userSchema.pre("save" , async function (next) {
//     if(this.isModified("password")) return next();

//     this.password = await bcrypt.hash(this.password , 10)
//     next()
// })

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next(); // Only hash if the password is new or modified
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.isPasswordCorrect = async function(inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};


userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id,
        email : this.email,
        username : this.username ,
        fullname : this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn : "1h"
    })
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id
    },
    process.env.REFRESH_TOKEN_SECRET,{
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    })
}
export const User  = mongoose.model("User" , userSchema) 