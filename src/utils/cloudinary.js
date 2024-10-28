import {v2 as CLOUDINARY} from "cloudinary"
import fs from "fs"


// MAKE USE OF CONFIG FOR THE CLOUDINARY ACCOUNT FOR CLOUDINARY ACCESS 
CLOUDINARY.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET
})


//THIS IS UPLOADER METHOD WHICH IS USED FOR  UPLOADING FILE AND HANDLING UNKNOWN ERROR
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        //UPLOAD THE FILE ON DIRECTORY 
        const response = await CLOUDINARY.uploader.upload(localFilePath , {resource_type : "auto"})
        //FILE HAS BEEN UPLOADED SUCCECFUL 
        
        console.log("File is uploaded on cloudnary" , response.url);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //REMOVE THE LOCALLF SAVED TEMPORARY FILE IF UPLOADING FAILED
        return null;
    }
}


export {uploadOnCloudinary}