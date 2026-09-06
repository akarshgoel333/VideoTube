import {v2 as cloudinary} from "cloudinary"
import fs from "fs";

//config hi hai jo hume permission dega file upload krne ki
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // file has been uploaded successfully
        // console.log("file is uploaded on cloudinary ", response);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        //remove krna hai locally saved temp file ko jb operation fail ho jaye tb
        fs.unlinkSync(localFilePath);
        
        return null;
    }
};

export {uploadOnCloudinary};