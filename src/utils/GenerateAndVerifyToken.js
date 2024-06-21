import jwt from 'jsonwebtoken'


export const tokenGeneration = ({ payload = {}, signature = process.env.TOKEN_SIGNATURE, expiresIn = '1000hour' } = {}) => {
    const token = jwt.sign(payload, signature, { expiresIn });
    return token
}

export const tokenDecode = ({ payload = '', signature = process.env.TOKEN_SIGNATURE } = {}) => {
    const decoded = jwt.verify(payload, signature);
    return decoded
}

