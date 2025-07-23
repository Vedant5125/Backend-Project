import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localPath) =>{
    try {
        if(!localPath) return null;

        const response = await cloudinary.uploader.upload(localPath, {
            resourse_type: "auto"
        })
        // console.log("Uploaded to Cloudinary successfully", response.url);
        fs.unlinkSync(localPath)
        return response;
        
    } catch (error) {
        fs.unlinkSync(localPath); // Delete the file if upload fails
        console.error("Error uploading to Cloudinary: " + error.message);
        return null;
        
    }
}

export default uploadOnCloudinary;