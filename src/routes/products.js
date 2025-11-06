import express from 'express';
import {
  createProduct,
  updateProduct,
  getProducts,
  deleteProduct, // 👈 IMPORTAR la función
} from '../controllers/productsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); // Middleware JWT

// Rutas existentes
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.get('/', getProducts);

// 🚀 NUEVA RUTA para eliminar producto
router.delete('/:id', deleteProduct);

export default router;
