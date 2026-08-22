import e from 'express'
import { chargilyWebhook } from '../controllers/payment.controller.js'
const route = e.Router()


route.post('/webhook', e.raw({ type: 'application/json' }), chargilyWebhook)


export default route