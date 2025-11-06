// backend/src/controllers/productsController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createProduct = async (req, res) => {
  try {
    const { name, description, photoUrl, quantityAvailable, contactNumber, price } = req.body;
    const { tenantId, userId } = req;

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        photoUrl,
        quantityAvailable,
        contactNumber,
        price, // 👈 Añadido aquí
        tenantId,
        userId,
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, photoUrl, quantityAvailable, contactNumber, price } = req.body;
    const { tenantId } = req;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Producto no encontrado o acceso denegado.' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        photoUrl,
        quantityAvailable,
        contactNumber,
        price, // 👈 Añadido aquí
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getProducts = async (req, res) => {
  try {
    const { tenantId } = req;

    const products = await prisma.product.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        photoUrl: true,
        quantityAvailable: true,
        contactNumber: true,
        price: true,          // 👈 Incluye el precio en la respuesta
        createdAt: true,
      },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { tenantId } = req;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Producto no encontrado o acceso denegado.' });
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({ message: 'Producto eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

