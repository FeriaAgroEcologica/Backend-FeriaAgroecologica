// src/controllers/UsersController.js
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_feria_floresta';

export const register = async (req, res) => {
  const { name, phone, email, password, tenantId, tenantName = 'Default Tenant', role = 'user' } = req.body;

  try {
    // Verificar si el usuario ya existe para ese tenant
    const existingUser = await prisma.user.findFirst({
      where: { email, tenantId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado para esta empresa' });
    }

    // Si no envían tenantId, crear un tenant nuevo
    let tenant;

    if (!tenantId) {
      tenant = await prisma.tenant.create({
        data: { name: tenantName }
      });
    } else {
      tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant no encontrado' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario asociado al tenant correcto
    const newUser = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        role,
        tenant: {
          connect: { id: tenant.id }
        }
      }
    });

    return res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

export const login = async (req, res) => {
  const { email, password, tenantId } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { email, tenantId }
    });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({
      userId: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: user.role
    }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        userId: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};
