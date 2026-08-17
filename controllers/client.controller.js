import Product from "../models/Product.model.js"
import User from "../models/User.model.js"

export const getProductsPerCategory = async(req, res) => {
    const { cat } = req.query
    if(!cat) return res.status(400).json({ message: 'cat parameter required' })
    console.log(cat)      
    try{
        const products = await Product.find({ category: cat })
        if(!products) return res.status(400).json({ message: 'Can\' get products' })
        return res.status(200).json(products)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong'})
    }
}

export const addFavProduct = async(req, res) => {
    const { id } = req.params
    try{
        const user = await User.findById(req.user.id)
        // console.log(us)
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
    const { id } = req.params
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
    const { id } = req.params
    try{
        const user = await User.findById(id)
        user.cart.product.push(id) ///?????????//
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}