// 재고 서비스 API 클라이언트(스텁).
// 실제 재고 서비스는 창고 시스템을 거치기 때문에 응답까지 2~5초가 걸립니다.
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface StockLine {
  productName: string;
  quantity: number;
}

/** 취소·반품된 수량만큼 재고를 되돌립니다. */
export async function restoreStock(lines: StockLine[]): Promise<void> {
  await sleep(2000 + Math.random() * 3000);
  console.log('[inventory] restored', lines.map((l) => `${l.productName} x${l.quantity}`).join(', '));
}
