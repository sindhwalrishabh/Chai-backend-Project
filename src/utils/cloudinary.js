import {v2 as cloudinary} from 'cloudinary';
import { unlink } from 'node:fs/promises';
// it is used read,write,delete file etc all file operations of file handling


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary = async (localFilepath) => {
        if(!localFilepath) return null

        let response;
        let uploadError;
        try {
            response = await cloudinary.uploader.upload(localFilepath, {
                resource_type: "auto"
            })
        } catch (error) {
            uploadError = error;
        }

        try {
            await unlink(localFilepath);
        } catch (cleanupError) {
            if (cleanupError.code !== "ENOENT") {
                if (uploadError) {
                    console.error("Failed to remove local upload file:", cleanupError);
                } else {
                    throw cleanupError;
                }
            }
        }

        if (uploadError) {
            throw uploadError;
        }

         console.log("file is uploaded on cloudinary", response.url);
         return response;
    }
    export {uploadOnCloudinary}