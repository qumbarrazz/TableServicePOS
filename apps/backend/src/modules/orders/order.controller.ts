import { Request, Response } from 'express';
import { prisma } from '../../config/db.js';
import { AuthRequest } from '../../middleware/auth.js';

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { tableId, items, notes } = req.body;

  const subtotal = items.reduce((acc: number, i: { quantity: number; unitPrice: number }) => acc + i.quantity * i.unitPrice, 0);
  const taxAmount = subtotal * 0.1;
  const totalAmount = subtotal + taxAmount;

  const order = await prisma.order.create({
    data: {
      tableId,
      createdById: req.user!.id,
      notes,
      subtotal,
      taxAmount,
      totalAmount,
      orderItems: {
        create: items.map((i: any) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          notes: i.notes,
          modifiers: i.modifiers
        }))
      }
    },
    include: { orderItems: true }
  });

  return res.status(201).json(order);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, cancelReason, hold } = req.body;
  const order = await prisma.order.update({ where: { id }, data: { status, cancelReason, hold } });
  return res.json(order);
};

export const transferOrder = async (req: Request, res: Response) => {
  const { orderId, newTableId } = req.body;
  const order = await prisma.order.update({ where: { id: orderId }, data: { tableId: newTableId } });
  return res.json(order);
};
