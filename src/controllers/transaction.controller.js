import { Transaction } from '../models/transaction.model.js'
import { Product } from '../models/product.model.js'
import { Customer } from '../models/customer.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Create Sale:
const createSale = asyncHandler(
  async (req, res) => {
    const {
      products,
      customerId,
      paymentMethod,
      paidAmount,
      notes
    } = req.body

    if (!products || products.length === 0) {
      throw new ApiError(400,
        "Products required!")
    }

    // Calculate total + update stock:
    let totalAmount = 0
    const productDetails = []

    for (const item of products) {
      const product = await Product.findOne({
        _id: item.productId,
        owner: req.user._id
      })

      if (!product) {
        throw new ApiError(404,
          `Product not found!`)
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400,
          `Insufficient stock for 
          ${product.name}!`)
      }

      const itemTotal = 
        product.sellingPrice * item.quantity
      totalAmount += itemTotal

      productDetails.push({
        product: item.productId,
        quantity: item.quantity,
        price: product.sellingPrice,
        total: itemTotal
      })

      // Stock update:
      product.stock -= item.quantity
      await product.save()
    }

    const remainingAmount = 
      totalAmount - (paidAmount || 0)

    // Udhar handle:
    if (paymentMethod === 'udhar' && customerId) {
      await Customer.findByIdAndUpdate(
        customerId,
        { $inc: { totalUdhar: remainingAmount } }
      )
    }

    const transaction = await Transaction.create({
      type: paymentMethod === 'udhar' ? 
        'udhar' : 'sale',
      products: productDetails,
      customer: customerId || null,
      totalAmount,
      paidAmount: paidAmount || totalAmount,
      remainingAmount: remainingAmount || 0,
      paymentMethod,
      notes,
      owner: req.user._id
    })

    return res.status(201).json(
      new ApiResponse(
        201, transaction,
        "Sale recorded successfully!"
      )
    )
  }
)

// Get All Transactions:
const getAllTransactions = asyncHandler(
  async (req, res) => {
    const { 
      type, startDate, 
      endDate, page = 1, 
      limit = 20 
    } = req.query

    const filter = { owner: req.user._id }

    if (type) filter.type = type

    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) {
        filter.createdAt.$gte = 
          new Date(startDate)
      }
      if (endDate) {
        filter.createdAt.$lte = 
          new Date(endDate)
      }
    }

    const skip = (page - 1) * limit

    const transactions = await Transaction
      .find(filter)
      .populate('products.product', 
        'name sellingPrice')
      .populate('customer', 
        'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Transaction
      .countDocuments(filter)

    return res.status(200).json(
      new ApiResponse(200, {
        transactions,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      }, "Transactions fetched!")
    )
  }
)

// Monthly Analysis:
const getMonthlyAnalysis = asyncHandler(
  async (req, res) => {
    const { month, year } = req.query

    const currentDate = new Date()
    const targetMonth = month ? 
      parseInt(month) - 1 : 
      currentDate.getMonth()
    const targetYear = year ? 
      parseInt(year) : 
      currentDate.getFullYear()

    const startDate = new Date(
      targetYear, targetMonth, 1
    )
    const endDate = new Date(
      targetYear, targetMonth + 1, 0
    )

    // Monthly stats:
    const stats = await Transaction.aggregate([
      {
        $match: {
          owner: req.user._id,
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ])

    // Daily sales chart data:
    const dailySales = await Transaction.aggregate([
      {
        $match: {
          owner: req.user._id,
          type: 'sale',
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dayOfMonth: "$createdAt"
          },
          totalSales: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ])

    // Top selling products:
    const topProducts = await Transaction.aggregate([
      {
        $match: {
          owner: req.user._id,
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { 
            $sum: "$products.quantity" 
          },
          totalRevenue: { 
            $sum: "$products.total" 
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      }
    ])

    // Summary:
    let totalSales = 0
    let totalUdhar = 0
    let totalPayments = 0

    stats.forEach(stat => {
      if (stat._id === 'sale') 
        totalSales = stat.totalAmount
      if (stat._id === 'udhar') 
        totalUdhar = stat.totalAmount
      if (stat._id === 'udhar_payment') 
        totalPayments = stat.totalAmount
    })

    return res.status(200).json(
      new ApiResponse(200, {
        summary: {
          totalSales,
          totalUdhar,
          totalPayments,
          netRevenue: totalSales + totalPayments
        },
        dailySales,
        topProducts,
        month: targetMonth + 1,
        year: targetYear
      }, "Monthly analysis fetched!")
    )
  }
)

export {
  createSale,
  getAllTransactions,
  getMonthlyAnalysis
}