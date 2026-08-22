import crypto from 'crypto'
import { configDotenv } from 'dotenv'

configDotenv()
const api_secret = process.env.CHARGILY_SECRET_KEY

export async function createChargilyCheckout({ totalAmount, orderId  }){
    try{
        console.log(totalAmount, orderId)
        const res = await fetch(`https://pay.chargily.net/test/api/v2/checkouts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${api_secret}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "amount": totalAmount,
                "currency": "dzd",
                "success_url": `${process.env.APP_BASE_URL}/success`,
                "failure_url": `${process.env.APP_BASE_URL}/failure`,
                "webhook_endpoint": `${process.env.APP_BASE_URL}/payment/webhook`,
                "metadata": {orderId: orderId.toString()}
            })
        })
        const data = await res.json()
        console.log(data)
        if(!res.ok) throw new Error(data.message || 'Chargily checkout creation failed')
        return data
    }catch(err){
        console.log(err)
    }
}


export function verifyChargilySignature(rawBody, signature){
    if(!signature) return false;

    //calculate the signature
    const computedSignature = crypto
        .createHmac('sha256', api_secret)
        .update(rawBody)
        .digest('hex')

    console.log({received: signature, computedSignature})
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature))
}