import jwt from 'jsonwebtoken'
import { configDotenv } from 'dotenv'

configDotenv()

export async function validateToken(req, res, next){
    try{
        // console.log(req)
        const token = req.headers['authorization']?.split(' ')[1]
        if(!token) return res.status(401).json({ message: 'UnAuthorized' })
        const validate = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = validate
        next()
    }catch(err){
        console.log(err)
        return res.status(403).json({ error: 'Forbidden' })
    }
}