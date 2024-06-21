import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as controllers from './auth.controller.js'
import { logInSchema, resetPasswordSchema, signUpSchema } from "./auth.validation.js";
import auth from './../../middleware/auth.js';
const router = Router()


router.post('/signUp', validation(signUpSchema), asyncHandler(controllers.signUp))
router.get('/confirmEmail/:token', asyncHandler(controllers.confirmEmail))
router.post('/loginWithGmail', asyncHandler(controllers.googleLogin))

router.post('/login', validation(logInSchema), asyncHandler(controllers.login))
router.post('/logout', auth(), asyncHandler(controllers.logOut))
router.post('/sendcode', asyncHandler(controllers.sendCode))
router.put('/resetPass', validation(resetPasswordSchema), asyncHandler(controllers.resetPassword))

export default router