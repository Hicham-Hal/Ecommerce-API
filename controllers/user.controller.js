import { JsonWebTokenError } from "jsonwebtoken"
import User from "../models/User.model"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const login = async(req, res) => {
    const {email, password} = req.body
    try{
        const user = await User.findOne({ email })
        if(!user) return res.status(401).json({ message: 'wrong credentials, Please try again' })
        const comparedPwd = await bcrypt.compare(password, user.password)
        if(!comparedPwd) return res.status(401).json({ message: 'wrong credentials, please try again' })
        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        const refreshToken = jwt.sign({id: user._id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,  
        })
        return res.status(200).json(user)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const register = async(req, res) => {
    const {name, email, password} = req.body
    if(!name || !email || !password){
        return res.status(400).json('fields are required')
    }
    try{
        const user = await User.findOne({ email })
        if(user) return res.status(401).json({ message: 'Email already exist' })
        const salt = await bcrypt.genSaltSync(12)
        const hashedPwd = await bcrypt.hashSync(password, salt)
        const newUser = new User({
            name,
            email,
            password: hashedPwd
        })
        await newUser.save()
        return res.status(201).json({ message: 'User created successfully' })
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const logout = async(req, res) => {
    try{

    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const refreshToken = async(req, res) => {
    try{

    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}