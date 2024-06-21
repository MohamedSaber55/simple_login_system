import pkg from 'bcryptjs'
import { customAlphabet } from 'nanoid'
import { OAuth2Client } from 'google-auth-library'
import userModel from '../../../db/model/user.model.js';
import { tokenDecode, tokenGeneration, } from '../../utils/GenerateAndVerifyToken.js'
import sendEmail from '../../utils/sendEmail.js'
import { AppError } from '../../utils/AppError.js';
const nanoId = customAlphabet('123456789', 7)
//======================== signUp =======================
export const signUp = async (req, res, next) => {
  const { name, email, password } = req.body
  const emailExists = await userModel.findOne({ email })

  if (emailExists) {
    return next(new AppError('Email Already Exists', 401))
  }

  const newUser = new userModel({ name, email, password })

  // confirmation
  const token = tokenGeneration({
    payload: {
      _id: newUser._id,
      email: newUser.email
    },
  })
  if (!token) {
    return next(new AppError('Token Generation Fail', 400))
  }
  const confirmationLink = `${req.protocol}://${req.headers.host}/login_system/api/v1/auth/confirmEmail/${token}`

  const message = `<a href= ${confirmationLink} target="_blank">Click to confirm</a>`
  const sentEmail = await sendEmail({ to: email, message, subject: 'Confirmation Email' })
  if (!sentEmail) {
    return next(new AppError('Send Email Service Fails', 400))
  }
  await newUser.save()
  res.status(201).json({ message: 'Registration success , please confirm your email' })
}

//========================= confirmation Email ==================
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params

  const decode = tokenDecode({ payload: token })
  if (!decode?._id) {
    return next(new AppError('Decoding Fails', 400))
  }
  const userConfirmed = await userModel.findOneAndUpdate(
    { _id: decode._id, isConfirmed: false },
    {
      isConfirmed: true,
    },
  )
  if (!userConfirmed) {
    return next(
      new AppError(
        'please check if you already confirm you email , if not please try to signup again',
        400,
      ),
    )
  }
  return res.status(200).json({ message: 'Your email confirmed', decode })
  // openUrl.open("http://localhost:3000")

}

//=========================== Login =============================
export const login = async (req, res, next) => {
  const { email, password } = req.body
  const user = await userModel.findOne({ email, isConfirmed: true })
  if (!user) {
    return next(
      new AppError('Please, if enter a valid email or make sure that you confirm your email', 400),
    )
  }
  const match = pkg.compareSync(password, user.password)
  if (!match) {
    return next(new AppError('In-valid login information', 400))
  }
  const token = tokenGeneration({
    payload: {
      _id: user._id,
      email: user.email,
      name: user.name,
      isLoggedIn: true,
    },
  })
  await userModel.findOneAndUpdate({ email }, { isLoggedIn: true })
  return res.status(200).json({ message: 'Login success', token, user })
}

//=========================== Logout =============================
export const logOut = async (req, res, next) => {
  const { _id } = req.user
  const user = await userModel.findOneAndUpdate({ _id, isLoggedIn: true }, { isLoggedIn: false })
  if (user) {
    return res.status(200).json({ message: "Logged out" })
  }
  next(new AppError("You are not logged in"))
}

//=========================== send code =======================
export const sendCode = async (req, res, next) => {
  const { email } = req.body
  const user = await userModel.findOne({ email, isConfirmed: true })
  if (!user) {
    return next(new AppError('please sign up first', 400))
  }
  const forgetCode = nanoId()
  // const message = `<p> OTP is ${forgetCode} </p>`
  const message = `<!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
    <style type="text/css">
    body{background-color: #88BDBF;margin: 0px;}
    </style>
    <body style="margin:0px;"> 
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
    <tr>
    <td>
    <table border="0" width="100%">
    <tr>
    <td>
    <h1>
        <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
    </h1>
    </td>
    <td>
    <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
    <tr>
    <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
    <img width="50px" height="50px" src="${process.env.logo}">
    </td>
    </tr>
    <tr>
    <td>
    <h1 style="padding-top:25px; color:#630E2B">Forget password</h1>
    </td>
    </tr>
    <tr>
    <td>
    <p style="padding:0px 100px;margin:10px 0px 30px 0px ">  your verification code is
    </p>
    </td>
    </tr>
    <tr>
    </tr>
    <tr>
    </tr>
    <tr>
    <td>
    <p style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;font-size:24px;color:#fff;background-color:#630E2B;">${forgetCode}</p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
    <tr>
    <td>
    <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
    </td>
    </tr>
    <tr>
    <td>
    <div style="margin-top:20px;">

    <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
    
    <a href="${process.env.instagram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
    </a>
    
    <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
    </a>
    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>`
  const sentEmail = await sendEmail({
    to: email,
    message,
    subject: 'Forget Password',
  })
  if (!sentEmail) {
    return next(new AppError('Send Email Service Fails', 400))
  }
  const saved = await userModel.findOneAndUpdate({ email }, { forgetCode }, { new: true })
  return res.status(200).json({ message: 'OTP sent successfully' })
}

//========================== reset password ===============================
export const resetPassword = async (req, res, next) => {
  const { email, forgetCode, newPassword } = req.body
  const user = await userModel.findOne({ email })
  if (!user) {
    return next(new AppError('please sign up first', 400))
  }
  if (user.forgetCode != forgetCode) {
    return next(new AppError('in-valid OTP', 400))
  }
  user.forgetCode = null
  user.password = newPassword
  user.changePassword = Date.now()
  const userUpdated = await user.save()
  return res.status(200).json({ message: 'Reset password success, please try to login again' })
}

//========================== google login ===============================
export const googleLogin = async (req, res, next) => {
  const client = new OAuth2Client(process.env.CLIENT_ID)
  const { idToken } = req.body
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    })
    const payload = ticket.getPayload()
    return payload
  }
  const { email, email_verified, name, picture } = await verify()
  if (!email_verified) {
    return next(new AppError('In-valid email', 400))
  }
  const userCheck = await userModel.findOne({ email, provider: 'GOOGLE' })
  // login
  if (userCheck) {
    const token = tokenGeneration({
      payload: {
        _id: userCheck._id,
        email,
        user_name: userCheck.name,
        isLoggedIn: true,
      },
    })
    await userModel.findOneAndUpdate({ email }, { isLoggedIn: true })
    return res.status(200).json({ message: 'Login success', token })
  }

  // signUp
  const newUser = new userModel({
    userName: name,
    email,
    password: nanoId(),
    isConfirmed: true,
    isLoggedIn: true,
    provider: 'GOOGLE',
    Image: picture,
  })
  const token = tokenGeneration({
    payload: { _id: newUser._id, email: newUser.email, user_name: newUser.name, isLoggedIn: true },
  })
  await newUser.save()
  return res.status(201).json({ message: 'Registration success', token })
}

// //========================== update user ===============================
// export const updateUser = async (req, res, next) => {

//   if (!req.user._id) { return next(new AppError('Sign in first', 400)) }

//   const user = await userModel.findById(req.user._id)
//   if (!user) { return next(new AppError('Sign up first', 400)) }


//   if (!req.body.password) {
//     return next(new AppError('enter your old password', 400))
//   }

//   const match = pkg.compareSync(req.body.password, user.password)
//   if (!match) {
//     return next(new AppError('In-valid password', 400))
//   }
//   user.password = req.body.password

//   if (req.body.name) {
//     if (user.name == req.body.name) {
//       return next(new AppError('Please enter different name', 400))
//     }
//     user.name = req.body.name
//   }

//   if (req.body.newPassword) {
//     user.password = req.body.newPassword
//   }


//   if (!Object.keys(req.body).length) {
//     return next(new AppError('Please enter the updated fields', 400))
//   }

//   const savedUser = await user.save()
//   return res.status(200).json({ message: "Updated success", User: savedUser })
// }