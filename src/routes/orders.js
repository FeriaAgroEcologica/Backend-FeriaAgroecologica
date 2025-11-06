import express from 'express';
import { createOrder, getOrdersByCustomer } from '../controllers/ordersController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// Crear una nueva orden (checkout)
router.post('/', createOrder);

// Ver las órdenes del cliente
router.get('/', getOrdersByCustomer);

export default router;
