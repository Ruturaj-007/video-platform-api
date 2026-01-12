import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    (req, res, next) => {
        console.log("Before multer - Files:", req.files);
        next();
    },
    upload.fields([             // We're using Middleware in routes 
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    (req, res, next) => {
        console.log("After multer - Files:", req.files);
        next(); // Calls next() → controller
    },
    registerUser
)

// Secured routes 
router.route("/login").post(loginUser);   
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router