import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        //ab kaafi fields required hai agr sirf refreshtoken save krenge toh error aa jayega so better way to do it
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

// this method only register the users
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exits: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // destructing req.body to get rquired fields
    const {fullName, email, username, password} = req.body;
    // validation -not empty
    // dher saare validation bnaye jaa skty hai, but abhi hum sirf seekh rhe h kaam kese hota hai toh itna enough h
    if(
        [fullName, email, username, password].some((field)=>field?.trim() === "")
    ){
        throw new ApiError(400, `${field} is required`)
    }

    //checking for already existed users
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists");
    }

    // routes mein middlewares ko add krne ki wjah se req k ander or fields add krdeta h
    // express hume req.body k access deta hai toh multer hume req.files k access de deta hai
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // avatar is muust needed
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }
    // better way to handle nothing in coverImage
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // upload filepath to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // agr avatar nhi upload hua hai toh server crash ho jyega
    if(!avatar){
        throw new ApiError(400, "Avatar upload failed");
    }


    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    })
    //mongodb jb entry krta hai toh sbke saath ek _id naam k field jod deta hai
    //select krke string mein - lga k hum uss field ko deselect kr skty h
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }



    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler( async(req,res)=>{
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie

    const {email, username, password} = req.body
    if(!(username || email)){
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // jb cookies bhejte hai toh kuch options design krne pdte hai; options are basically objects

    const options = {
        httpOnly: true,
        secure: true
        // inke through cookie ab sirf server se modify ho skti hai frontend se nhi, we can see it in frontend but cannot modify there
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

// const logoutUser = asyncHandler( async(req,res) => {
//     console.log("1st step");
//     await User.findByIdAndUpdate(
//         req.user._id,
//         {
//             $unset: {
//                 refreshToken: 1
//             }
//         }
//     )
//     console.log("2nd step");

//     const options = {
//         httpOnly: true,
//         secure: true
//     }
//     return res
//     .status(200)
//     .clearCookie("accessToken", options)
//     .clearCookie("refreshToken", options)
//     .json(
//         new ApiResponse(200, {}, "User Logged Out")
//     )
// })
const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
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
    .json(new ApiResponse(200, {}, "User logged Out"))
})



export {
    registerUser,
    loginUser,
    logoutUser
}