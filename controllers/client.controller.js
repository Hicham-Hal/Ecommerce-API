import Order from "../models/Order.model.js"
import Product from "../models/Product.model.js"
import User from "../models/User.model.js"

export const getProductsPerCategory = async(req, res) => {
    const { cat } = req.query
    if(!cat) return res.status(400).json({ message: 'cat parameter required' })
    console.log(cat)      
    try{
        const products = await Product.find({ category: cat })
        return res.status(200).json(products)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong'})
    }
}

export const addFavProduct = async(req, res) => {
    const { id } = req.body
    try{
        const user = await User.findById(req.user.id)
            const exist = user.fav?.find(item => item.toString() === id)
        if(exist){
            return res.status(400).json({ message: 'product already favorable', user })
        }
        user.fav.push(id)
        await user.save()
        return res.status(200).json(user)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const UnFavProduct = async(req, res) => {
    const { id } = req.body
    try{
        const user = await User.findById(req.user.id)
        // console.log(us)
        const exist = user.fav?.find(item => item.toString() === id)
        if(!exist){
            return res.status(400).json({ message: 'product doesn\'t exist', user })
        }
        user.fav = user.fav.filter(item => item.toString() !== id)
        await user.save()
        return res.status(200).json(user)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const addToCart = async(req, res) => {
    const {productId, quantity = 1} = req.body
    const userId = req.user.id;
    try{
        if(!productId){
            return res.status(400).json({ message: 'Product ID is required' })
        }

        if(quantity < 1){
            return res.status(400).json({ message: 'Quantity must be at least 1'})
        }

        //verify product exist
        const product = await Product.findById(productId)
        if(!product){
            return res.status(404).json({ message: 'Product not found' })
        }

        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({ message: 'User not found' })
        }

        //check if product already in cart
        const existingItem = user.cart.find(item => item.product.toString() === productId)

        if(existingItem){
            existingItem.quantity += quantity
        }else{
            user.cart.push({ product: productId, quantity })
        }
        await user.save()
        return res.status(200).json({ user, cart : user.cart.map(item => item) })
        
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const deteleFromCart = async(req, res) => {
    const {itemId} = req.body
    try{
        const user = await User.findById(req.user.id)
        if(!user)return res.status(404).json({ message: 'User not found' })
        const existItem = user.cart.find(item => item._id.toString() === itemId)
        console.log(existItem)
        if(!existItem){
            return res.status(404).json({ message: 'cart item not found', user })
        }
        user.cart = user.cart.filter(item => item._id.toString() !== itemId)
        await user.save()
        return res.status(200).json({ user })
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const removeAllFromCart = async(req, res) => {
    try{
        const user = await User.findById(req.user.id)
        if(!user) return res.status(404).json({ message: 'User not found' })
        if(user.cart.length == 0){
            return res.status(404).json({ message: 'cart item already empty' })
        }
        user.cart = []
        await user.save()
        return res.status(200).json(user)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const increaseQuantity = async(req, res) => {
    const {itemId} = req.body
    try{
        const user = await User.findById(req.user.id)
        const item = user.cart.find(item => item._id.toString() === itemId)
        if(!item) return res.status(404).json({ message: 'item not found' })
        item.quantity += 1

        await user.save()
        return res.status(200).json(user)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const dicreaseQuantity = async(req, res) => {
    const {itemId} = req.body
    try{
        const user = await User.findById(req.user.id)
        const item = user.cart.find(item => item._id.toString() === itemId)
        if(!item) return res.status(404).json({ message: 'item not found' })
        if(item.quantity === 1){
            user.cart = user.cart.filter(item => item._id.toString() !== itemId)
            await user.save()
            return res.status(200).json(user)
        }
        item.quantity -= 1

        await user.save()
        return res.status(200).json(user)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const getFavProduct = async(req, res) => {
    try{
        const user = await User.findById(req.user.id).populate('fav')
        if(!user)return res.status(404).json({ message: 'User not found' })

        return res.status(200).json(user.fav)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const checkout = async(req, res) => {
    const { shippingAddress, paymentMethod = 'cod' } = req.body
    try{
        const user = await User.findById(req.user.id)
        if(!user) return res.status(404).json({ message: 'User not found' })
        if(user.cart.length === 0) return res.status(400).json({ message: 'Cart is empty' })

        const items = []
        let totalAmount = 0;
        for(const cartItem of user.cart){
            const productId = cartItem.product;
            const product = await Product.findById(productId)
            if(!product) continue; //product was deleted
            if(product.quantity < cartItem.quantity){
                return res.status(400).json({
                    message: `No enough stock for ${product.title}`
                })
            }

            items.push({
                product: product._id,
                title: product.title,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            })

            totalAmount += cartItem.quantity * product.price
        }

        const newOrder = new Order({
            user: req.user.id,
            items,
            shippingAddress,
            totalAmount,
            paymentMethod
        })
        await newOrder.save()


        //decrement stock
        for (const item of items){
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: -item.quantity }
            })
        }
        user.cart = []
        await user.save()

        res.status(200).json({newOrder, user})
        
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const getMyOrder = async(req, res) => {
    const {id} = req.params
    try{
        const order = await Order.findOne({ _id: id })
        if(!order) return res.status(404).json({ message: 'Order not found' })
        if(order.user.toString() !== req.user.id) return res.status(401).json({ message: 'You can\' access another user\'s order' })
        return res.status(200).json(order)    
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const getMyOrders = async (req, res) => {
    try{
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })
        return res.status(200).json(orders)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const cancelOrder = async(req, res) => {
    const {id} = req.body
    try{
        const order = await Order.findOne({ _id: id, user: req.user.id })
        if(order.orderStatus !== 'pending'){
            return res.status(400).json({ message: `Order can no longer be cancelled` })
        }
        order.orderStatus = 'cancelled'
        await order.save()

        //restore stock
        for (const item of order.items){
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: +item.quantity }
            })
        }

        return res.status(200).json({message: 'Order cancelled', order})
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}