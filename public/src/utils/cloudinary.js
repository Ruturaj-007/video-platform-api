import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("No file path provided");
            return null;
        }

        // Check if file exists
        if (!fs.existsSync(localFilePath)) {
            console.log("File does not exist at path:", localFilePath);
            return null;
        }

        console.log("Uploading file to cloudinary:", localFilePath);
        
        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"  // Changed from responseType
        });
        
        // File has been uploaded successfully
        console.log("File uploaded successfully on cloudinary:", response.url);
        
        // Delete the local file after successful upload
        fs.unlinkSync(localFilePath);
        
        return response;
    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        
        // Remove the locally saved temporary file as the upload operation failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        
        return null;
    }
}

// * Delete image from cloudinary 
const deleteFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl) {
            console.log("No image is provided")
            return null;
        }

        // Extract public_id from Cloudinary URL
        // Example URL: http://res.cloudinary.com/dykn9ipcw/image/upload/v1768038070/rkubtles9xmzsajfod9b.jpg
        // public_id: rkubtles9xmzsajfod9b

        const urlParts = imageUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0]; // removes file extension

        console.log("Deleting image from cloudinary:", publicId);

        // Delete image from cloudinary
        const response  = await cloudinary.uploader.destroy(publicId);
        console.log("Image deleted from cloudinary:", response)

        return response;

    } catch (error) {
        console.log("Cloudinary detection error: ", error);
        return null;
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}