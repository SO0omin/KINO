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

    @PostMapping("/download-all")
    public ResponseEntity<CouponDTO.DownloadAllResponse> downloadAll(@RequestBody CouponDTO.DownloadAllRequest request) {
        if (request.getMemberId() == null) {
            throw new IllegalArgumentException("memberId가 필요합니다.");
        }
        return ResponseEntity.ok(couponService.downloadAll(request.getMemberId(), request.getSourceType()));
    }

    @GetMapping("/downloadables")
    public ResponseEntity<CouponDTO.DownloadableCouponsResponse> downloadables(
            @RequestParam Long memberId,
            @RequestParam(required = false) String sourceType
    ) {
        return ResponseEntity.ok(couponService.getDownloadables(memberId, sourceType));
    }

    @PostMapping("/download-selected")
    public ResponseEntity<CouponDTO.DownloadSelectedResponse> downloadSelected(
            @RequestBody CouponDTO.DownloadSelectedRequest request
    ) {
        if (request.getMemberId() == null) {
            throw new IllegalArgumentException("memberId가 필요합니다.");
        }
        return ResponseEntity.ok(
                couponService.downloadSelected(request.getMemberId(), request.getSourceType(), request.getCouponIds())
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<CouponDTO.MyCouponResponse>> myCoupons(
            @RequestParam Long memberId,
            @RequestParam(defaultValue = "false") boolean includeAll
    ) {
        return ResponseEntity.ok(
                includeAll
                        ? couponService.getMyCoupons(memberId)
                        : couponService.getMyAvailableCoupons(memberId)
        );
    }
}
