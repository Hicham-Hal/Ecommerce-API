import User from "../models/User.model.js"

export const isAdmin = async(req, res, next) => {
    try{
        const user = await User.findById(req.user.id)
        if(!user) return res.status(404).json({ message: 'User not found' })
        if(user.role !== 'admin') return res.status(403).json({ message: 'User role must be admin' })
        next()
    }catch(err){
        console.log(err)
        return res.status(401).json({ error: err.message })
    }
}