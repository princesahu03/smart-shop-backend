import { Supplier } from '../models/supplier.model.js'
import { Product } from '../models/product.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Add Supplier:
const addSupplier = asyncHandler(
  async (req, res) => {
    const { name, phone, company } = req.body

    if (!name || !phone) {
      throw new ApiError(400,
        "Name and phone required!")
    }

    const supplier = await Supplier.create({
      name,
      phone,
      company,
      owner: req.user._id
    })

    return res.status(201).json(
      new ApiResponse(201, supplier,
        "Supplier added!")
    )
  }
)

// Get All Suppliers:
const getAllSuppliers = asyncHandler(
  async (req, res) => {
    const suppliers = await Supplier.find({
      owner: req.user._id
    }).sort({ createdAt: -1 })

    return res.status(200).json(
      new ApiResponse(200, suppliers,
        "Suppliers fetched!")
    )
  }
)

// Add Bill to Supplier:
const addSupplierBill = asyncHandler(
  async (req, res) => {
    const { supplierId } = req.params
    const { billNumber, date, items } = req.body

    const totalAmount = items.reduce(
      (sum, item) => sum + 
        (item.price * item.quantity), 0
    )

    const supplier = await 
      Supplier.findOneAndUpdate(
        {
          _id: supplierId,
          owner: req.user._id
        },
        {
          $push: {
            bills: {
              billNumber,
              date: date || new Date(),
              amount: totalAmount,
              items
            }
          }
        },
        { new: true }
      )

    if (!supplier) {
      throw new ApiError(404,
        "Supplier not found!")
    }

    return res.status(201).json(
      new ApiResponse(201, supplier,
        "Bill added!")
    )
  }
)

// Get Supplier Bills:
const getSupplierBills = asyncHandler(
  async (req, res) => {
    const { supplierId } = req.params

    const supplier = await Supplier.findOne({
      _id: supplierId,
      owner: req.user._id
    })

    if (!supplier) {
      throw new ApiError(404,
        "Supplier not found!")
    }

    return res.status(200).json(
      new ApiResponse(200, {
        supplier,
        bills: supplier.bills
      }, "Bills fetched!")
    )
  }
)

// Compare Suppliers:
const compareSuppliers = asyncHandler(
  async (req, res) => {
    const { productName } = req.query

    // Find all suppliers with
    // matching product bills:
    const suppliers = await Supplier.find({
      owner: req.user._id
    })

    const comparison = suppliers.map(s => {
      const relevantBills = s.bills.filter(bill =>
        bill.items.some(item =>
          item.productName.toLowerCase()
            .includes(
              productName?.toLowerCase() || ''
            )
        )
      )

      const prices = relevantBills.flatMap(
        bill => bill.items
          .filter(item =>
            item.productName.toLowerCase()
              .includes(
                productName?.toLowerCase() || ''
              )
          )
          .map(item => ({
            price: item.price,
            quantity: item.quantity,
            date: bill.date,
            billNumber: bill.billNumber
          }))
      )

      return {
        supplier: {
          _id: s._id,
          name: s.name,
          phone: s.phone,
          company: s.company
        },
        prices,
        avgPrice: prices.length ?
          prices.reduce(
            (sum, p) => sum + p.price, 0
          ) / prices.length : null,
        lowestPrice: prices.length ?
          Math.min(...prices.map(p => p.price))
          : null,
        lastPrice: prices.length ?
          prices[prices.length - 1]?.price
          : null
      }
    }).filter(s => s.prices.length > 0)

    return res.status(200).json(
      new ApiResponse(200, comparison,
        "Comparison ready!")
    )
  }
)

export {
  addSupplier,
  getAllSuppliers,
  addSupplierBill,
  getSupplierBills,
  compareSuppliers
}