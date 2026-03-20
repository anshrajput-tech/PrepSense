import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { createOrder, verifyPayment } from "../controllers/payment.controller.js"



const paymentRouter = express.Router()

paymentRouter.use(isAuth)
paymentRouter.post("/order", createOrder)
paymentRouter.post("/verify", verifyPayment)


export default paymentRouter