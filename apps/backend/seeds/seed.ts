import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, TableStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = await Promise.all(
    Object.values(UserRole).map((name) =>
      prisma.role.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const adminRole = roles.find((r) => r.name === UserRole.ADMIN)!;
  const waiterRole = roles.find((r) => r.name === UserRole.WAITER)!;

  await prisma.user.upsert({
    where: { email: 'admin@pos.local' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@pos.local',
      passwordHash: await bcrypt.hash('Password123!', 10),
      roleId: adminRole.id
    }
  });

  await prisma.user.upsert({
    where: { email: 'waiter@pos.local' },
    update: {},
    create: {
      name: 'Waiter One',
      email: 'waiter@pos.local',
      passwordHash: await bcrypt.hash('Password123!', 10),
      roleId: waiterRole.id
    }
  });

  const floor = await prisma.floor.upsert({
    where: { id: 'ground-floor' },
    update: { name: 'Ground Floor' },
    create: { id: 'ground-floor', name: 'Ground Floor', sortOrder: 1 }
  });

  await prisma.table.createMany({
    data: [
      { floorId: floor.id, name: 'T1', seats: 4, status: TableStatus.AVAILABLE, x: 100, y: 100 },
      { floorId: floor.id, name: 'T2', seats: 2, status: TableStatus.OCCUPIED, x: 250, y: 100 },
      { floorId: floor.id, name: 'T3', seats: 6, status: TableStatus.RESERVED, x: 400, y: 100 }
    ],
    skipDuplicates: true
  });

  const cat = await prisma.menuCategory.create({ data: { name: 'Starters' } });
  await prisma.menuItem.createMany({
    data: [
      { categoryId: cat.id, name: 'Tomato Soup', basePrice: 6.5, stockQuantity: 25 },
      { categoryId: cat.id, name: 'Bruschetta', basePrice: 7.0, stockQuantity: 30 }
    ]
  });

  await prisma.inventory.createMany({
    data: [
      { ingredient: 'Tomato', unit: 'kg', inStock: 15, reorderLevel: 3 },
      { ingredient: 'Bread', unit: 'pcs', inStock: 60, reorderLevel: 20 }
    ],
    skipDuplicates: true
  });
}

main().finally(async () => prisma.$disconnect());
