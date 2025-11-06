import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createOrder = async (req, res) => {
  const { tenantId, userId } = req;
  const { customerId, items } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No hay productos en la orden.' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.tenantId !== tenantId) {
        return res.status(404).json({ error: `Producto ID ${item.productId} no encontrado.` });
      }

      if (product.quantityAvailable < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para el producto ${product.name}.`,
        });
      }

      const unitPrice = product.price; // 👈 Tomar el precio real de la DB
      totalAmount += item.quantity * unitPrice;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
      });

      // 🔥 Reducir stock del producto
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantityAvailable: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Crear la orden con los ítems
    const newOrder = await prisma.order.create({
      data: {
        tenantId,
        customerId,
        status: 'pending', // Puedes cambiar a 'completed' si quieres marcarla como finalizada de una vez
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({
      message: 'Orden creada exitosamente.',
      order: newOrder,
    });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: 'Error al procesar la orden' });
  }
};

export const getOrdersByCustomer = async (req, res) => {
  const { tenantId } = req;
  const { customerId } = req.query;

  try {
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        customerId,
      },
      include: {
        items: {
          include: {
            product: true, // 👈 Incluye detalles del producto en cada ítem
          },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};
