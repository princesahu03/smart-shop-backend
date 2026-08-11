import { Product } from '../models/product.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Add Product:
const addProduct = asyncHandler(
  async (req, res) => {
    const {
      name, barcode, category,
      purchasePrice, sellingPrice,
      stock, minStockAlert,
      expiryDate, unit, supplier
    } = req.body

    if (!name || !category ||
        !purchasePrice || !sellingPrice) {
      throw new ApiError(400,
        "Required fields missing!")
    }

    // ✅ Empty barcode = undefined (not ""):
    const barcodeValue = barcode?.trim()
      ? barcode.trim()
      : undefined

    // Only check duplicate if barcode given:
    if (barcodeValue) {
      const existing = await Product.findOne({
        barcode: barcodeValue,
        owner: req.user._id
      })
      if (existing) {
        throw new ApiError(409,
          "Barcode already exists!")
      }
    }

    const product = await Product.create({
      name,
      barcode: barcodeValue, // undefined if empty
      category,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      stock: Number(stock) || 0,
      minStockAlert: Number(minStockAlert) || 10,
      expiryDate: expiryDate || undefined,
      unit: unit || 'piece',
      supplier: supplier || undefined,
      owner: req.user._id
    })

    return res.status(201).json(
      new ApiResponse(
        201, product,
        "Product added successfully!"
      )
    )
  }
)

// Get All Products:
const getAllProducts = asyncHandler(
  async (req, res) => {
    const { 
      search, category, 
      lowStock, expiringSoon 
    } = req.query

    const filter = { owner: req.user._id }

    // Search by name or barcode:
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: search }
      ]
    }

    // Category filter:
    if (category) filter.category = category

    // Low stock filter:
    if (lowStock === 'true') {
      filter.$expr = {
        $lte: ['$stock', '$minStockAlert']
      }
    }

    // Expiring soon filter:
    if (expiringSoon === 'true') {
      const thirtyDaysLater = new Date()
      thirtyDaysLater.setDate(
        thirtyDaysLater.getDate() + 30
      )
      filter.expiryDate = {
        $lte: thirtyDaysLater,
        $gte: new Date()
      }
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })

    return res.status(200).json(
      new ApiResponse(
        200, {
          products,
          total: products.length
        },
        "Products fetched!"
      )
    )
  }
)

// Get Product by Barcode:
const getProductByBarcode = asyncHandler(
  async (req, res) => {
    const { barcode } = req.params

    const product = await Product.findOne({
      barcode,
      owner: req.user._id
    })

    if (!product) {
      throw new ApiError(404,
        "Product not found!")
    }

    return res.status(200).json(
      new ApiResponse(
        200, product,
        "Product found!"
      )
    )
  }
)

// Update Product:
const updateProduct = asyncHandler(
  async (req, res) => {
    const { productId } = req.params

    const product = await 
      Product.findOneAndUpdate(
        { 
          _id: productId,
          owner: req.user._id
        },
        { $set: req.body },
        { new: true }
      )

    if (!product) {
      throw new ApiError(404,
        "Product not found!")
    }

    return res.status(200).json(
      new ApiResponse(
        200, product,
        "Product updated!"
      )
    )
  }
)

// Update Stock:
const updateStock = asyncHandler(
  async (req, res) => {
    const { productId } = req.params
    const { quantity, type } = req.body
    // type = 'add' or 'remove'

    const product = await 
      Product.findOne({
        _id: productId,
        owner: req.user._id
      })

    if (!product) {
      throw new ApiError(404,
        "Product not found!")
    }

    if (type === 'add') {
      product.stock += Number(quantity)
    } else if (type === 'remove') {
      if (product.stock < quantity) {
        throw new ApiError(400,
          "Insufficient stock!")
      }
      product.stock -= Number(quantity)
    }

    await product.save()

    return res.status(200).json(
      new ApiResponse(
        200, product,
        `Stock ${type === 'add' ? 
          'added' : 'removed'}!`
      )
    )
  }
)

// Delete Product:
const deleteProduct = asyncHandler(
  async (req, res) => {
    const { productId } = req.params

    const product = await 
      Product.findOneAndDelete({
        _id: productId,
        owner: req.user._id
      })

    if (!product) {
      throw new ApiError(404,
        "Product not found!")
    }

    return res.status(200).json(
      new ApiResponse(
        200, {},
        "Product deleted!"
      )
    )
  }
)

// Get Alerts:
const getAlerts = asyncHandler(
  async (req, res) => {

    // Low stock products:
    const lowStockProducts = 
      await Product.find({
        owner: req.user._id,
        $expr: {
          $lte: ['$stock', '$minStockAlert']
        }
      })

    // Expiring products (30 days):
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(
      thirtyDaysLater.getDate() + 30
    )

    const expiringProducts = 
      await Product.find({
        owner: req.user._id,
        expiryDate: {
          $lte: thirtyDaysLater,
          $gte: new Date()
        }
      })

    // Expired products:
    const expiredProducts = 
      await Product.find({
        owner: req.user._id,
        expiryDate: { $lt: new Date() }
      })

    return res.status(200).json(
      new ApiResponse(200, {
        lowStockProducts,
        expiringProducts,
        expiredProducts,
        totalAlerts: 
          lowStockProducts.length +
          expiringProducts.length +
          expiredProducts.length
      }, "Alerts fetched!")
    )
  }
)

export {
  addProduct,
  getAllProducts,
  getProductByBarcode,
  updateProduct,
  updateStock,
  deleteProduct,
  getAlerts
}