import { Router } from 'express';
import { asyncHandler } from '../asyncHandler.js';
import { authenticate, requireAdmin } from '../auth.js';
import type { ShipmentStatus } from '../db.js';
import { fetchCarrierStatus } from '../services/carrierClient.js';
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

const STATUS_ORDER: ShipmentStatus[] = ['READY', 'IN_TRANSIT', 'DELIVERED'];

// 택배사에 최신 배송 상태를 확인해 저장합니다. 본인 주문의 배송(관리자는 전체)만 가능합니다.
shipmentsRouter.post(
  '/shipments/:shipmentId/refresh',
  asyncHandler(async (req, res) => {
    const shipment = findShipment(Number(req.params.shipmentId));
    const order = orderOfItem(shipment.orderItemId);
    if (order.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: '본인 주문의 배송만 새로고침할 수 있습니다.' });
    }
    if (shipment.status !== 'DELIVERED') {
      const latest = await fetchCarrierStatus(shipment.carrier, shipment.trackingNo);
      // 택배사 응답이 늦게 반영돼 이전 단계로 오면 현재 상태를 유지합니다.
      if (STATUS_ORDER.indexOf(latest) > STATUS_ORDER.indexOf(shipment.status)) shipment.status = latest;
    }
    res.json(shipment);
  }),
);
