import { body } from "express-validator";

const paymentMethod = ['cod', 'stripe']

export const checkoutValidator = [
    body('paymentMethod')
        .trim()
        .notEmpty().withMessage('paymentMethod is required')
        .isIn(paymentMethod).withMessage(`payment method must be one of: ${paymentMethod.join(', ')}`),
    body('shippingAddress.street')
        .trim()
        .notEmpty().withMessage('Street is required'),
    body('shippingAddress.city')
        .trim()
        .notEmpty().withMessage('City is required'),
    body('shippingAddress.state')
        .trim()
        .notEmpty().withMessage('State is required'),
    body('shippingAddress.postalCode')
        .trim()
        .notEmpty().withMessage('postal code is required'),
]