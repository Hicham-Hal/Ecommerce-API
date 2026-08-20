import app from '../../app.js'
import request from 'supertest'

let counter = 0;
let incr = 0

export const createAuthedUser = async(override = {}) => {
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


export const createProduct = async(token, fixturePath ,rep) => {
    incr += 1
    let res;
    for (let i = 1; i <= rep; i++){
        res = await request(app).post('/dashboard/add-product').set('Authorization', `Bearer ${token}`)
            .field('title', `product ${incr}`)
            .field('description', `test product ${incr} description for clarity`)
            .field('price', `${1300 * incr}`)
            .field('category', 'men')
            .field('quantity', 8)
            .attach('product', fixturePath)
    }

    return res.body
}