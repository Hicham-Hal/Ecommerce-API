import request from 'supertest'
import { connectTestDb, clearTestDb, closeTestDb } from '../setup.js'
import { createAuthedUser, createProduct } from '../helpers/helper.js'
import app from '../../app.js'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import path from 'path'

beforeAll(connectTestDb)
afterEach(clearTestDb)
afterAll(closeTestDb)

const imagePath = path.resolve('test/fixtures/test.png')


describe('GET /', () => {
    it('get all products for an authenticated/notauth users', async() => {
        const user = await createAuthedUser()
        const {token} = await createAuthedUser({ role: 'admin' })

        const products = await createProduct(token, imagePath, 1)

        const res = await request(app).get('/')
        expect(res.status).toBe(200)
    })
})

describe('GET /products-per-category', () => {
    it('getting products by category for all users', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const productA = await request(app).post('/dashboard/add-product').set('Authorization', `Bearer ${token}`)
            .field('title', 'test product')
            .field('description', 'test product description for clarity')
            .field('price', 13000)
            .field('category', 'men')
            .field('quantity', 8)
            .attach('product', imagePath)
        
        const productB = await request(app).post('/dashboard/add-product').set('Authorization', `Bearer ${token}`)
            .field('title', 'test product')
            .field('description', 'test product description for clarity')
            .field('price', 13000)
            .field('category', 'women')
            .field('quantity', 8)
            .attach('product', imagePath)


        const res = await request(app).get('/products?cat=men')
        expect(res.status).toBe(200)
        expect(res.body).toBeDefined()
        expect(res.body[0].category).toBe('men')
    })
})

describe('POST /fav-product', () => {
    it('favorite product successfully', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const user = await createAuthedUser()

        const product = await createProduct(token, imagePath, 1)
        const res = await request(app).post('/fav-product').set('Authorization', `Bearer ${user.token}`).send({
            id: product._id
        })

        expect(res.status).toBe(200)
    }),

    it('reject adding product already exist to favorable products', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await request(app).post('/register').send({
            name: 'user',
            email: 'user@gmail.com',
            password: 'user1234',
            role: 'admin'
        })

        const login = await request(app).post('/login').send({
            email: 'user@gmail.com',
            password: 'user1234'
        })

        const accessToken = login.body.accessToken

        const favProduct = await request(app).post('/fav-product').set('Authorization', `Bearer ${accessToken}`).send({
            id: product._id
        })

        const res = await request(app).post('/fav-product').set('Authorization', `Bearer ${login.body.accessToken}`).send({
            id: product._id
        })

        expect(res.status).toBe(400)
    })
})