import e from 'express'
import { addFavProduct, addToCart, getProductsPerCategory, UnFavProduct } from '../controllers/client.controller.js'
import { getProducts } from '../controllers/admin.controller.js'
import { validateToken } from '../lib/validToken.js'
const route = e.Router()


route.get('/products', getProductsPerCategory)
route.get('/', getProducts)
route.post('/fav-product/:id', validateToken, addFavProduct)
route.post('/unfav-product/:id', validateToken, UnFavProduct)
route.post('/addToCart/:id', validateToken, addToCart)

export default route