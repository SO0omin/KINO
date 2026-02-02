# 🚀 결제 시스템 설정 가이드

백엔드와 완전히 연동된 결제 시스템이 구현되었습니다!

---

## 📋 필수 설정

### 1. 설정 파일 수정

#### 백엔드 API URL 설정
`/api/paymentApi.ts` 파일의 상단에서 백엔드 URL을 수정하세요:

```typescript
// 로컬 개발
const API_BASE_URL = 'http://localhost:8080';

// 프로덕션
// const API_BASE_URL = 'https://your-api.com';
```

#### 토스페이먼츠 클라이언트 키 설정
`/pages/PaymentPage.tsx` 파일의 상단에서 키를 수정하세요:

```typescript
// 테스트 키 (실제 결제 안됨)
const TOSS_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

// 프로덕션 (실제 결제용)
// const TOSS_CLIENT_KEY = 'live_ck_YOUR_REAL_KEY';
```

### 2. 패키지 설치

```bash
npm install react-router-dom
# 또는
yarn add react-router-dom
```

---

## 🔄 결제 플로우

### 1단계: 결제 준비 (prepare)
```
사용자 "결제" 버튼 클릭
  ↓
POST /api/payments/prepare
  - screeningId: 1
  - tickets: [{ seatId: 101, priceType: "ADULT" }]
  - memberId: null
  - totalPrice: 14000
  ↓
응답: { reservationId, orderId, orderName, calculatedPrice }
```

### 2단계: 토스페이먼츠 결제창
```
TossPayments SDK 호출
  - 사용자가 카드 정보 입력
  - 성공 시 → /payment/success?paymentKey=xxx&orderId=yyy&amount=14000
  - 실패 시 → /payment/fail?code=xxx&message=yyy
```

### 3단계: 결제 승인 (confirm)
```
PaymentSuccessPage에서 자동 호출
  ↓
POST /api/payments/confirm
  - paymentKey: "xxx"
  - orderId: "15-a1b2c3d4"
  - amount: 14000
  ↓
응답: paymentId (최종 결제 ID)
```

---

## 📁 파일 구조

```
/api
  └─ paymentApi.ts          # API 호출 함수

/types
  ├─ dto/payment.dto.ts     # 백엔드 DTO 타입 정의
  ├─ model/payment.ts       # 프론트엔드 데이터 모델
  └─ toss-payments.d.ts     # 토스페이먼츠 SDK 타입

/hooks
  └─ usePayment.ts          # 결제 로직 훅

/pages
  ├─ PaymentPage.tsx        # 결제 페이지 (메인)
  ├─ PaymentSuccessPage.tsx # 결제 성공 페이지
  └─ PaymentFailPage.tsx    # 결제 실패 페이지

/components/payment
  ├─ BookingInfo.tsx        # 예매 정보 표시
  ├─ DiscountSection.tsx    # 할인 정보 (쿠폰/포인트)
  ├─ PaymentMethodSection.tsx # 결제수단 선택
  └─ PaymentSummary.tsx     # 결제 금액 요약 + 결제 버튼
```

---

## ⚙️ 백엔드 연동 체크리스트

### ✅ 구현 완료
- [x] 백엔드 DTO 타입 정의
- [x] API 호출 함수 (prepare, confirm)
- [x] 토스페이먼츠 SDK 연동
- [x] 2단계 결제 플로우 구현
- [x] 결제 성공/실패 페이지
- [x] 좌석 정보 데이터 구조
- [x] 로딩/에러 처리

### 🔲 추후 작업 (백엔드 추가 시)
- [ ] 쿠폰 API 연동 (할인 금액 계산)
- [ ] 포인트 API 연동
- [ ] 회원 로그인 정보 연동
- [ ] 이전 페이지(좌석 선택)에서 데이터 전달

---

## 🧪 테스트 방법

### 1. 로컬 테스트
```bash
# 백엔드 서버 실행 (포트 8080)
cd backend
./mvnw spring-boot:run

# 프론트엔드 서버 실행
npm start
```

### 2. 테스트 시나리오
1. `/payment` 접속
2. 결제수단 선택 (예: 신용카드)
3. 약관 동의 체크
4. "결제" 버튼 클릭
5. 토스 테스트 결제창에서 카드 정보 입력
   - 카드번호: 1111-2222-3333-4444 (테스트용)
6. 결제 완료 → 성공 페이지 확인

---

## 🔧 트러블슈팅

### CORS 오류
백엔드 `@CrossOrigin` 설정 확인:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

### 토스페이먼츠 SDK 로딩 오류
- 브라우저 콘솔에서 `window.TossPayments` 확인
- 네트워크 탭에서 스크립트 로드 확인

### 데이터 타입 불일치
- 백엔드: `Long` → 프론트: `number`
- 백엔드: `Integer` → 프론트: `number`
- 백엔드: `PriceType` enum → 프론트: `PriceType` enum (동일)

---

## 📝 추가 개선 사항

1. **데이터 전달 방식**
   - 현재: PaymentPage에 하드코딩된 mock 데이터
   - 개선: 좌석 선택 페이지 → PaymentPage로 state 전달
   - 방법: `useLocation`, `navigate(path, { state: {...} })`

2. **할인 기능**
   - 백엔드에 쿠폰/포인트 API 추가
   - DiscountSection에서 선택한 할인 적용
   - prepare API에 discount 필드 추가

3. **보안**
   - 토스 클라이언트 키는 노출되어도 안전 (클라이언트용)
   - 백엔드 SecretKey는 절대 프론트에 노출 금지!

---

## 🎯 다음 단계

1. 좌석 선택 페이지 완성
2. 좌석 데이터 → 결제 페이지 전달
3. 회원 로그인 시스템 연동
4. 쿠폰/포인트 API 개발
5. 예매 내역 조회 페이지

---

**완료! 이제 백엔드와 완전히 연동된 결제 시스템이 동작합니다! 🎉**