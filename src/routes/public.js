import express from 'express';
import { getPublicCatalog } from '../controllers/publicController.js';

const router = express.Router();

// Ruta pública sin autenticación
router.get('/catalog', getPublicCatalog);

export default router;
