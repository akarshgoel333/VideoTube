// import { User } from "../models/user.model.js";
// import { ApiError } from "../utils/ApiError.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import jwt from "jsonwebtoken";


// export const verifyJWT = asyncHandler( async(req, res, next) =>{
//     try {
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
//         console.log("3rd step");
//         if(!token){
//             throw new ApiError(401, "Unauthorized request");
//         }
//         console.log("4th step");
        
//         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         console.log("5th step");
//         const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
//         console.log("6th step");
        
//         if(!user){
//             throw new ApiError(401, "Invalid Access Token");
//         }
//         console.log("7th step");
        
//         req.user = user;
//         console.log("8th step");
//         next();
//     } catch (err) {
//         console.log("9th step");
//         throw new ApiError(401, err?.message || "Invalid access token")
//     }
// })

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
        try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
})