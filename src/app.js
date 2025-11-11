// ===============================
// IMPORTS PRINCIPALES
// ===============================
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno (.env)
dotenv.config();

// ===============================
// IMPORTACIÓN DE RUTAS
// ===============================
import usersRoutes from './routes/usersRoutes.js';
import productsRouter from './routes/products.js';
import publicRoutes from './routes/public.js';
import orderRoutes from './routes/orders.js';
import blogRoutes from './routes/blogRoutes.js';

// ===============================
// CONFIGURACIÓN DE LA APP
// ===============================
const app = express();

// Middleware básico
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));
app.use(express.json());

// ===============================
// CORS CONFIGURADO DINÁMICAMENTE
// ===============================
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// ===============================
// RUTAS PRINCIPALES
// ===============================
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRouter);
app.use('/api/public', publicRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blogs', blogRoutes);

// ===============================
// MIDDLEWARE GLOBAL DE ERRORES
// ===============================
app.use((err, req, res, next) => {
  console.error('🔴 Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ===============================
// EXPORTAR APP
// ===============================
export default app;
