import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";

import { useSeatBooking } from "../hooks/useSeatBooking";
import { formatDate, formatTime } from '../utils/dateFormatter';
import ratingImages from '../utils/getRatingImage';
import type { SeatViewModel } from '../types/models/SeatBookingViewModel';

// 스타일 및 컴포넌트
import { StyledSeat } from '../Seat.styles';
import { SeatLegend } from "../components/SeatLegend";
import { CommonModal } from "../components/CommonModal";

// 이미지 에셋
import screenImg from "../assets/screen.png";

//값 받을 때 사용
import { useLocation } from "react-router-dom";

const SeatBooking = () => {
  const location = useLocation();
  const { screeningId } = location.state;
  const {
    realSeats,
    entranceSeats,
    screeningInfo,
    selectedSeats,
    personnel,
    totalPersonnelCount,
    isAlertOpen,
    alertMessage,
    showCoupleNotice,
    totalPrice,
    setIsAlertOpen,
    setShowCoupleNotice,
    handleCountChange,
    toggleSeat,
    resetSelection,
    getPartnerNumber,
    handleReservation
  } = useSeatBooking(screeningId);

  const [hoveredSeatId, setHoveredSeatId] = useState<number | null>(null);

  

  return (
    // 전체 배경 (종이 질감)
    <div className="bg-[#f4f1ea] min-h-screen text-black p-10 paper-texture font-sans">
      <div className="max-w-[1280px] mx-auto">
        
        {/* 상단 타이틀 */}
        <div className="flex items-center gap-4 mb-8">
          <h1 className="font-serif italic text-4xl uppercase tracking-tighter font-black">Seat Selection</h1>
          <div className="flex-1 h-1.5 border-y border-black"></div>
        </div>

        {/* 좌/우 레이아웃 */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* ===================== [좌측] 인원 및 좌석 선택 영역 ===================== */}
          <div className="flex-[2] flex flex-col gap-8 w-full">
            
            {/* 1. 관람 인원 선택 박스 */}
            <div className="bg-white border-[6px] border-black shadow-[8px_8px_0_0_#000] p-6 relative">
              <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-4">
                <span className="font-serif italic text-2xl font-bold uppercase tracking-widest">Audience</span>
                <button onClick={resetSelection} className="font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-red-700 transition-colors">
                  <FontAwesomeIcon icon={faArrowsRotate} /> Reset
                </button>
              </div>
              
              <div className="flex flex-wrap gap-6 justify-between px-2">
                {(['adult', 'youth', 'senior', 'special'] as const).map((type) => (
                  <div key={type} className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold uppercase tracking-widest w-16 text-black/70">
                      {type === 'adult' ? '성인' : type === 'youth' ? '청소년' : type === 'senior' ? '경로' : '우대'}
                    </span>
                    <div className="flex items-center border-2 border-black bg-[#f4f1ea] shadow-[2px_2px_0_0_#000]">
                      <button onClick={() => handleCountChange(type, -1)} className="w-8 h-8 flex items-center justify-center font-bold font-mono hover:bg-black hover:text-white transition-colors">-</button>
                      <span className="w-10 text-center font-mono font-bold bg-white border-x-2 border-black h-8 flex items-center justify-center">{personnel[type]}</span>
                      <button onClick={() => handleCountChange(type, 1)} className="w-8 h-8 flex items-center justify-center font-bold font-mono hover:bg-black hover:text-white transition-colors">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 스크린 및 좌석 배치도 */}
            <div className="bg-white border-[6px] border-black shadow-[12px_12px_0_0_#000] relative w-full h-[600px] overflow-hidden flex flex-col items-center">
              
              {/* 스크린 이미지 */}
              <div className="w-[80%] pt-10 pb-4">
                <img src={screenImg} alt="screen" className="w-full block" />
              </div>

              {/* 커플석 알림창*/}
              {showCoupleNotice && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-[#f4f1ea] border-[3px] border-red-700 px-6 py-2 shadow-[4px_4px_0_0_#b91c1c] z-20 flex items-center gap-6">
                  <span className="font-mono text-xs font-bold text-red-700 tracking-widest uppercase whitespace-nowrap">
                    [알림] 커플석은 짝수(2, 4...)로만 선택 가능합니다.
                  </span>
                  <button onClick={() => setShowCoupleNotice(false)} className="text-red-700 font-bold hover:scale-125 transition-transform">✕</button>
                </div>
              )}

              {/* 좌석 컨테이너 */}
              <div id="seat-container" style={{ position: "absolute", top: "170px", left: "42%", transform: "translateX(-50%)" }}>
                
                {/* 행 이름 */}
                {[...new Set(realSeats.map(s => s.row))].sort().map((row) => {
                  const firstSeatInRow = realSeats.find(s => s.row === row);
                  const posY = firstSeatInRow ? firstSeatInRow.y : 0;
                  return (
                    <div key={`row-${row}`} className="absolute font-mono font-bold text-black/40 text-sm flex items-center justify-center w-5 h-5" style={{ left: "-40px", top: `${posY}px` }}>
                      {row}
                    </div>
                  );
                })}

                {/* 실제 좌석 렌더링 */}
                {realSeats.map((seat) => {
                  const isSelected = selectedSeats.some((s) => s.id === seat.id);
                  const remainingCount = totalPersonnelCount - selectedSeats.length;

                  // 파트너 찾기 및 상태 계산 (기존 로직 동일)
                  const hoveredSeat = realSeats.find(s => s.id === hoveredSeatId);
                  const partnerNumber = (hoveredSeat && !selectedSeats.some(s => s.id === hoveredSeat.id)) ? getPartnerNumber(hoveredSeat) : null;
                  const isHovered = totalPersonnelCount > 0 && hoveredSeatId === seat.id;
                  const isPartnerAlreadySelected = selectedSeats.some(s => s.row === hoveredSeat?.row && s.number === partnerNumber && s.type === hoveredSeat?.type);
                  const isSideHovered = totalPersonnelCount > 0 && (totalPersonnelCount - selectedSeats.length) >= 2 && partnerNumber !== null && partnerNumber === seat.number && hoveredSeat?.row === seat.row && hoveredSeat?.type === seat.type && !isPartnerAlreadySelected;

                  // 시각적 무효 상태 결정 (Chunk 로직)
                  let isVisualInvalid = false;
                  if (totalPersonnelCount > 0 && !isSelected) {
                    if (seat.type === "COUPLE" && totalPersonnelCount % 2 !== 0) {
                      isVisualInvalid = true;
                    } else if (remainingCount === 1 && seat.status === 'AVAILABLE') {
                      const availableSameTypeSeats = realSeats.filter(s => s.row === seat.row && s.type === seat.type && s.status === 'AVAILABLE').filter(s => !selectedSeats.some(sel => sel.id === s.id)).sort((a, b) => a.number - b.number);
                      if (availableSameTypeSeats.length > 0) {
                        const chunks: SeatViewModel[][] = [];
                        let currentChunk = [availableSameTypeSeats[0]];
                        for (let i = 1; i < availableSameTypeSeats.length; i++) {
                          const prevSeat = currentChunk[currentChunk.length - 1];
                          const currSeat = availableSameTypeSeats[i];
                          const isAdjacent = Math.abs(currSeat.x - prevSeat.x) <= 20 && Math.abs(currSeat.y - prevSeat.y) <= 20;
                          if (isAdjacent) currentChunk.push(currSeat);
                          else { chunks.push(currentChunk); currentChunk = [currSeat]; }
                        }
                        chunks.push(currentChunk);
                        const myChunk = chunks.find(chunk => chunk.some(s => s.id === seat.id));
                        if (myChunk) {
                          const indexInGroup = myChunk.findIndex(s => s.id === seat.id);
                          if (indexInGroup % 2 !== 0) isVisualInvalid = true;
                        }
                      }
                    }
                  }

                  return (
                    <StyledSeat
                      key={seat.id}
                      $status={seat.status}
                      $seatType={seat.type}
                      $isSelected={isSelected || isHovered || isSideHovered}
                      $isCoupleInvalid={isVisualInvalid}
                      $posX={seat.x}
                      $posY={seat.y}
                      onMouseEnter={() => setHoveredSeatId(seat.id)}
                      onMouseLeave={() => setHoveredSeatId(null)}
                      onClick={() => toggleSeat(seat)}
                      disabled={seat.status === "RESERVED"}
                    >
                      {seat.status === "RESERVED" || seat.status === "HELD" ? null : seat.number}
                    </StyledSeat>
                  );
                })}

                {/* 출입구 렌더링 */}
                {entranceSeats.map((seat) => (
                  <div key={seat.id} className="absolute flex flex-col items-center opacity-70" style={{ left: `${seat.x}px`, top: `${seat.y}px` }}>
                    <img src={seat.displayIcon} alt={seat.displayLabel} style={{ width: "16px", height: "16px" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===================== [우측] 티켓 & 결제 정보 (Ticket Stub) ===================== */}
          <div className="flex-1 bg-white border-[6px] border-black shadow-[12px_12px_0_0_#000] min-w-[380px] flex flex-col relative">
            
            {/* 티켓 헤더 */}
            <div className="bg-black text-white p-6 text-center border-b-[6px] border-black">
              <p className="font-mono text-xs tracking-[0.3em] text-white/60 mb-2">ADMISSION TICKET</p>
              <h2 className="font-serif italic text-3xl uppercase tracking-tighter">Your Order</h2>
            </div>

            <div className="p-6 flex flex-col flex-1">
              {screeningInfo ? (
                <>
                  {/* 영화 정보 */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <img src={ratingImages[screeningInfo.movie.ageRating as keyof typeof ratingImages]} alt="등급" className="w-6 h-6 border border-black shadow-[2px_2px_0_0_#000]" />
                        <span className="font-mono text-xs font-bold bg-black text-white px-2 py-0.5">{screeningInfo.theater.screenType}</span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold leading-tight mt-1">{screeningInfo.movie.title}</h3>
                    </div>
                    <img src={screeningInfo.movie.poster} alt="poster" className="w-16 border-2 border-black shadow-[4px_4px_0_0_#000]" />
                  </div>

                  <div className="mt-6 border-y-2 border-dashed border-black/20 py-4 space-y-2 font-mono text-sm font-bold uppercase tracking-widest text-black/80">
                    <p className="flex justify-between"><span>Venue</span> <span className="text-black">{screeningInfo.theater.name} / {screeningInfo.theater.screenName}</span></p>
                    <p className="flex justify-between"><span>Date</span> <span className="text-black">{formatDate(screeningInfo.time.start)}</span></p>
                    <p className="flex justify-between"><span>Time</span> <span className="text-black">{formatTime(screeningInfo.time.start)} ~ {formatTime(screeningInfo.time.end)}</span></p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center font-mono text-sm text-black/40 uppercase tracking-widest">
                  Loading Ticket Data...
                </div>
              )}

              {/* 좌석 범례 & 선택 좌석 */}
              <div className="mt-6 flex border-2 border-black bg-[#f4f1ea]">
                <div className="flex-1 p-4 flex items-center justify-center">
                  <SeatLegend />
                </div>
                <div className="w-0.5 bg-black"></div>
                <div className="flex-1 p-4 flex flex-col items-center justify-center">
                  <div className="font-mono text-xs font-bold uppercase tracking-widest mb-3">Selected Seats</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 8 }).map((_, index) => {
                      const seat = selectedSeats[index];
                      return (
                        <div key={index} className={`w-12 h-8 border-2 flex items-center justify-center text-xs font-mono font-bold transition-all ${seat ? 'border-black bg-black text-white shadow-[2px_2px_0_0_#000] rotate-2' : 'border-dashed border-black/20 bg-transparent text-black/20'}`}>
                          {seat ? `${seat.row}${seat.number}` : "---"}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex-1"></div>

              {/* 결제 금액 및 버튼 */}
              <div className="mt-8 pt-6 border-t-[4px] border-black">
                <div className="flex justify-between items-end mb-6">
                  <span className="font-serif italic text-xl uppercase font-bold">Total</span>
                  <span className="font-mono text-4xl font-black">
                    {totalPrice.toLocaleString()} <span className="text-sm">KRW</span>
                  </span>
                </div>

                <button
                  onClick={handleReservation}
                  disabled={selectedSeats.length === 0 || selectedSeats.length !== totalPersonnelCount}
                  className={`w-full py-5 text-xl font-black font-serif italic tracking-widest uppercase border-[4px] border-black transition-all ${
                    (selectedSeats.length === 0 || selectedSeats.length !== totalPersonnelCount)
                      ? "bg-black/10 text-black/30 cursor-not-allowed shadow-none"
                      : "bg-red-700 text-white shadow-[6px_6px_0_0_#000] hover:bg-black hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
                  }`}
                >
                  {selectedSeats.length === 0 
                    ? "Select Seats" 
                    : selectedSeats.length !== totalPersonnelCount 
                      ? `${totalPersonnelCount - selectedSeats.length} More Needed` 
                      : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모달 */}
      <CommonModal isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        <div className="border-[4px] border-black p-6 bg-white shadow-[8px_8px_0_0_#000]">
          <h3 className="font-serif italic text-2xl uppercase font-black mb-4 border-b-2 border-black pb-2">Notice</h3>
          <div className="font-mono text-sm font-bold uppercase tracking-widest mb-6 leading-relaxed text-black/80">
            {alertMessage}
          </div>
          <button onClick={() => setIsAlertOpen(false)} className="w-full bg-black text-white font-mono font-bold uppercase py-3 border-2 border-black hover:bg-red-700 transition-colors">
            Confirm
          </button>
        </div>
      </CommonModal>
    </div>
  );
};

export default SeatBooking;