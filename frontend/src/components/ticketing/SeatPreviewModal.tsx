import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//import { useSeatWebSocket } from '../../hooks/useSeatWebSocket';
import { seatBookingApi } from '../../api/seatBookingApi'; // API 서비스 임포트
import { getSeatColor, getRatingDetails } from '../../mappers/ticketingMapper';
import type { Screening, Seat } from '../../types/ticketing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  screening: Screening | null;
  seats: Seat[];
}

//const VINTAGE_NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const SeatPreviewModal: React.FC<Props> = ({ isOpen, onClose, screening, seats: initialSeats }) => {

  // 1. 네비게이트 함수 초기화
  const navigate = useNavigate();

  // 훅을 통해 실시간 좌석 데이터 관리
  const [currentSeats, setCurrentSeats] = useState<Seat[]>(initialSeats);
  const [, setIsLoading] = useState(false); 

  // 2. 버튼 클릭 시 실행될 함수 정의
  useEffect(() => {
    if (isOpen && screening?.id) {
      setIsLoading(true);
      
      seatBookingApi.getScreeningSeats(screening.id)
        .then((data) => {
          // 서버에서 온 raw 데이터를 Seat 타입에 맞춰 매핑
          const formattedSeats: Seat[] = data.seats
          .filter(item => item.seatRow !== "0") //실제 좌석만 통과
          .map(item => ({
            id: item.seatId,
            seatRow: item.seatRow,
            seatNumber: item.seatNumber,
            status: item.status,
            type: item.seatType, // DTO의 seatType을 Seat의 type으로
            posX: item.posX,
            posY: item.posY
          }));
          
          setCurrentSeats(formattedSeats);
        })
        .catch(err => console.error("데이터 로드 실패:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, screening?.id]);

  const handleBookingClick = () => {
    if (!screening) return;
    navigate('/seat-booking', {
      state: {
        screeningId: screening.id,
      }
    });
  };

  const maxX = useMemo(() => Math.max(...currentSeats.map(s => s.posX), 0), [currentSeats]);
  const maxY = useMemo(() => Math.max(...currentSeats.map(s => s.posY), 0), [currentSeats]);
  const PADDING = 20;
  

  if (!isOpen || !screening) return null;

  const totalSeats = currentSeats.length;
  const availableCount = currentSeats.filter(s => s.status === 'AVAILABLE').length;
  const ratingData = getRatingDetails(screening.ageRating);

  const modalStyles = `
    .modal-paper { background-color: #f4f1ea; background-image: url('https://www.transparenttextures.com/patterns/p6.png'); }
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-mono { font-family: 'Courier Prime', monospace; }
    .font-typewriter { font-family: 'Special Elite', cursive; }
  `;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <style dangerouslySetInnerHTML={{ __html: modalStyles }} />
      
      <div className="modal-paper w-[600px] h-[780px] border-[6px] border-black shadow-[20px_20px_0_0_#000] relative flex flex-col overflow-hidden">
        
        {/* 1. Ticket Header (상단 고정) */}
        <div className="bg-black text-white p-6 border-b-[6px] border-black flex justify-between items-start shrink-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-red-700 text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest animate-pulse font-mono">Live Circuit</span>
              <h2 className="font-serif text-3xl italic tracking-tighter uppercase">{screening.movieTitle}</h2>
            </div>
            <div className="font-mono text-[13px] uppercase tracking-[0.2em] text-white/50">
              {screening.theaterName} • {screening.screenName} | <span className="text-white">{screening.startTime.replace('T', ' ')}</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-4xl font-light hover:rotate-90 transition-transform leading-none outline-none !shadow-none !ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none !bg-transparent !border-none !p-0 select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}>×
          </button>
        </div>

        {/* 2. Modal Body (중앙 영역) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 flex flex-col items-center">
          <div className="w-full flex justify-between items-baseline mb-8 font-mono text-[12px] uppercase tracking-tighter shrink-0">
            <div className="flex gap-4 opacity-70">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#2c2c2c] border border-black/20"></div> 선택 가능</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#70299d]"></div> 선택 중</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#dcdcd7]"></div> 예매 완료</div>
            </div>
            <div className="font-bold border-b border-black pb-0.5">
              잔여 좌석: <span className="text-red-700">{availableCount}</span> / {totalSeats}
            </div>
          </div>

          <div className="w-full mb-7 flex flex-col items-center shrink-0">
            <div className="w-3/4 h-1 bg-black/10 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.1)]"></div>
            <span className="font-serif text-[10px] italic tracking-[1.2em] text-black/80 uppercase mt-2">S C R E E N</span>
          </div>

          <div className="flex justify-center items-center w-full">
            <div 
              className="bg-black/5 border border-black/10 rounded p-3"
              style={{
                width: maxX + PADDING * 2,
                height: maxY + PADDING * 2,
              }}
            >
              <div className="relative">
                {currentSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className={`
                      absolute w-[12px] h-[12px] 
                      border border-black/20 
                      transition-all duration-200
                      ${getSeatColor(seat.status)}
                      ${seat.status === "AVAILABLE" ? "cursor-pointer hover:scale-125 z-10" : ""}
                    `}
                    style={{
                      left: seat.posX,
                      top: seat.posY,
                    }}
                  >
                    {/* 툴팁 */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 
                                    bg-black text-white text-[8px] px-1 py-0.5 
                                    opacity-0 group-hover:opacity-100 
                                    whitespace-nowrap pointer-events-none">
                      {seat.seatRow}{seat.seatNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center w-full">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="flex items-center gap-3">
                <span className={`${ratingData.color} text-white w-6 h-6 flex items-center justify-center font-bold text-[10px] border border-black/20 shadow-[2px_2px_0_0_#000]`}>
                  {ratingData.label}
                </span>
                <p className="text-sm italic text-black font-bold tracking-tight whitespace-nowrap">
                  본 상영은 <span className="underline decoration-2">{ratingData.highlight}</span>입니다.
                </p>
              </div>
              <p className="font-mono text-[11px] text-black/70 uppercase tracking-tighter leading-relaxed max-w-[450px] whitespace-pre-line">
                {ratingData.desc}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Footer Actions */}
        <div className="p-8 bg-black/5 border-t border-black flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 border-4 border-black bg-white font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all">취소</button>
          <button onClick={handleBookingClick} className="flex-[2] py-4 border-4 border-black bg-black text-white font-bold text-[12px] uppercase tracking-[0.2em] shadow-[6px_6px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">인원/좌석 선택</button>
        </div>
      </div>
    </div>
  );
};

export default SeatPreviewModal;