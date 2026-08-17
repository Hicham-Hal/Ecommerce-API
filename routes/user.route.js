import e from 'express'
const route = e.Router()


route.post('/login', login)
route.post('/register', register)
route.post('/logout', logout)
route.get('/refresh-token', refresh-token)


export default route