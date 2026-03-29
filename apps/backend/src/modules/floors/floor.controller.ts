import { Request, Response } from 'express';
import { prisma } from '../../config/db.js';

export const listFloors = async (_req: Request, res: Response) => {
  const floors = await prisma.floor.findMany({ include: { tables: true }, orderBy: { sortOrder: 'asc' } });
  return res.json(floors);
};

export const upsertFloor = async (req: Request, res: Response) => {
  const { id, name, sortOrder = 0 } = req.body;
  const floor = id
    ? await prisma.floor.update({ where: { id }, data: { name, sortOrder } })
    : await prisma.floor.create({ data: { name, sortOrder } });
  return res.json(floor);
};
