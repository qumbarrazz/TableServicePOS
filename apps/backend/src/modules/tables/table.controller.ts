import { Request, Response } from 'express';
import { prisma } from '../../config/db.js';

export const upsertTable = async (req: Request, res: Response) => {
  const { id, floorId, name, seats, x, y, status } = req.body;
  const table = id
    ? await prisma.table.update({ where: { id }, data: { floorId, name, seats, x, y, status } })
    : await prisma.table.create({ data: { floorId, name, seats, x, y, status } });
  return res.json(table);
};

export const mergeTables = async (req: Request, res: Response) => {
  const { sourceTableId, targetTableId } = req.body;
  await prisma.table.update({ where: { id: sourceTableId }, data: { mergedIntoTableId: targetTableId } });
  return res.json({ message: 'Table merged' });
};
