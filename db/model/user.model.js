import mongoose, { Schema, Types, model } from "mongoose";
import pkg from 'bcryptjs'
import { systemRoles } from "../../src/utils/systemRoles.js";


const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        trim: true,
        min: [2, "name must be minimum 2 characters"],
    },
    email: {
        type: String,
        unique: [true, 'Email must be unique value'],
        required: [true, 'Email is required'],
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        default: systemRoles.USER,
        enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN]
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    isLoggedIn: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isAuthorized: {
        type: Boolean,
        default: false,
    },
    forgetCode: String,
    changePassword: Number,
    customId: String,
}, {
    timestamps: true,
})

userSchema.pre('save', function (next, req) {
    this.password = pkg.hashSync(this.password, +process.env.SALT_ROUNDS)
    next()
})
const userModel = mongoose.models.User || model('User', userSchema)

export default userModel;