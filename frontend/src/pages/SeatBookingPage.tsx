import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RotateCcw, Minus, Plus, X, AlertCircle } from 'lucide-react';

import { useSeatBooking } from "../hooks/useSeatBooking";
import { formatDate, formatTime } from '../utils/dateFormatter';
import ratingImages from '../utils/getRatingImage';
import type { SeatViewModel } from '../types/models/SeatBookingViewModel';

// 스타일 및 컴포넌트
import { StyledSeat } from '../style/Seat.styles';
import { SeatLegend } from "../components/SeatLegend";
import { CommonModal } from "../components/common/CommonModal";

// 이미지 에셋
import screenImg from "../assets/screen.png";

const SeatBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
    handleProceedToPayment
  } = useSeatBooking(screeningId);

  const [hoveredSeatId, setHoveredSeatId] = useState<number | null>(null);

  return (
    <div className="bg-white text-[#1A1A1A] min-h-screen font-sans selection:bg-[#B91C1C] selection:text-white">
      
      {/* Header Area */}
      <div className="bg-[#1A1A1A] text-white pt-15 pb-10 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#B91C1C_0%,transparent_70%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-[#B91C1C]"></div>
              <p className="font-sans text-[10px] font-bold tracking-[0.5em] text-[#B91C1C] uppercase">Kino Cinema</p>
              <div className="h-px w-12 bg-[#B91C1C]"></div>
            </div>
            <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tighter leading-none">
              좌석 선택<span className="text-white/20"></span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* ===================== [좌측] 인원 및 좌석 선택 영역 ===================== */}
          <div className="flex-[2] flex flex-col gap-12 w-full">
            
            {/* 1. 관람 인원 선택 박스 */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
                  <div className="w-8 h-px bg-[#B91C1C]"></div>
                  <span>Audience</span>
                </div>
                <button 
                  onClick={resetSelection} 
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-[#B91C1C] transition-colors"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>

              <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {(['adult', 'youth', 'senior', 'special'] as const).map((type) => (
                    <div key={type} className="flex flex-col gap-3">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-black/40">
                        {type === 'adult' ? '성인' : type === 'youth' ? '청소년' : type === 'senior' ? '경로' : '우대'}
                      </span>
                      <div className="flex items-center justify-between border border-black/10 bg-white rounded-sm p-1">
                        <button 
                          onClick={() => handleCountChange(type, -1)} 
                          className="w-8 h-8 flex items-center justify-center text-black/60 hover:bg-[#1A1A1A] hover:text-white transition-all rounded-sm"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-display text-2xl leading-none pt-1 w-10 text-center">
                          {personnel[type]}
                        </span>
                        <button 
                          onClick={() => handleCountChange(type, 1)} 
                          className="w-8 h-8 flex items-center justify-center text-black/60 hover:bg-[#1A1A1A] hover:text-white transition-all rounded-sm"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. 스크린 및 좌석 배치도 */}
            <section>
              <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs mb-8">
                <div className="w-8 h-px bg-[#B91C1C]"></div>
                <span>Screen & Seats</span>
              </div>

              <div className="bg-[#FDFDFD] border border-black/5 rounded-sm shadow-xl relative w-full h-[600px] overflow-hidden flex flex-col items-center">
                
                {/* 스크린 이미지 */}
                <div className="w-[80%] pt-12 pb-8 opacity-80">
                  <img src={screenImg} alt="screen" className="w-full block filter contrast-125 grayscale" />
                </div>

                {/* 커플석 알림창 */}
                {showCoupleNotice && (
                  <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-6 py-3 rounded-sm shadow-2xl z-20 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle size={16} className="text-[#B91C1C]" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      커플석은 짝수(2, 4, 6, 8)로만 선택 가능합니다.
                    </span>
                    <button onClick={() => setShowCoupleNotice(false)} className="text-white/40 hover:text-white transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* 좌석 컨테이너 */}
                <div id="seat-container" style={{ position: "absolute", top: "180px", left: "38%", transform: "translateX(-50%)" }}>
                  
                  {/* 행 이름 */}
                  {[...new Set(realSeats.map(s => s.row))].sort().map((row) => {
                    const firstSeatInRow = realSeats.find(s => s.row === row);
                    const posY = firstSeatInRow ? firstSeatInRow.y : 0;
                    return (
                      <div key={`row-${row}`} className="absolute font-display font-bold text-black/20 text-lg flex items-center justify-center w-5 h-5" style={{ left: "-50px", top: `${posY}px` }}>
                        {row}
                      </div>
                    );
                  })}

                  {/* 실제 좌석 렌더링 */}
                  {realSeats.map((seat) => {
                    const isSelected = selectedSeats.some((s) => s.id === seat.id);
                    const remainingCount = totalPersonnelCount - selectedSeats.length;

                    // 상태 계산 로직 (유지)
                    const hoveredSeat = realSeats.find(s => s.id === hoveredSeatId);
                    const partnerNumber = (hoveredSeat && !selectedSeats.some(s => s.id === hoveredSeat.id)) ? getPartnerNumber(hoveredSeat) : null;
                    const isHovered = totalPersonnelCount > 0 && hoveredSeatId === seat.id;
                    const isPartnerAlreadySelected = selectedSeats.some(s => s.row === hoveredSeat?.row && s.number === partnerNumber && s.type === hoveredSeat?.type);
                    const isSideHovered = totalPersonnelCount > 0 && (totalPersonnelCount - selectedSeats.length) >= 2 && partnerNumber !== null && partnerNumber === seat.number && hoveredSeat?.row === seat.row && hoveredSeat?.type === seat.type && !isPartnerAlreadySelected;

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
                    <div key={seat.id} className="absolute flex flex-col items-center opacity-40 grayscale" style={{ left: `${seat.x}px`, top: `${seat.y}px` }}>
                      <img src={seat.displayIcon} alt={seat.displayLabel} style={{ width: "16px", height: "16px" }} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* ===================== [우측] 티켓 & 결제 정보 (Ticket Stub) ===================== */}
          <div className="w-full lg:w-[380px] lg:sticky lg:top-8 flex flex-col gap-8">
            <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs">
              <div className="w-8 h-px bg-[#B91C1C]"></div>
              <span>Ticket Info</span>
            </div>

            <div className="bg-[#FDFDFD] border border-black/5 rounded-sm shadow-xl flex flex-col overflow-hidden">
              
              <div className="p-8 flex flex-col flex-1">
                {screeningInfo ? (
                  <>
                    {/* 영화 정보 */}
                    <div className="flex gap-5 items-start">
                      {screeningInfo.movie.poster ? (
                        <div className="w-20 aspect-[2/3] rounded-sm overflow-hidden shadow-md flex-shrink-0">
                          <img src={screeningInfo.movie.poster} alt="poster" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 aspect-[2/3] bg-black/5 rounded-sm flex-shrink-0"></div>
                      )}
                      
                      <div className="flex flex-col gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <img 
                            src={ratingImages[screeningInfo.movie.ageRating as keyof typeof ratingImages]} 
                            alt="등급" 
                            className="w-5 h-5 object-contain" 
                          />
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] bg-[#1A1A1A] text-white px-2 py-0.5 rounded-sm">
                            {screeningInfo.theater.screenType}
                          </span>
                        </div>
                        <h3 className="font-display text-2xl uppercase tracking-tight leading-none text-[#1A1A1A]">
                          {screeningInfo.movie.title}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-black/5 space-y-4 text-xs font-bold uppercase tracking-widest">
                      <div className="flex justify-between items-center">
                        <span className="text-black/40">Venue</span>
                        <span className="text-[#1A1A1A]">{screeningInfo.theater.name} / {screeningInfo.theater.screenName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black/40">Date</span>
                        <span className="text-[#1A1A1A]">{formatDate(screeningInfo.time.start)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black/40">Time</span>
                        <span className="text-[#1A1A1A]">{formatTime(screeningInfo.time.start)} ~ {formatTime(screeningInfo.time.end)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 flex items-center justify-center text-[10px] font-bold text-black/20 uppercase tracking-widest">
                    Loading Ticket Data...
                  </div>
                )}

                {/* 선택 좌석 안내 */}
                <div className="mt-8 pt-6 border-t border-black/5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-4 text-center">
                    Selected Seats
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 8 }).map((_, index) => {
                      const seat = selectedSeats[index];
                      return (
                        <div 
                          key={index} 
                          className={`h-10 border rounded-sm flex items-center justify-center text-[10px] font-bold tracking-widest transition-all ${
                            seat 
                              ? 'border-[#B91C1C] bg-[#B91C1C]/5 text-[#B91C1C]' 
                              : 'border-dashed border-black/10 bg-transparent text-black/20'
                          }`}
                        >
                          {seat ? `${seat.row}${seat.number}` : "---"}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex justify-center opacity-60">
                  <SeatLegend />
                </div>
              </div>

              {/* 결제 금액 및 버튼 */}
              <div className="bg-[#F8F8F8] border-t border-black/5 p-8">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1">Total Amount</span>
                  <div className="font-display text-4xl text-[#B91C1C] leading-none">
                    {totalPrice.toLocaleString()} <span className="text-sm text-[#1A1A1A] tracking-widest">KRW</span>
                  </div>
                </div>

                <button
                  onClick={() => handleProceedToPayment(navigate)}
                  disabled={selectedSeats.length === 0 || selectedSeats.length !== totalPersonnelCount}
                  className={`w-full py-5 text-xs font-bold tracking-[0.2em] uppercase rounded-sm transition-all duration-300 ${
                    (selectedSeats.length === 0 || selectedSeats.length !== totalPersonnelCount)
                      ? "bg-black/5 text-black/30 cursor-not-allowed border border-black/5"
                      : "bg-[#1A1A1A] text-white shadow-lg hover:bg-[#B91C1C] hover:shadow-xl hover:-translate-y-0.5"
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
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden min-w-[320px]">
          <div className="bg-[#B91C1C] text-white px-6 py-4 flex items-center gap-3">
            <AlertCircle size={18} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Notice</h3>
          </div>
          <div className="p-8">
            <p className="text-sm font-medium text-[#1A1A1A] leading-relaxed text-center mb-8">
              {alertMessage}
            </p>
            <button 
              onClick={() => setIsAlertOpen(false)} 
              className="w-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-sm hover:bg-[#B91C1C] transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </CommonModal>
    </div>
  );
};

export default SeatBooking;