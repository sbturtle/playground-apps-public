import { Router } from 'express';
import { authenticate, requireAdmin } from '../auth.js';
import { findShipment, markShipped, orderOfItem } from '../services/shipmentService.js';

export const shipmentsRouter = Router();
shipmentsRouter.use(authenticate);

shipmentsRouter.get('/shipments/:shipmentId', (req, res) => {
  const shipment = findShipment(Number(req.params.shipmentId));
  const order = orderOfItem(shipment.orderItemId);
  if (order.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ message: '본인 주문의 배송만 조회할 수 있습니다.' });
  }
  res.json(shipment);
});

shipmentsRouter.post('/shipments/:shipmentId/ship', requireAdmin, (req, res) => {
  res.json(markShipped(Number(req.params.shipmentId)));
});
