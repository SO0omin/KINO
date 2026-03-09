-- ============================================
-- Coupon Source Migration + Seed
-- - source_type: KINO / PARTNER
-- - coupon_kind: 매표 / 매점 / 포인트 / 포토카드 / 기타
-- - 각 source_type별로 종류당 2개씩 생성 (총 20개)
-- ============================================

-- 0) 기존 값 마이그레이션 (MEGABOX -> KINO)
UPDATE coupons
SET source_type = 'KINO'
WHERE source_type = 'MEGABOX';

-- 1) KINO 쿠폰 (종류별 2개)
INSERT INTO coupons
(
  name, discount_type, discount_value, min_price, valid_days, code,
  source_type, coupon_kind, downloadable, is_active, download_start_at, download_end_at
)
VALUES
('키노 매표 2,000원 할인', 'FIXED', 2000, 10000, 30, 'KINO-TICKET-2000-A', 'KINO', '매표', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('키노 매표 10% 할인',    'RATE',  10,   8000, 30, 'KINO-TICKET-10P-B', 'KINO', '매표', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('키노 매점 3,000원 할인', 'FIXED', 3000, 12000, 30, 'KINO-STORE-3000-A', 'KINO', '매점', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('키노 매점 15% 할인',    'RATE',  15,   9000, 30, 'KINO-STORE-15P-B', 'KINO', '매점', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('키노 포인트 1,000P',    'FIXED', 1000,  0,    30, 'KINO-POINT-1000-A', 'KINO', '포인트', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('키노 포인트 2,000P',    'FIXED', 2000,  0,    30, 'KINO-POINT-2000-B', 'KINO', '포인트', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('키노 포토카드 30% 할인','RATE',  30,   0,    30, 'KINO-PHOTO-30P-A', 'KINO', '포토카드', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('키노 포토카드 50% 할인','RATE',  50,   0,    30, 'KINO-PHOTO-50P-B', 'KINO', '포토카드', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('키노 기타 1,500원 할인','FIXED', 1500, 7000, 30, 'KINO-ETC-1500-A', 'KINO', '기타', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('키노 기타 5% 할인',     'RATE',   5,   5000, 30, 'KINO-ETC-5P-B', 'KINO', '기타', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY))
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  discount_type = VALUES(discount_type),
  discount_value = VALUES(discount_value),
  min_price = VALUES(min_price),
  valid_days = VALUES(valid_days),
  source_type = VALUES(source_type),
  coupon_kind = VALUES(coupon_kind),
  downloadable = VALUES(downloadable),
  is_active = VALUES(is_active),
  download_start_at = VALUES(download_start_at),
  download_end_at = VALUES(download_end_at);

-- 2) PARTNER 쿠폰 (종류별 2개)
INSERT INTO coupons
(
  name, discount_type, discount_value, min_price, valid_days, code,
  source_type, coupon_kind, downloadable, is_active, download_start_at, download_end_at
)
VALUES
('제휴 매표 2,500원 할인', 'FIXED', 2500, 10000, 30, 'PARTNER-TICKET-2500-A', 'PARTNER', '매표', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('제휴 매표 12% 할인',    'RATE',  12,   8000, 30, 'PARTNER-TICKET-12P-B', 'PARTNER', '매표', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('제휴 매점 2,000원 할인', 'FIXED', 2000, 10000, 30, 'PARTNER-STORE-2000-A', 'PARTNER', '매점', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('제휴 매점 20% 할인',    'RATE',  20,   9000, 30, 'PARTNER-STORE-20P-B', 'PARTNER', '매점', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('제휴 포인트 800P',      'FIXED', 800,   0,    30, 'PARTNER-POINT-800-A', 'PARTNER', '포인트', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('제휴 포인트 1500P',     'FIXED', 1500,  0,    30, 'PARTNER-POINT-1500-B', 'PARTNER', '포인트', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('제휴 포토카드 20% 할인', 'RATE', 20,   0,    30, 'PARTNER-PHOTO-20P-A', 'PARTNER', '포토카드', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('제휴 포토카드 40% 할인', 'RATE', 40,   0,    30, 'PARTNER-PHOTO-40P-B', 'PARTNER', '포토카드', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('제휴 기타 1,000원 할인', 'FIXED', 1000, 7000, 30, 'PARTNER-ETC-1000-A', 'PARTNER', '기타', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('제휴 기타 7% 할인',      'RATE',   7,   5000, 30, 'PARTNER-ETC-7P-B', 'PARTNER', '기타', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY))
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  discount_type = VALUES(discount_type),
  discount_value = VALUES(discount_value),
  min_price = VALUES(min_price),
  valid_days = VALUES(valid_days),
  source_type = VALUES(source_type),
  coupon_kind = VALUES(coupon_kind),
  downloadable = VALUES(downloadable),
  is_active = VALUES(is_active),
  download_start_at = VALUES(download_start_at),
  download_end_at = VALUES(download_end_at);

-- 3) 확인용 조회
-- SELECT id, code, source_type, coupon_kind, downloadable, is_active
-- FROM coupons
-- ORDER BY id DESC;
