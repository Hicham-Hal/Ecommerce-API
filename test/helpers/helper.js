import app from '../../app.js'
import request from 'supertest'

let counter = 0;

export const createAuthedUser = (override = {}) => {
    counter += 1

    const payload = {
        name: `user ${counter}`,
        email: `user${counter}@gmail.com`,
        role: 'customer',
        password: `user1234`,
        ...override
    }

    const res = await request(app).post('/register').send(payload)

    return{
        token: res.body.accessToken,
        email: payload.email,
        rawResponse: res
    }

}