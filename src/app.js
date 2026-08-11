import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from
  './middlewares/error.middleware.js'

import authRoutes from './routes/auth.routes.js'
import productRoutes from
  './routes/product.routes.js'
import customerRoutes from
  './routes/customer.routes.js'
import transactionRoutes from
  './routes/transaction.routes.js'
import supplierRoutes from
  './routes/supplier.routes.js'

const app = express()

// ✅ CORS FIX:
const allowedOrigins = [
  'http://localhost:5173',
  'https://smart-shop-frontend.netlify.app'
]

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin
    // (mobile apps, postman, etc.)
    if (!origin) return callback(null, true)

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT',
    'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie'
  ]
}))

// Handle preflight:
app.options('*', cors())

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