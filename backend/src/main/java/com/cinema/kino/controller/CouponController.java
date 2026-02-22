package com.cinema.kino.controller;

import com.cinema.kino.dto.CouponDTO;
import com.cinema.kino.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "*")

public class CouponController {
    private final CouponService couponService;

    @PostMapping("/redeem")
    public ResponseEntity<CouponDTO.RedeemResponse> redeem(@RequestBody CouponDTO.RedeemRequest request) {
        if (request.getMemberId() == null) {
            throw new IllegalArgumentException("memberId가 필요합니다.");
        }
        return ResponseEntity.ok(couponService.redeem(request.getCode(), request.getMemberId()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<CouponDTO.MyCouponResponse>> myCoupons(@RequestParam Long memberId) {
        return ResponseEntity.ok(couponService.getMyAvailableCoupons(memberId));
    }
}
