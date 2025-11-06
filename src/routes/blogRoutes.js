import { Router } from 'express';
import * as blogController from '../controllers/blogController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/blogs - público, sin token para listar blogs
router.get('/', blogController.getAllBlogPosts);

// GET /api/blogs/:id - público, sin token para obtener blog por ID
router.get('/:id', blogController.getBlogPostById);

// POST, PUT, DELETE con token para crear, actualizar y eliminar blogs
router.post('/', verifyToken, blogController.createBlogPost);
router.put('/:id', verifyToken, blogController.updateBlogPost);
router.delete('/:id', verifyToken, blogController.deleteBlogPost);

export default router;
