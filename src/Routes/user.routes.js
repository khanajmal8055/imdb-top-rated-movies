import { Router } from "express";
import { loginUser, logoutUser, userRegister, viewProfile } from "../Controllers/user.controllers.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(userRegister)
router.route('/login').post(loginUser)

// protected routes
router.route('/logout').post(verifyJwt,logoutUser)
router.route('/view-profile').get(verifyJwt,viewProfile)


export default router