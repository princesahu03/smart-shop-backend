import mongoose from 'mongoose'

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  company: {
    type: String,
    trim: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  bills: [{
    billNumber: String,
    date: Date,
    amount: Number,
    items: [{
      productName: String,
      quantity: Number,
      price: Number
    }]
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

export const Supplier = mongoose.model(
  'Supplier', supplierSchema
)