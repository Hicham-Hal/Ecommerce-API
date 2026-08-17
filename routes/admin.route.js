import e from 'express'
import { addProduct, deleteProduct, getProducts, updateProduct } from '../controllers/admin.controller.js'
import multer from 'multer'

const upload = multer({ dest: 'images/' })
const route = e.Router()

route.post('/add-product', upload.single('product'), addProduct)
route.put('/product/:id', upload.single('product'), updateProduct)
route.get('/products', getProducts)
route.delete('/product/:id', deleteProduct)

export default route