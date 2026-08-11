import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['sale', 'udhar', 
           'udhar_payment', 'purchase'],
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    price: Number,
    total: Number
  }],
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
    // Udhar ke liye!
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: 0
    // Udhar amount!
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 
           'udhar', 'card'],
    default: 'cash'
  },
  notes: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

export const Transaction = mongoose.model(
  'Transaction', transactionSchema
)