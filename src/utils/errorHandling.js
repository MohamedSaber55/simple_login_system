import { AppError } from "./AppError.js";

// let stackVar;
const asyncHandler = (API) => {
    return (req, res, next) => {
        API(req, res, next).catch(err => {
            console.log(err);
            // stackVar = err.stack
            // return res.status(500).json({ message: "Catch error", error: err.message })
            return next(new AppError(err.message, 500))
        })
    }
}

const globalResponse = (err, req, res, next) => {
    if (err) {
        if (process.env.ENV_MODE === 'DEV') {
            return res.status(err.statusCode || 500).json({ message: "Fail Response", error: err.message, stack: err.stack })
        }
        if (err?.message) {
            return res.status(err['cause'] || 500).json({ message: "Fail in Response", error: err.message })
        } else {
            return res.status(err['cause'] || 500).json({ message: "Fail in Response", error: err })
        }
    }
}

export {
    asyncHandler,
    globalResponse
}
