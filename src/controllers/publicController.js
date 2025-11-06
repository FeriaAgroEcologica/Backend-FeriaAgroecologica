import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Obtiene todos los productos junto con su usuario (nombre y contacto)
export const getPublicCatalog = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(products);
  } catch (error) {
    console.error('Error al obtener el catálogo:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
