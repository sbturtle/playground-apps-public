# web-shop

주문 조회·취소, 배송 조회, 알림을 제공하는 작은 쇼핑몰 예제입니다.

- `server/`: Express API (메모리 DB, 실행 시 시드 데이터 생성)
- `client/`: React 화면 (`/api`를 서버로 프록시)

```bash
npm install
npm run server   # http://localhost:4000
npm run client
```

로그인은 데모용 토큰을 씁니다. 브라우저 localStorage의 `token`에 `user-1`(고객) 또는 `user-9`(관리자)를 넣으면 됩니다.

## 정책

- 고객은 본인 주문·배송·알림만 볼 수 있고, 관리자는 모든 주문을 볼 수 있습니다.
- 주문 취소는 발송 전(`PAID`)에만 가능하며, 결제 금액은 적립금으로 환불됩니다.
- 알림은 최신순으로 20개씩 나눠서 보여 줌니다. 페이지 번호는 1부터 시작합니다.
