import express from 'express';

const router = express.Router();

// Define las rutas para el dashboard
router.get('/', (req, res) => {
  res.send('Dashboard funcionando correctamente');
});

// Exporta el router como exportación predeterminada
export default router;
