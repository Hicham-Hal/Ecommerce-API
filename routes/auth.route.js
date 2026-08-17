import e from 'express'
import { login, logout, refreshToken, register } from '../controllers/auth.controller.js'
import { validateToken } from '../lib/validToken.js'
const route = e.Router()


route.post('/login', login)
route.post('/register', register)
route.post('/logout', logout)
route.get('/refresh-token', refreshToken)


export default route