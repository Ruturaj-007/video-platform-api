// 7:10 cloudinary

import mongoose , {Schema}  from 'mongoose';
import bcrypt from "bcryptjs"; // or "bcrypt"
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        index:true,         // sometimes expensive but better to add for searching
        lowercase:true,
        unique:true,
        trim: true
    },
    email :{
        type: String,
        required: true,
        lowercase:true,
        unique:true,
        trim: true
    },
    fullName :{
        type: String,
        required: true,
        index: true,
        trim: true
    },
    avatar :{
        type: String,   // cloudinary service
        required: true,
    },
    coverImage : {
        type: String,   // cloudinary  service
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken: {
        type: String,
    }
}, {timestamps: true});

// don't write arrow function directly it doesn't have context
userSchema.pre("save", async function (next) {
    // sending password field for the first time
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model("User", userSchema)