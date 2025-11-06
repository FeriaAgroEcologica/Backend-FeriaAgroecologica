import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import usersRoutes from './routes/usersRoutes.js';
import productsRouter from './routes/products.js';
import publicRoutes from './routes/public.js';
import orderRoutes from './routes/orders.js';
import blogRoutes from './routes/blogRoutes.js'; // <-- Importa aquí

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use('/api/users', usersRoutes);
app.use('/api/products', productsRouter);
app.use('/api/public', publicRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blogs', blogRoutes); // <-- Añade esta línea para blogs

// Middleware para manejar errores generales
app.use((err, req, res, next) => {
  console.error('🔴 Error:', err.message);
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
