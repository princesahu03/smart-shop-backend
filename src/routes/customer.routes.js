import { Router } from 'express'
import {
  addCustomer,
  getAllCustomers,
  getCustomerDetails,
  addUdharPayment
} from '../controllers/customer.controller.js'
import { verifyJWT } from 
  '../middlewares/auth.middleware.js'

const router = Router()

router.use(verifyJWT)

router.route('/')
  .get(getAllCustomers)
  .post(addCustomer)

router.route('/:customerId')
  .get(getCustomerDetails)

router.route('/:customerId/payment')
  .post(addUdharPayment)

export default router