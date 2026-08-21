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

describe('POST /unfav-product', () => {
    it('unfav product successfully', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await request(app).post('/register').send({
            name: 'user',
            email: 'user@gmail.com',
            password: 'user1234'
        })
        const login = await request(app).post('/login').send({
            email: 'user@gmail.com',
            password: 'user1234'
        })
        const accessToken = login.body.accessToken
        const favProduct = await request(app).post('/fav-product').set('Authorization', `Bearer ${accessToken}`).send({
            id: product._id
        })

        const res = await request(app).post('/unfav-product').set('Authorization', `Bearer ${accessToken}`).send({
            id: product._id
        })

        expect(res.status).toBe(200)
    }),

    it('reject the unfav product if product doesn\'t exist', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()

        const res = await request(app).post('/unfav-product').set('Authorization', `Bearer ${user.token}`).send({
            id: product._id
        })

        expect(res.status).toBe(400)
    }),

    it('reject the unfav product for unauthed user', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)

        const res = await request(app).post('/unfav-product').send({
            id: product._id
        })

        expect(res.status).toBe(401)
    })
})

describe('POST /add-to-cart', () => {
    it('add successfully to cart for authenticated user', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await request(app).post('/register').send({
            name: 'user',
            email: 'user@gmail.com',
            password: 'user1234'
        })

        const login = await request(app).post('/login').send({
            email: 'user@gmail.com',
            password: 'user1234'
        })

        const accessToken = login.body.accessToken
        const userId = login.body.user._id

        const res = await request(app).post('/addToCart').set('Authorization', `Bearer ${accessToken}`).send({
            productId: product._id,
            quantity: 1
        })

        expect(res.status).toBe(200)
    }),

    it('reject adding to cart if the product not found', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const res = await request(app).post('/addToCart').set('Authorization', `Bearer ${token}`).send({
            productId: '6a88280363148725e2ccc1d8',
            quantity: 1
        })

        expect(res.status).toBe(404)
    }),

    it('reject adding to cart if the user not authed', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)

        const res = await request(app).post('/addToCart').send({
            productId: product._id,
            quantity: 1
        })

        expect(res.status).toBe(401)
    }),

    it('if existing product on cart item increment the quantity', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await request(app).post('/register').send({
            name: 'user',
            email: 'user@gmail.com',
            password: 'user1234'
        })
        const login = await request(app).post('/login').send({
            email: 'user@gmail.com',
            password: 'user1234'
        })

        const accessToken = login.body.accessToken;

        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${accessToken}`).send({
            productId: product._id,
            quantity: 1
        })

        const res = await request(app).post('/addToCart').set('Authorization', `Bearer ${accessToken}`).send({
            productId: product._id,
            quantity: 1
        })
        expect(res.status).toBe(200)
        expect(res.body.user.cart.find(item => item)?.quantity).toBe(2)
    })
})

describe('POST /remove-from-cart', () => {
    it('remove item from cart successfully', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId: product._id,
            quantity: 1
        })
        const itemId = addToCart.body.cart[0]._id
        const res = await request(app).post('/remove-from-cart').set('Authorization', `Bearer ${user.token}`).send({
            itemId
        })

        expect(res.status).toBe(200)
    }),
    it('reject removing item doesn\'t exist on the cart', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const res = await request(app).post('/remove-from-cart').set('Authorization', `Bearer ${user.token}`).send({
            itemId: product._id
        })

        expect(res.status).toBe(404)
    }),
    it('reject removing item if the user not authenticated', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const res = await request(app).post('/remove-from-cart').send({
            itemId: product._id
        })

        expect(res.status).toBe(401)
    })
})

describe('POST /remove-all-from-cart', () => {
    it('remove everything from cart successfully', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()

        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId: product._id,
            quantity: 1
        })

        const res = await request(app).post('/remove-cart').set('Authorization', `Bearer ${user.token}`)
        expect(res.status).toBe(200)
    }),
    it('reject deleting from cart if the user not authenticated', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const res = await request(app).post('/remove-cart')

        expect(res.status).toBe(401)
    }),

    it('reject removing from cart if the cart is empty', async() => {
        const user = await createAuthedUser()
        const res = await request(app).post('/remove-cart').set('Authorization', `Bearer ${user.token}`)
        expect(res.status).toBe(404)
    })
})

describe('POST /increase-quantity', () => {
    it('increase quantity successfully', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId: product._id,
            quantity: 1
        })
        const itemId = addToCart.body.cart[0]._id
        const res = await request(app).post('/increase-quantity').set('Authorization', `Bearer ${user.token}`).send({
            itemId
        })
        expect(res.status).toBe(200)
        expect(res.body.cart.find(item => item).quantity).toBe(2)
    }),

    it('reject increase quantity for non authenticated user', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId: product._id,
            quantity: 1
        })
        const itemId = addToCart.body.cart[0]._id
        const res = await request(app).post('/increase-quantity').send({
            itemId
        })

        expect(res.status).toBe(401)
    }),
    it('reject increase quantity if item not found', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId: product._id,
            quantity: 1
        })
        const res = await request(app).post('/increase-quantity').set('Authorization', `Bearer ${user.token}`).send({
            itemId: product._id
        })

        expect(res.status).toBe(404)
    })
})

describe('POST /dicrese-quantity', () => {
    it('decrease quanitty successfully', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId: product._id,
            quantity: 1
        })
        const itemId = addToCart.body.cart[0]._id
        const increaseQuantity = await request(app).post('/increase-quantity').set('Authorization', `Bearer ${user.token}`).send({
            itemId
        })

        const res = await request(app).post('/dicrease-quantity').set('Authorization', `Bearer ${user.token}`).send({
            itemId
        })

        expect(res.status).toBe(200)
        expect(res.body.cart.find(item => item).quantity).toBe(1)
    }),

    it('reject decreasing quantity for a nont authenticated user', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId: product._id,
            quantity: 1
        })
        const itemId = addToCart.body.cart[0]._id
        const increaseQuantity = await request(app).post('/increase-quantity').set('Authorization', `Bearer ${user.token}`).send({
            itemId
        })

        const res = await request(app).post('/dicrease-quantity').send({
            itemId
        })
        
        expect(res.status).toBe(401)
    }),
    it('reject decreasing quantity for a non existing item id', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId: product._id,
            quantity: 1
        })

        const res = await request(app).post('/dicrease-quantity').set('Authorization', `Bearer ${user.token}`).send({
            itemId: product._id
        })

        expect(res.status).toBe(404)
    }),
    it('removes item from the cart if the quantity was 1', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId: product._id,
            quantity: 1
        })
        const itemId = addToCart.body.cart[0]._id

        const res = await request(app).post('/dicrease-quantity').set('Authorization', `Bearer ${user.token}`).send({
            itemId
        })

        expect(res.status).toBe(200)
        expect(res.body.cart.length).toBe(0)
    })
})

describe('GET /fav-products', () => {
    it('get all favorite products for an authenticated user', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()

        const favProduct = await request(app).post('/fav-product').set('Authorization', `Bearer ${user.token}`).send({
            id: product._id
        })

        const res = await request(app).get('/fav-products').set('Authorization', `Bearer ${user.token}`)

        expect(res.body[0]._id).toBe(product._id)
    }),
    it('reject getting favorite products for non authenticated user', async()=> {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()

        const favProduct = await request(app).post('/fav-product').set('Authorization', `Bearer ${user.token}`).send({
            id: product._id
        })

        const res = await request(app).get('/fav-products')

        expect(res.status).toBe(401)
    })
})

describe('POST /checkout', () => {
    it('create a checkout for authenticated user', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 2)
        const user = await createAuthedUser()
        const productId = product._id
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 1
        })

        const res = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })
        expect(res.status).toBe(200)
        expect(res.body.newOrder).toBeDefined()
    }),
    it('reject a checkout if user not authenticated', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 2)
        const user = await createAuthedUser()
        const productId = product._id
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 1
        })

        const res = await request(app).post('/checkout').send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })
        expect(res.status).toBe(401)
    }),
    it('reject a checkout if the quantity required bigger than the product\'s quantity', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const productId = product._id
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 9
        })

        const res = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })
        expect(res.status).toBe(400)
    }),
    it('reject a checkout if the user cart is empty', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()

        const res = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })
        expect(res.status).toBe(400)
    })
})


describe('GET /order/:id', () => {
    it('returns user\'s order by orderId successfully', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 2)
        const user = await createAuthedUser()
        const productId = product._id
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 1
        })

        const order = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })
        const res = await request(app).get(`/order/${order.body.newOrder._id}`).set('Authorization', `Bearer ${user.token}`)

        expect(res.status).toBe(200)
        expect(res.body).toBeDefined()
    }),
    it('reject getting order for non authenticated user', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 2)
        const user = await createAuthedUser()
        const productId = product._id
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 1
        })

        const order = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })

        const res = await request(app).get(`/order/${order.body.newOrder._id}`)

        expect(res.status).toBe(401)
    }),
    it('reject getting order for an invalid orderId', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 1)
        const user = await createAuthedUser()
        const productId = product._id
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 1
        })

        const order = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })

        const res = await request(app).get(`/order/${product._id}`).set('Authorization', `Bearer ${user.token}`)

        expect(res.status).toBe(404)
    })
})

describe('GET /orders', () => {
    it('return all user\'s orders', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 2)
        const user = await createAuthedUser()
        const productId = product._id
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 1
        })

        const checkout1 = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })
        const addToCart2 = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 1
        })
        const checkout2 = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'ffadsfs',
                city: 'fdsfsadffa',
                state: 'fdssafdfa',
                postalCode: '16234',
                country: 'France'
            },
            paymentMethod: 'cod'
        })
        
        const res = await request(app).get('/orders').set('Authorization', `Bearer ${user.token}`)
        expect(res.status).toBe(200)
        expect(res.body).toBeDefined()
        expect(res.body.length).toBe(2)
    }),

    it('reject getting orders for non authenticated user', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 2)
        const user = await createAuthedUser()
        const productId = product._id
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 1
        })

        const checkout1 = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })

        const checkout2 = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'ffadsfs',
                city: 'fdsfsadffa',
                state: 'fdssafdfa',
                postalCode: '16234',
                country: 'France'
            },
            paymentMethod: 'cod'
        })
        
        const res = await request(app).get('/orders')

        expect(res.status).toBe(401)
    })
})

describe('POST /cancel', () => {
    it('cancel an order successfully', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 2)
        const user = await createAuthedUser()
        const productId = product._id
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 1
        })

        const order = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })

        const id = order.body.newOrder._id
        const res = await request(app).post('/cancel').set('Authorization', `Bearer ${user.token}`).send({
            id
        })

        expect(res.status).toBe(200)
        expect(res.body.order).toBeDefined()
    }),

    it('reject cancelling order if the order status not equal to pending', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 2)
        const user = await createAuthedUser()
        const productId = product._id
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 1
        })

        const order = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })

        const id = order.body.newOrder._id
        const updateStatus = await request(app).put(`/dashboard/order/${id}`).set('Authorization', `Bearer ${token}`).send({
            orderStatus: 'processing'
        })

        const res = await request(app).post('/cancel').set('Authorization', `Bearer ${user.token}`).send({
            id
        })

        expect(res.status).toBe(400)
    })

    it('reject cancelling order for a non authenticated user', async() => {
        const {token} = await createAuthedUser({ role: 'admin' })
        const product = await createProduct(token, imagePath, 2)
        const user = await createAuthedUser()
        const productId = product._id
        const addToCart = await request(app).post('/addToCart').set('Authorization', `Bearer ${user.token}`).send({
            productId,
            quantity: 1
        })

        const order = await request(app).post('/checkout').set('Authorization', `Bearer ${user.token}`).send({
            shippingAddress:{
                street: 'fs',
                city: 'fdsfa',
                state: 'fdsfa',
                postalCode: '16234',
                country: 'algeria'
            },
            paymentMethod: 'cod'
        })
        const id = order.body.newOrder._id
        const res = await request(app).post('/cancel').send({
            id
        })

        expect(res.status).toBe(401)
    })
})