import e from 'express'
import { addFavProduct, addToCart, deteleFromCart, dicreaseQuantity, getFavProduct, getMyOrders, checkout, getProductsPerCategory, increaseQuantity, removeAllFromCart, UnFavProduct, getMyOrder, cancelOrder } from '../controllers/client.controller.js'
import { getProducts } from '../controllers/admin.controller.js'
import { validateToken } from '../lib/validToken.js'
import { checkoutValidator } from '../validators/checkout.validator.js'
import { validate } from '../validators/validate.js'
const route = e.Router()


route.get('/products', getProductsPerCategory)
route.get('/', getProducts)
route.post('/fav-product', validateToken, addFavProduct)
route.post('/unfav-product', validateToken, UnFavProduct)
route.post('/addToCart', validateToken, addToCart)
route.post('/remove-from-cart', validateToken, deteleFromCart)
route.post('/remove-cart', validateToken, removeAllFromCart)
route.post('/increase-quantity', validateToken, increaseQuantity)
route.post('/dicrease-quantity', validateToken, dicreaseQuantity)
route.get('/fav-products', validateToken, getFavProduct)
route.post('/checkout', validateToken, checkoutValidator, validate, checkout)
route.get('/order/:id', validateToken, getMyOrder)
route.get('/orders', validateToken, getMyOrders)
route.post('/cancel', validateToken, cancelOrder)
export default route