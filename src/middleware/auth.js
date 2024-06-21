
import userModel from "../../db/model/user.model.js";
import { tokenDecode } from "../utils/GenerateAndVerifyToken.js";
import { systemRoles } from "../utils/systemRoles.js";


const auth = (accessRoles) => {
    return async (req, res, next) => {
        try {
            if (!accessRoles) {
                accessRoles = [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN]
            }
            const { authorization } = req.headers;
            // if (!authorization) {
            //     return next(new Error("please login first", { cause: 400 }))
            // }
            if (!authorization?.startsWith(process.env.BEARER_KEY)) {
                return next(new Error("In-valid bearer key", { cause: 400 }))
            }
            const token = authorization.split(process.env.BEARER_KEY)[1]

            if (!token) {
                return next(new Error("In-valid token", { cause: 400 }))
            }

            const decoded = tokenDecode({ payload: token })
            if (!decoded?._id) {
                return next(new Error("In-valid token payload", { cause: 400 }))

            }
            const authUser = await userModel.findById(decoded._id).select('name email role changePassword')
            if (!authUser) {
                return next(new Error("Not register account"), { cause: 400 })
            }
            if (decoded.iat < authUser.changePassword / 1000) {
                return next(new Error("token expired"), { cause: 400 })
            }
            // authorization
            if (!accessRoles.includes(authUser.role)) {
                return next(new Error("Un-Authorized User"), { cause: 400 })
            }
            req.user = authUser;
            return next()
        } catch (error) {
            return res.json({ message: "Catch error", err: error?.message })
        }
    }
}

export default auth

