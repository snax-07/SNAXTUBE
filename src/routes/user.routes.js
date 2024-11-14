import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import {changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loggedOutUser, loginUser, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar, updateCoverImage} from "../controllers/user.controller.js"
import { verifyJWT } from "../middleware/authMiddleware.js";
const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secure routes 
router.route("/logout").post(verifyJWT,loggedOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-Pass").post(verifyJWT , changeCurrentPassword)
router.route("/current-user").get(verifyJWT , getCurrentUser)
router.route("/updateAccount").patch(verifyJWT ,updateAccountDetails)
router.route("/Avatar").patch(verifyJWT,upload.single("avatar") , updateAvatar)
router.route("/coverImage").patch(verifyJWT, upload.single("coverImage") ,updateCoverImage)
router.route("/c/:username").get(verifyJWT ,getUserChannelProfile)
router.route("/history").get(verifyJWT ,getWatchHistory)
export default router