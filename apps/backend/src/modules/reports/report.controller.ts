import { Request, Response } from 'express';
import { prisma } from '../../config/db.js';

export const dailySales = async (_req: Request, res: Response) => {
  const result = await prisma.order.aggregate({ _sum: { totalAmount: true }, _count: { id: true } });
  return res.json(result);
};

export const topItems = async (_req: Request, res: Response) => {
  const result = await prisma.orderItem.groupBy({ by: ['menuItemId'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 10 });
  return res.json(result);
};
