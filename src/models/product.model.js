import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  barcode: {
    type: String,
    sparse: true
    // Optional — scan se aayega!
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Food', 
      'Beverages',
      'Personal Care',
      'Household',
      'Medicine',
      'Stationery',
      'Other'
    ]
  },
  purchasePrice: {
    type: Number,
    required: true
    // Dealer se kharida price
  },
  sellingPrice: {
    type: Number,
    required: true
    // Customer ko becha price
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  minStockAlert: {
    type: Number,
    default: 10
    // Itna stock kam ho → Alert!
  },
  expiryDate: {
    type: Date
    // Expiry wale products ke liye
  },
  expiryAlertDays: {
    type: Number,
    default: 30
    // 30 din pehle alert!
  },
  unit: {
    type: String,
    enum: ['piece', 'kg', 'liter', 
           'dozen', 'pack'],
    default: 'piece'
  },
  supplier: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

export const Product = mongoose.model(
  'Product', productSchema
)