import mongoose from 'mongoose'


const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    title: {type: String, required: true},
    price: {type: Number, required: true},
    quantity: {type: Number, required: true, min: 1},
    image: {type: String}
}, {_id : false})

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: {
            type: String,
            default: 'Algeria'
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'stripe'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    chargilyCheckoutId: {
        type: String
    }
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)

export default Order