import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: [{ 
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number
        }
    }],
    fav: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
    }]
}, {timestamps: true})

const User = mongoose.model('User', userSchema)

export default User;