import { verifyChargilySignature } from "../lib/chargily.js"
import Order from "../models/Order.model.js"
import Product from "../models/Product.model.js"
import User from "../models/User.model.js"

export const chargilyWebhook = async(req, res) => {
    try{
        console.log(req.headers, 'chargilyWebhook')
        const signature = req.headers['signature']
        const rawBody = req.body

        if(!verifyChargilySignature(rawBody, signature)){
            return res.status(403).json({message: 'Invalid signature'})
        }

        const event = JSON.parse(rawBody.toString('utf8'))
        console.log('Event type:', event.type, 'orderId:', event.data?.metadata?.orderId)
        const checkout = event.data
        const orderId = checkout.metadata?.orderId


        const order = await Order.findById(orderId)
        if(!order) return res.status(404).json({ message: 'Order not found' })

        if(event.type === 'checkout.paid'){
            order.paymentStatus = 'paid'
            order.orderStatus = 'processing'
            await order.save()

            for(const item of order.items){
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { quantity: -item.quantity }
                })
            }
            await User.findByIdAndUpdate(order.user, { cart: [] })
        }else if(event.type === 'checkout.failed' || event.type === 'checkout.expired'){
            order.paymentStatus = 'failed',
            order.orderStatus = 'cancelled'
            await order.save()
        }

        return res.status(200).json({ received: true })
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}