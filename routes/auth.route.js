import e from 'express'
import { login, logout, refreshToken, register } from '../controllers/auth.controller.js'
import { validateToken } from '../lib/validToken.js'
import { loginValidator, registerValidator } from '../validators/auth.validator.js'
import { validate } from '../validators/validate.js'
const route = e.Router()


route.post('/login', loginValidator, validate, login)
route.post('/register', registerValidator, validate, register)
route.post('/logout', logout)
route.get('/refresh-token', refreshToken)


export default route