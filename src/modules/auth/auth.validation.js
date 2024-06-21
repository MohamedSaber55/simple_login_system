import Joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const signUpSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: generalFields.email.required(),
    password: generalFields.password,
    cPass: generalFields.cPassword,
}).required()



export const logInSchema = Joi.object({
    email: generalFields.email,
    password: generalFields.password,
}).required()

export const resetPasswordSchema = Joi.object({
    newPassword: generalFields.password,
    email: generalFields.email,
    forgetCode: Joi.string().required(),
})


// export const updateUserSchema = Joi.object({
//     password: generalFields.password,
//     newPassword: generalFields.password.optional(),
//     name: Joi.string().min(2).optional(),
// })