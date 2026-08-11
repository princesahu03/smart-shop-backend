import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    trim: true
  },
  totalUdhar: {
    type: Number,
    default: 0
    // Total outstanding amount
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

export const Customer = mongoose.model(
  'Customer', customerSchema
)