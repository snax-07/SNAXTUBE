import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import {loggedOutUser, loginUser, refreshAccessToken, registerUser, updateAccountDetails} from "../controllers/user.controller.js"
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
router.route("/update/info").post(updateAccountDetails)
export default router