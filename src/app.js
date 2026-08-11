import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from 
  './middlewares/error.middleware.js'

// Routes import:
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import customerRoutes from './routes/customer.routes.js'
import transactionRoutes from './routes/transaction.routes.js'
import supplierRoutes from './routes/supplier.routes.js'



const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://smart-shop-prince.netlify.app'
  ],
  credentials: true
}))
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ 
  extended: true, 
  limit: '16kb' 
}))
app.use(cookieParser())

// Routes:
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/customers', customerRoutes)
app.use('/api/v1/transactions', transactionRoutes)
app.use('/api/v1/suppliers', supplierRoutes)

// Health Check:
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Shop API Running! 🛒"
  })
})

// Error Handler:
app.use(errorHandler)

export { app }