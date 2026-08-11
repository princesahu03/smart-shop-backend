import { Router } from 'express'
import {
  addProduct,
  getAllProducts,
  getProductByBarcode,
  updateProduct,
  updateStock,
  deleteProduct,
  getAlerts
} from '../controllers/product.controller.js'
import { verifyJWT } from 
  '../middlewares/auth.middleware.js'

const router = Router()

// All routes protected!
router.use(verifyJWT)

router.route('/')
  .get(getAllProducts)
  .post(addProduct)

router.route('/alerts')
  .get(getAlerts)

router.route('/barcode/:barcode')
  .get(getProductByBarcode)

router.route('/:productId')
  .put(updateProduct)
  .delete(deleteProduct)

router.route('/:productId/stock')
  .patch(updateStock)

export default router