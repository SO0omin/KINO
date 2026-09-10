<div align="center">

<img src="frontend/public/kino.png" alt="KINO" width="120" />

# KINO — 영화 예매 서비스

실시간 좌석 선점부터 결제·티켓 발급까지, 영화관 예매의 전 과정을 구현한 풀스택 프로젝트

<img src="https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white" />
<img src="https://img.shields.io/badge/Spring_Boot-4.0.1-6DB33F?logo=springboot&logoColor=white" />
<img src="https://img.shields.io/badge/MySQL-8.3-4479A1?logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />

</div>

---

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [핵심 기능](#핵심-기능)
- [기술 스택](#기술-스택)
- [시스템 아키텍처](#시스템-아키텍처)
- [ERD / 도메인 모델](#erd--도메인-모델)
- [핵심 구현 포인트](#핵심-구현-포인트)
- [시작하기](#시작하기)
- [환경 변수](#환경-변수)
- [API 개요](#api-개요)
- [프로젝트 구조](#프로젝트-구조)
- [배포](#배포)
- [팀 & 역할 분담](#팀--역할-분담)

---

## 프로젝트 소개

KINO는 멀티플렉스 영화관의 온라인 예매 시스템을 재현한 웹 서비스입니다.
영화 탐색 → 상영 시간표 조회 → **실시간 좌석 선점** → 쿠폰/포인트 할인 → **PG 결제** → 티켓(QR) 발급 → 마이페이지 관리까지, 실제 서비스에 필요한 흐름을 끝까지 이어 붙이는 것을 목표로 했습니다.

| | |
|---|---|
| **개발 기간** | 2026.01 ~ 2026.03 |
| **인원** | 4명 (백엔드 · 프론트엔드 겸업) |
| **저장소** | [github.com/SO0omin/KINO](https://github.com/SO0omin/KINO) |

> 학습용 프로젝트입니다. 결제는 토스페이먼츠 **테스트 키**로 동작하며 실제 결제가 발생하지 않습니다.

---

## 핵심 기능

### 예매
- 지역 / 극장 / 영화 / 날짜 **다중 조건 교차 필터링** — 한쪽을 고르면 반대쪽의 선택 가능 목록이 자동으로 좁혀집니다
- 특별관(IMAX · 4D) 전용 탭
- 상영관 좌석 배치도를 `posX/posY` 좌표 기반으로 렌더링, 입·출구 아이콘까지 표현
- **커플석 / 2인 단위 좌석 규칙**: 인접 좌석을 묶어 그룹으로 판정하고, 단독 선택이 불가능한 자리를 사전에 차단
- **WebSocket(STOMP) 실시간 좌석 동기화** — 다른 사용자가 선점한 좌석이 즉시 반영
- 좌석 선점 **10분 타이머**, 만료 시 스케줄러가 자동 해제

### 인증
- 일반 회원가입 / 로그인 (BCrypt + JWT)
- **소셜 로그인 3종** — 카카오 · 네이버 · 구글 (미가입자는 정보 프리필된 가입 폼으로 유도)
- **비회원 예매** — 이름 + 전화번호 + 4자리 비밀번호로 별도 토큰 발급
- 아이디 찾기(마스킹) / 이메일 링크 기반 비밀번호 재설정(30분 만료)
- 마이페이지에서 소셜 계정 연동·해제

### 결제
- 토스페이먼츠 SDK 연동 (준비 → 결제창 → 승인 2단계)
- 쿠폰 · 포인트 복합 할인, 결제 금액 **서버 재검증**
- **멱등성 보장** + 승인 후 DB 실패 시 **PG 전액취소 보상 트랜잭션**
- 결제 완료 시 예매번호(`KINO-260910-000123`) 발급 · 좌석 확정 · 5% 포인트 적립 · 완료 메일 발송
- 좌석별 티켓 코드(UUID) 발급 → 관리자 QR 검표 API

### 마이페이지
예매 내역 / 취소 · 관람 기록(무비스토리) · 리뷰 작성 · 쿠폰함 · 영화관람권 등록 · 멤버십 카드 · 포인트 내역 및 등급 · 프로필/비밀번호 관리 · SMS 인증 기반 포인트 비밀번호 설정

---

## 기술 스택

### Backend
| 분류 | 사용 기술 |
|---|---|
| Core | Java 17, Spring Boot 4.0.1, Gradle 9.2.1 |
| Data | Spring Data JPA (Hibernate), MySQL 8.3 |
| Security | Spring Security, JWT (jjwt 0.11.5), BCrypt |
| 실시간 | Spring WebSocket, STOMP, SockJS |
| 문서화 | springdoc-openapi (Swagger UI) |
| 외부 연동 | 토스페이먼츠, 카카오/네이버/구글 OAuth2, JavaMail, Solapi(SMS) |

### Frontend
| 분류 | 사용 기술 |
|---|---|
| Core | React 19, TypeScript 5.9, Vite 7 |
| 라우팅/상태 | react-router-dom 7, Context API |
| 스타일 | Tailwind CSS v4, shadcn/ui (Radix), styled-components, framer-motion |
| 통신 | axios, @stomp/stompjs + sockjs-client |
| 기타 | @tosspayments/tosspayments-sdk, recharts, react-hook-form, lucide-react |

### Infra
Docker · Docker Compose · GitHub Actions · Docker Hub · AWS EC2 · AWS RDS

---

## 시스템 아키텍처

```
                    ┌──────────────────────────────────────┐
   Browser ────────▶│  React (Vite)          :5173         │
                    │  ├─ REST   : axios                   │
                    │  └─ 실시간 : STOMP over SockJS        │
                    └───────────────┬──────────────────────┘
                                    │
                    ┌───────────────▼──────────────────────┐
                    │  Spring Boot           :8080         │
                    │                                      │
                    │  JwtFilter → SecurityFilterChain     │
                    │       │                              │
                    │  Controller ── Service ── Repository │
                    │                   │                  │
                    │       ┌───────────┴───────────┐      │
                    │  SimpMessagingTemplate    Scheduler  │
                    │  (/topic/screening/{id})  (1분 주기)  │
                    └──────┬──────────────────┬────────────┘
                           │                  │
                    ┌──────▼──────┐   ┌───────▼────────────┐
                    │  MySQL      │   │  External APIs     │
                    │  kino_db    │   │  Toss · OAuth2     │
                    └─────────────┘   │  SMTP · Solapi     │
                                      └────────────────────┘
```

**CI/CD** — `main` push → GitHub Actions가 이미지 빌드 → Docker Hub push → EC2 SSH 접속 후 `docker-compose up -d`

---

## ERD / 도메인 모델

```
Region ──< Theater ──< Screen ──< Seat
                          │
                          └──< Screening ──< ScreeningSeat ──> Reservation
                                   │                               │
                                   └──> Movie                      ├──< ReservationTicket
                                          ├──< MovieStill          └──1 Payment
                                          ├──< Review
                                          └──< MovieLike

Member ──< SocialAccount / MemberPoint / MemberCoupon / MembershipCard
       ──< VoucherCode / PasswordResetToken / PointPasswordVerification

Guest   (비회원 예매 — name + tel 유니크)
Coupon ──< MemberCoupon
TicketPrice  (screenType × priceType × screeningType 조합별 단가)
```

### 주요 상태 값

| Enum | 값 |
|---|---|
| `SeatStatus` | `AVAILABLE` → `HELD` → `RESERVED` |
| `ReservationStatus` | `PENDING` → `PAID` / `CANCELED` |
| `PaymentStatus` | `READY` → `PAID` / `FAILED` / `CANCELLED` |
| `MemberCouponStatus` | `AVAILABLE` → `HELD` → `USED` |
| `PriceType` | `ADULT` · `YOUTH` · `SENIOR` · `SPECIAL` |
| `ScreeningType` | `MORNING`(~10시) · `NORMAL` · `NIGHT`(22시~) |

---

## 핵심 구현 포인트

### 1. 좌석 동시 선점 제어 — 비관적 락

같은 좌석을 동시에 누른 두 사용자 중 한 명만 성공해야 합니다. 트랜잭션 격리만으로는 read-then-write 사이에 끼어드는 요청을 막지 못하므로, 좌석 조회 시점에 **행 단위 배타 락**을 겁니다.

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT ss FROM ScreeningSeat ss " +
       "WHERE ss.screening.id = :screeningId AND ss.seat.id IN :seatIds")
List<ScreeningSeat> findAllByScreeningIdAndSeatIdsWithLock(...);
```

락을 잡은 뒤 도메인 메서드 `ScreeningSeat.hold()`가 상태를 재검증하고, 이미 선점된 좌석이면 예외를 던져 트랜잭션 전체를 되돌립니다. 상태 전이 규칙을 서비스가 아닌 **엔티티 안에** 둬서 우회 경로를 없앴습니다.

### 2. 좌석 홀드 만료 — 스케줄러

결제까지 가지 않고 이탈한 사용자의 좌석이 영구 점유되지 않도록, 선점 시 `holdExpiresAt = now + 10분`을 기록하고 1분 주기 스케줄러가 만료분을 일괄 정리합니다. 좌석 해제 · 예약 `CANCELED` · 결제 `FAILED` · 티켓 삭제를 한 트랜잭션에서 처리합니다.

### 3. 결제 안전장치

| 위험 | 대응 |
|---|---|
| 클라이언트 금액 조작 | 승인 전 서버가 계산한 `finalAmount`와 요청 금액 비교 |
| 승인 요청 중복 | `merchantUid` 비관적 락 + 이미 `PAID`면 기존 결과 반환 |
| PG 승인 성공 후 DB 실패 | `catch` 블록에서 **토스 전액취소 API 호출**(보상 트랜잭션) |
| 쿠폰 중복 사용 | 결제 준비 시 `HELD` 선점, 실패·이탈 시 `AVAILABLE` 복구 |
| 포인트 초과 사용 | 잔액·100원 단위·결제 예정액 상한 3중 검증 |

### 4. 회원 / 비회원 이원 인증

`JwtFilter`가 토큰의 `isGuest` 클레임으로 분기해, 회원은 `memberId(Long)`를 · 비회원은 `"GUEST_{id}"` 문자열을 `SecurityContext`의 Principal로 넣습니다. 컨트롤러는 `@AuthenticationPrincipal` 하나로 두 주체를 모두 받습니다.

### 5. 회원 탈퇴 — 소프트 삭제 + 익명화

예매·결제 이력은 정산상 남아야 하므로 하드 삭제 대신, `Member.withdrawMember()`가 식별 정보를 UUID로 치환하고 `isDeleted = true`로 전환합니다. 엔티티에 `@SQLRestriction("is_deleted = false")`를 걸어 모든 조회에서 자동 제외됩니다.

---

## 시작하기

### 사전 요구사항

| | 버전 |
|---|---|
| JDK | 17 이상 |
| Node.js | 20 이상 |
| MySQL | 8.0 이상 |

### 1. 저장소 클론

```bash
git clone https://github.com/SO0omin/KINO.git
```

### 2. 데이터베이스 준비

```bash
mysql -u root -p -e "CREATE DATABASE kino_db DEFAULT CHARACTER SET utf8mb4;"
```

`spring.jpa.hibernate.ddl-auto=update` 설정으로 첫 실행 시 테이블이 자동 생성됩니다. 이후 시드 데이터를 넣습니다.

```bash
mysql -u root -p kino_db < frontend/common_sql.sql
mysql -u root -p kino_db < backend/src/main/resources/sql/coupons_kino_partner_seed.sql
```

### 3. 백엔드 실행

```bash
cd backend && ./gradlew bootRun
```

→ http://localhost:8080 · Swagger UI: http://localhost:8080/swagger-ui/index.html

### 4. 프론트엔드 실행

```bash
cd frontend && npm install && npm run dev
```

→ http://localhost:5173

---

## 환경 변수

### `backend` — 환경 변수 또는 `application.properties`

| 키 | 설명 |
|---|---|
| `RDS_HOST` · `RDS_USERNAME` · `RDS_PASSWORD` | DB 접속 정보 |
| `JWT_SECRET` | JWT 서명 키 (**32바이트 이상**) |
| `TOSS_SECRET_KEY` | 토스페이먼츠 시크릿 키 |
| `KAKAO_REST_API_KEY` · `KAKAO_CLIENT_SECRET` · `KAKAO_REDIRECT_URI` | 카카오 OAuth |
| `NAVER_CLIENT_ID` · `NAVER_CLIENT_SECRET` | 네이버 OAuth |
| `GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET` · `GOOGLE_REDIRECT_URI` | 구글 OAuth |
| `SPRING_MAIL_USERNAME` · `SPRING_MAIL_PASSWORD` | SMTP (Gmail 앱 비밀번호) |
| `SOLAPI_API_KEY` · `SOLAPI_API_SECRET` · `SOLAPI_FROM_NUMBER` | SMS 발송 |
| `SMS_MOCK_ENABLED` | `true`면 실제 발송 없이 `SMS_MOCK_AUTH_CODE` 사용 |
| `TOSS_CANCEL_MOCK_ENABLED` | `true`면 취소 시 PG 호출 생략, DB만 처리 |

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_TOSS_CLIENT_KEY=test_ck_xxxxxxxx

VITE_KAKAO_REST_API_KEY=
VITE_KAKAO_REDIRECT_URI=http://localhost:5173/oauth/callback/kakao
VITE_NAVER_CLIENT_ID=
VITE_NAVER_REDIRECT_URI=http://localhost:5173/oauth/callback/naver
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback/google
```

> ⚠️ 실제 키가 담긴 `.env` 및 `application.properties`는 절대 커밋하지 마세요.

---

## API 개요

전체 명세는 서버 기동 후 **Swagger UI**에서 확인할 수 있습니다.

| 영역 | 엔드포인트 | 인증 |
|---|---|---|
| 인증 | `POST /api/auth/signup` · `login` · `guest-signup` · `guest-login` | 공개 |
| 소셜 | `POST /api/auth/kakao` · `naver` · `google` | 공개 |
| 계정 찾기 | `POST /api/auth/find-id` · `reset-password-request` · `reset-password` | 공개 |
| 메인 | `GET /api/main` | 공개 |
| 영화 | `GET /api/movies` · `/api/movies/{id}/detail` | 공개 |
| 극장 | `GET /api/theaters` · `/api/theaters/regions` | 공개 |
| 시간표 | `GET /api/timetable/theater` · `/api/timetable/movie` | 공개 |
| 예매 필터 | `GET /api/ticketing/theaters` · `movies` · `screenings` · `available-*` | 공개 |
| 좌석 | `GET /api/screenings/{id}/seats` | 공개 |
| 예약 | `POST /api/reservations/hold` · `GET /api/reservations/verify/{no}` | 필요 |
| 결제 | `GET /api/payments/{id}` · `POST /api/payments/prepare` · `confirm` | 필요 |
| 마이페이지 | `/api/mypage/**` (예매·쿠폰·포인트·프로필·관람권·멤버십) | 필요 |
| 쿠폰 | `/api/coupons/**` (등록·다운로드·조회) | 필요 |
| 좋아요 | `/api/movies/{id}/likes` | 필요 |
| 검표 | `POST /api/admin/tickets/verify-and-use` | 관리자 |

### WebSocket

| | |
|---|---|
| 엔드포인트 | `/ws-seat` (좌석 선택 페이지), `/ws-kino` (예매 모달) — SockJS |
| 구독 | `/topic/screening/{screeningId}` |
| 발행 | `/app/...` (`setApplicationDestinationPrefixes`) |

---

## 프로젝트 구조

```
KinoProject/
├── backend/
│   └── src/main/java/com/cinema/kino/
│       ├── config/       # Security · JWT Filter · WebSocket · Swagger
│       ├── controller/   # REST 엔드포인트 (15)
│       ├── service/      # 비즈니스 로직 (22)
│       ├── repository/   # JPA Repository (23)
│       ├── entity/       # 도메인 엔티티 (24) + enums
│       ├── dto/          # 요청·응답 DTO (38)
│       ├── scheduler/    # 예약 만료 정리 · 예매율 집계
│       └── util/         # JwtUtil
│
├── frontend/
│   └── src/
│       ├── pages/        # 라우트 단위 화면
│       ├── hooks/        # 화면별 상태·로직 (useSeatBooking, usePayment ...)
│       ├── services/     # WebSocket 등 외부 통신 래퍼
│       ├── api/          # axios 호출 함수
│       ├── mappers/      # 서버 DTO → 화면용 ViewModel 변환
│       ├── types/        # dtos(서버 계약) · models(화면 모델)
│       ├── components/   # common · ui(shadcn) · 도메인별 컴포넌트
│       ├── contexts/     # AuthContext
│       └── style/        # Tailwind · styled-components
│
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

**프론트엔드 계층 원칙** — `page`는 그리기만, `hook`이 상태와 규칙을, `api`가 통신을, `mapper`가 서버 DTO를 화면 모델로 번역합니다. 서버 응답 형태가 바뀌어도 `dto` + `mapper`만 손보면 화면은 그대로입니다.

**백엔드 CQRS 분리** — 좌석 도메인은 조회(`SeatService`, `readOnly`)와 변경(`SeatCommandService`, 비관적 락)을 분리해, 조회 성능과 동시성 제어를 각각 최적화했습니다.

---

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동 배포합니다.

```
push(main) → 이미지 빌드 → Docker Hub push → EC2 SSH → .env 생성 → compose 재기동
```

필요한 GitHub Secrets: `DOCKERHUB_USERNAME` · `DOCKERHUB_TOKEN` · `EC2_HOST` · `EC2_KEY` · `RDS_HOST` · `RDS_USERNAME` · `RDS_PASSWORD`

---

## 팀 & 역할 분담

| 담당 | 영역 |
|---|---|
| **정수민** ([@SO0omin](https://github.com/SO0omin)) | 좌석 지정 예매(실시간 동기화 · 동시성 제어 · 홀드 만료) · 인증/소셜로그인/비회원 · 극장 및 상영시간표 · 공통 인프라(HTTP 클라이언트 · 모달 · Docker/CI) |
| **함한솔** ([@h-ns-l0](https://github.com/h-ns-l0)) | 결제(토스페이먼츠 연동 · 쿠폰/포인트) · 마이페이지 전 섹션 · 쿠폰 도메인 |
| **류루지** ([@ryurujxx](https://github.com/ryurujxx)) | 예매 페이지(다중 필터 · 좌석 미리보기) · 메인 페이지 · 영화 목록/상세 · 리뷰 |

---

<div align="center">
<sub>🎬 KINO — 2026</sub>
</div>
