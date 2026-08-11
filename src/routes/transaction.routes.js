import { Router } from 'express'
import {
  createSale,
  getAllTransactions,
  getMonthlyAnalysis
} from '../controllers/transaction.controller.js'
import { verifyJWT } from 
  '../middlewares/auth.middleware.js'

const router = Router()

router.use(verifyJWT)

router.route('/')
  .get(getAllTransactions)
  .post(createSale)

router.route('/analysis/monthly')
  .get(getMonthlyAnalysis)

export default router