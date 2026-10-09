import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type Shipment } from '../api';
import { STATUS_LABEL, formatDate } from '../format';

export function ShipmentTracking() {
  const { shipmentId } = useParams();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [checkedAt, setCheckedAt] = useState<string | null>(null)

  useEffect(() => {
    api.shipment(Number(shipmentId)).then(setShipment).catch((err) => setError(err.message));
  }, [shipmentId]);

  const refresh = async () => {
    setNotice('택배사에 확인하는 중…');
    try {
      setShipment(await api.refreshShipment(Number(shipmentId)));
      setCheckedAt(new Date().toISOString());
      setNotice('');
    } catch (err) {
      setNotice(`배송 상태를 가져오지 못햇습니다. ${(err as Error).message}`);
    }
  };

  if (error) return <p role="alert">{error}</p>;
  if (!shipment) return <p>불러오는 중…</p>;

  return (
    <section>
      <h1>배송 조회</h1>
      <p>
        {shipment.carrier} {shipment.trackingNo}
      </p>
      <p>{STATUS_LABEL[shipment.status]}</p>
      {checkedAt && <p>마지막 확인 {formatDate(checkedAt)}</p>}
      {shipment.status !== 'DELIVERED' && <button onClick={refresh}>새로고침</button>}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
