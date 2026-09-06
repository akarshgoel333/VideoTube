import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    watchHistory: [{
        type: Schema.Types.ObjectID,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken: {
        type: String,
    },
},{timestamps: true})

//pre middleware k usecase hai just before executing any step, perform any kind of operation or program
//next is used for middleware to pass the flag to the next
userSchema.pre("save", async function(){
    //check krlo agr password chng ni hua hai toh kisi or cheez k updation pr password chng n ho jaye
    if(!this.isModified("password")) return;

    // number is telling how much rounds of encryption has to be done
    this.password = await bcrypt.hash(this.password, 10);
})

//Can create your own custom hook using methods then telling a name of that hook
userSchema.methods.isPasswordCorrect = async function(password){
    // comparing the original and encrypted password to be equal or not
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function(){
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
    );
};
userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema)