import { Router } from 'express';
import { login } from '../modules/auth/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { listFloors, upsertFloor } from '../modules/floors/floor.controller.js';
import { mergeTables, upsertTable } from '../modules/tables/table.controller.js';
import { createOrder, transferOrder, updateOrderStatus } from '../modules/orders/order.controller.js';
import { createPayment } from '../modules/payments/payment.controller.js';
import { dailySales, topItems } from '../modules/reports/report.controller.js';
import { syncBatch } from '../modules/sync/sync.controller.js';

export const apiRouter = Router();

apiRouter.post('/auth/login', login);

apiRouter.use(requireAuth);
apiRouter.get('/floors', listFloors);
apiRouter.post('/floors', upsertFloor);
apiRouter.post('/tables', upsertTable);
apiRouter.post('/tables/merge', mergeTables);
apiRouter.post('/orders', createOrder);
apiRouter.patch('/orders/:id/status', updateOrderStatus);
apiRouter.post('/orders/transfer', transferOrder);
apiRouter.post('/payments', createPayment);
apiRouter.post('/sync/batch', syncBatch);
apiRouter.get('/reports/daily-sales', dailySales);
apiRouter.get('/reports/top-items', topItems);
