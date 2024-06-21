import chalk from 'chalk'
import morgan from 'morgan'
import connectDB from '../../db/connection.js'
import * as Routers from '../index.router.js'
import { globalResponse } from './errorHandling.js'
import cors from 'cors'

const initApp = (app, express) => {
    const port = +process.env.PORT || 3000
    app.use((req, res, next) => {
        express.json({})(req, res, next)
    })
    app.use(cors())
    if (process.env.ENV_MODE == 'DEV') {
        app.use(morgan('dev'))
    } else {
        app.use(morgan('combined'))
    }

    const baseurl = "/login_system/api/v1"

    //connect to DB
    connectDB()
    //Setup API Routing
    app.get(`${baseurl}`, (req, res) => res.send('Hello World!'))
    app.use(`${baseurl}/auth`, Routers.authRouter)
    // in-valid routings
    app.all('*', (req, res, next) => {
        res.json('In-valid Routing Plz check url  or  method')
    })
    // fail repose
    app.use(globalResponse)


    const server = app.listen(port, () =>
        console.log(
            chalk.blue.bgWhite.bold(`Example app listening on port ${port}!`),
        ),
    )
}

export default initApp
