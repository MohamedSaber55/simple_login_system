import express from 'express'
import path from 'path'
import { config } from 'dotenv'
import initApp from './src/utils/initiateApp.js'
config({ path: path.resolve('config/config.env') })
const app = express()
initApp(app, express)