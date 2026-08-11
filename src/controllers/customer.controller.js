import { Customer } from '../models/customer.model.js'
import { Transaction } from '../models/transaction.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Add Customer:
const addCustomer = asyncHandler(
  async (req, res) => {
    const { name, phone, address } = req.body

    if (!name || !phone) {
      throw new ApiError(400,
        "Name and phone required!")
    }

    const customer = await Customer.create({
      name,
      phone,
      address,
      owner: req.user._id
    })

    return res.status(201).json(
      new ApiResponse(
        201, customer,
        "Customer added!"
      )
    )
  }
)

// Get All Customers:
const getAllCustomers = asyncHandler(
  async (req, res) => {
    const { search, hasUdhar } = req.query

    const filter = { owner: req.user._id }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: search }
      ]
    }

    // Only udhar customers:
    if (hasUdhar === 'true') {
      filter.totalUdhar = { $gt: 0 }
    }

    const customers = await Customer.find(filter)
      .sort({ totalUdhar: -1 })

    return res.status(200).json(
      new ApiResponse(
        200, customers,
        "Customers fetched!"
      )
    )
  }
)

// Get Customer with Udhar History:
const getCustomerDetails = asyncHandler(
  async (req, res) => {
    const { customerId } = req.params

    const customer = await Customer.findOne({
      _id: customerId,
      owner: req.user._id
    })

    if (!customer) {
      throw new ApiError(404,
        "Customer not found!")
    }

    // Udhar transactions:
    const transactions = await 
      Transaction.find({
        customer: customerId,
        type: { 
          $in: ['udhar', 'udhar_payment'] 
        }
      })
      .populate('products.product', 
        'name sellingPrice')
      .sort({ createdAt: -1 })

    return res.status(200).json(
      new ApiResponse(200, {
        customer,
        transactions,
        totalUdhar: customer.totalUdhar
      }, "Customer details fetched!")
    )
  }
)

// Add Udhar Payment:
const addUdharPayment = asyncHandler(
  async (req, res) => {
    const { customerId } = req.params
    const { amount, notes } = req.body

    const customer = await Customer.findOne({
      _id: customerId,
      owner: req.user._id
    })

    if (!customer) {
      throw new ApiError(404,
        "Customer not found!")
    }

    if (amount > customer.totalUdhar) {
      throw new ApiError(400,
        "Payment exceeds udhar amount!")
    }

    // Update customer udhar:
    customer.totalUdhar -= Number(amount)
    await customer.save()

    // Transaction record:
    await Transaction.create({
      type: 'udhar_payment',
      customer: customerId,
      totalAmount: amount,
      paidAmount: amount,
      remainingAmount: 0,
      paymentMethod: 'cash',
      notes,
      owner: req.user._id
    })

    return res.status(200).json(
      new ApiResponse(200, {
        customer,
        paidAmount: amount,
        remainingUdhar: customer.totalUdhar
      }, "Payment recorded!")
    )
  }
)

export {
  addCustomer,
  getAllCustomers,
  getCustomerDetails,
  addUdharPayment
}