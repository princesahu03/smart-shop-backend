import { Router } from 'express'
import {
  addSupplier,
  getAllSuppliers,
  addSupplierBill,
  getSupplierBills,
  compareSuppliers
} from '../controllers/supplier.controller.js'
import { verifyJWT } from
  '../middlewares/auth.middleware.js'

const router = Router()
router.use(verifyJWT)

router.route('/')
  .get(getAllSuppliers)
  .post(addSupplier)

router.route('/compare')
  .get(compareSuppliers)

router.route('/:supplierId/bills')
  .get(getSupplierBills)
  .post(addSupplierBill)

export default router