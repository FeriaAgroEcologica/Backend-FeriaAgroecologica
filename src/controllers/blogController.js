// backend/src/controllers/blogsController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Crear blog
export const createBlogPost = async (req, res) => {
  try {
    const { title, description, imageUrl, categories = [], tags = [] } = req.body;
    const { userId, tenantId } = req; // 👈 asumimos que el middleware añade userId y tenantId

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.tenantId !== tenantId) {
      return res.status(400).json({ error: 'Usuario no válido o acceso denegado' });
    }

    const blogPost = await prisma.blogPost.create({
      data: {
        tenantId,
        userId,
        title,
        description,
        imageUrl,
        categories: {
          connect: categories.map((id) => ({ id })),
        },
        tags: {
          connect: tags.map((id) => ({ id })),
        },
      },
      include: {
        tenant: true,
        user: true,
        categories: true,
        tags: true,
      },
    });

    res.status(201).json(blogPost);
  } catch (error) {
    console.error('Error creando blogPost:', error);
    res.status(500).json({ error: 'Error al crear el blog', details: error.message });
  }
};

// Obtener todos los blogs (solo tenant del usuario)
export const getAllBlogPosts = async (req, res) => {
  try {
    const { tenantId } = req;

    const blogPosts = await prisma.blogPost.findMany({
      where: { tenantId }, // 👈 solo los de su tenant
      include: {
        tenant: true,
        user: true,
        categories: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(blogPosts);
  } catch (error) {
    console.error('Error al obtener blogPosts:', error);
    res.status(500).json({ error: 'Error al obtener blogs', details: error.message });
  }
};

// Obtener blog por ID (solo si pertenece al tenant)
export const getBlogPostById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { tenantId } = req;

    const blogPost = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        tenant: true,
        user: true,
        categories: true,
        tags: true,
      },
    });

    if (!blogPost || blogPost.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Blog no encontrado o acceso denegado' });
    }

    res.json(blogPost);
  } catch (error) {
    console.error('Error al obtener blogPost:', error);
    res.status(500).json({ error: 'Error al obtener el blog', details: error.message });
  }
};

// Actualizar blog (solo autor y dentro del tenant)
export const updateBlogPost = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { userId, tenantId } = req;
    const { title, description, imageUrl, categories = [], tags = [] } = req.body;

    const blogPost = await prisma.blogPost.findUnique({ where: { id } });
    if (!blogPost || blogPost.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Blog no encontrado o acceso denegado' });
    }

    if (blogPost.userId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar este blog' });
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        categories: {
          set: categories.map((id) => ({ id })),
        },
        tags: {
          set: tags.map((id) => ({ id })),
        },
      },
      include: {
        tenant: true,
        user: true,
        categories: true,
        tags: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar blogPost:', error);
    res.status(500).json({ error: 'Error al actualizar el blog', details: error.message });
  }
};

// Eliminar blog (solo autor y dentro del tenant)
export const deleteBlogPost = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { userId, tenantId } = req;

    const blogPost = await prisma.blogPost.findUnique({ where: { id } });
    if (!blogPost || blogPost.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Blog no encontrado o acceso denegado' });
    }

    if (blogPost.userId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este blog' });
    }

    await prisma.blogPost.delete({ where: { id } });

    res.json({ message: 'Blog eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar blogPost:', error);
    res.status(500).json({ error: 'Error al eliminar el blog', details: error.message });
  }
};
