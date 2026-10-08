import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type Shipment } from '../api';
import { STATUS_LABEL } from '../format';

export function ShipmentTracking() {
  const { shipmentId } = useParams();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.shipment(Number(shipmentId)).then(setShipment).catch((err) => setError(err.message));
  }, [shipmentId]);

  if (error) return <p role="alert">{error}</p>;
  if (!shipment) return <p>불러오는 중…</p>;

  return (
    <section>
      <h1>배송 조회</h1>
      <p>
        {shipment.carrier} {shipment.trackingNo}
      </p>
      <p>{STATUS_LABEL[shipment.status]}</p>
    </section>
  );
}
