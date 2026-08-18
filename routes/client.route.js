import e from 'express'
import { addFavProduct, addToCart, deteleFromCart, dicreaseQuantity, getFavProduct, getProductsPerCategory, increaseQuantity, removeAllFromCart, UnFavProduct } from '../controllers/client.controller.js'
import { getProducts } from '../controllers/admin.controller.js'
import { validateToken } from '../lib/validToken.js'
const route = e.Router()


route.get('/products', getProductsPerCategory)
route.get('/', getProducts)
route.post('/fav-product', validateToken, addFavProduct)
route.post('/unfav-product', validateToken, UnFavProduct)
route.post('/addToCart', validateToken, addToCart)
route.post('/remove-from-cart/:itemId', validateToken, deteleFromCart)
route.post('/remove-cart', validateToken, removeAllFromCart)
route.post('/increase-quantity', validateToken, increaseQuantity)
route.post('/dicrease-quantity', validateToken, dicreaseQuantity)
route.get('/fav-products', validateToken, getFavProduct)
export default route