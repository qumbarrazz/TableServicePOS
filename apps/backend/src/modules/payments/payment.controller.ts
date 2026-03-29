import { Request, Response } from 'express';
import { prisma } from '../../config/db.js';
import { AuthRequest } from '../../middleware/auth.js';

export const createPayment = async (req: AuthRequest, res: Response) => {
  const { orderId, method, amount, tipAmount = 0, reference } = req.body;
  const payment = await prisma.payment.create({
    data: { orderId, method, amount, tipAmount, reference, userId: req.user!.id }
  });
  return res.status(201).json(payment);
};
