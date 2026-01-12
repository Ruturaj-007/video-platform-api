import { asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse }    from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { response } from "express";

const generateAccessAndRefreshTokens =  async(userId) => {
    try {
      const user =  await User.findById(userId)
      const accessToken = user.generateAccessToken()    // stored in HTTP-only cookies
      const refreshToken = user.generateRefreshToken()  // Refresh token is tracked in DB

      user.refreshToken = refreshToken
      await user.save({
        validateBeforeSave: false
      })

      return{accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and acess token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend 
    // validation - not empty 
    // check if user already exists: username, email
    // check for images,check for avatar 
    // upload them to cloudinary, avatar 
    // create user object - create entry in db 
    // remove password nd refresh token fiels from response 
    // check for user creation 
    // return res 

    const {fullName, email, username, password} = req.body
    console.log("email: ", email);
    console.log("req.body: ", req.body);
    console.log("req.files: ", req.files);  // ADD THIS

    if (
        [fullName, email, username, password].some(
            (field) => !field || String(field).trim() === ""
        )
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists with this username or email")
    }

    // Debug logs
    console.log("req.files: ", req.files);
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    console.log("avatarLocalPath: ", avatarLocalPath);
    console.log("coverImageLocalPath: ", coverImageLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

// Removed sensitive fields never sand password or refresh token     
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )

})

// lOGIN USER

const loginUser = asyncHandler(async(req, res)=>{
    // req body -> data 
    // username and email 
    // find the user 
    // password check 
    // access and refresh token
    // send cookie 

    const {email, username, password} = req.body // get credenetials from req.body 

    if (!username && !email) {
        throw new ApiError(400, "username and email is required")
    }

    // ALTERNATIVE -> If u want only one just wrap in & give exclamatory sign 
    // if (!(!username || !email)) {
    //     throw new ApiError(400, "username or email is required")
    // }

    const user = await User.findOne({
        $or: [{username}, {email}] // or operator will either find username or email(obj's) we've stored them in array
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    
    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken } = 
    await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = { // set cookies    
        httpOnly: true,
        secure: false 
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
    ))

})

// LOG OUT running and vdo sharing platform how many times it can get broken in parts 
    // Multer Middleware will helps us to log out 

    const logoutUser = asyncHandler(async(req, res)=> {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined // deactivate user's refToken for logout 
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: false
        }

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out Successfully"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {   // user is sending 
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
         }
    
         if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
         }
    
         const options = {
            httpOnly: true,
            secure: false
         }
    
        const {accessToken, newRefreshToken}  = await generateAccessAndRefreshTokens(user._id)
    
        return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newRefreshToken, options)
         .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken:newRefreshToken},
                "Access token refreshed"
            )
         )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}