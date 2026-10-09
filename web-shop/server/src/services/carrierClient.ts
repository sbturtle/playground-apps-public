// 택배사 배송 조회 API 클라이언트(스텁).
// 실제 택배사 API는 응답까지 1~3초가 걸리고, 혼잡한 시간에는 요청 일부가 실패합니다.
import type { ShipmentStatus } from '../db.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class CarrierError extends Error {}

/** 택배사 배송 단계 코드: 접수 → 상품 인수 → 이동 중 → 배송 출발 → 배송 완료 */
const STEPS = ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const STATUS_BY_CODE: Record<string, ShipmentStatus> = {
  ACCEPTED: 'READY',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
};

// 스텁: 같은 송장을 조회할 때마다 배송이 한 단계씩 진행된 것처럼 응답합니다.
const progress = new Map<string, number>();

/** 송장의 현재 배송 상태를 택배사에 조회합니다. */
export async function fetchCarrierStatus(carrier: string, trackingNo: string): Promise<ShipmentStatus> {
  await sleep(1000 + Math.random() * 2000);
  if (Math.random() < 0.15) {
    throw new CarrierError(`${carrier} 응답이 지원되고 있습니다. 잠시 뒤 다시 시도해 주세요.`);
  }
  const step = Math.min((progress.get(trackingNo) ?? -1) + 1, STEPS.length - 1);
  progress.set(trackingNo, step);
  return STATUS_BY_CODE[STEPS[step]];
}
