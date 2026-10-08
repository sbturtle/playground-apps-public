export const formatWon = (amount: number) => `${amount.toLocaleString('ko-KR')}원`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });

export const STATUS_LABEL: Record<string, string> = {
  PAID:       '결제 완료',
  SHIPPED:    '발송',
  CANCELLED:  '취소',
  READY:      '발송 준비',
  IN_TRANSIT: '배송 중',
  DELIVERED:  '배송 완요',
};
