import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { seatBookingApi } from '../../api/seatBookingApi';
import { getSeatColor, getRatingDetails, mapRatingToStyle } from '../../mappers/ticketingMapper';
import type { Screening, Seat } from '../../types/ticketing';
import { useAuth } from '../../contexts/AuthContext';
import ratingImages, { type AgeRatingType } from "../../utils/getRatingImage";
import { X, Users, Armchair } from 'lucide-react';
import { cinemaAlert } from '../../utils/alert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  screening: Screening | null;
  seats: Seat[];
}

const SeatPreviewModal: React.FC<Props> = ({ isOpen, onClose, screening, seats: initialSeats }) => {
  const navigate = useNavigate();
  const [currentSeats, setCurrentSeats] = useState<Seat[]>(initialSeats);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, isGuest } = useAuth();

  useEffect(() => {
    if (isOpen && screening?.id) {
      setIsLoading(true);
      seatBookingApi.getScreeningSeats(screening.id)
        .then((data) => {
          const formattedSeats: Seat[] = data.seats
          .filter(item => item.seatRow !== "0")
          .map(item => ({
            id: item.seatId,
            seatRow: item.seatRow,
            seatNumber: item.seatNumber,
            status: item.status as Seat['status'],
            type: item.seatType,
            posX: item.posX,
            posY: item.posY
          }));
          setCurrentSeats(formattedSeats);
        })
        .catch(err => console.error("Data load failed:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, screening?.id]);

  const handleBookingClick = () => {
    if (!screening) return;
    if (!isLoggedIn && !isGuest) {
      cinemaAlert("예매를 하기 위해서는 로그인이 필요합니다.","알람");
      navigate('/login', {
        state: {
          returnTo: '/seat-booking',
          screeningId: screening.id
        }
      });
      return;
    }
    navigate('/seat-booking', {
      state: { screeningId: screening.id }
    });
  };

  const maxX = useMemo(() => Math.max(...currentSeats.map(s => s.posX), 0), [currentSeats]);
  const maxY = useMemo(() => Math.max(...currentSeats.map(s => s.posY), 0), [currentSeats]);
  
  const SEAT_SIZE = 16; 

  if (!isOpen || !screening) return null;

  const totalSeats = currentSeats.length;
  const availableCount = currentSeats.filter(s => s.status === 'AVAILABLE').length;
  const ratingStyle = mapRatingToStyle(screening.ageRating);
  const finalKey = ratingStyle.text === 'ALL' ? 'ALL' : `AGE_${ratingStyle.text}`;
  const ratingData = getRatingDetails(finalKey);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="flex min-h-full items-center justify-center p-4 py-12">
        <div className="bg-white w-full max-w-xl rounded-md shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
          
          {/* Header */}
          <div className="bg-[#1A1A1A] text-white p-6 flex justify-between items-start rounded-t-md">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="bg-[#B91C1C] text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest rounded-sm">Live Circuit</span>
                <h2 className="font-display text-2xl uppercase tracking-tight leading-none">{screening.movieTitle}</h2>
              </div>
              <p className="text-white/60 text-[11px] font-medium uppercase tracking-widest">
                {screening.theaterName} • {screening.screenName} | <span className="text-white">{screening.startTime.replace('T', ' ')}</span>
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col items-center gap-8 overflow-x-auto">
            
            {/* Legend */}
            <div className="w-full flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-black/40">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-[2px] border border-black/5 flex items-center justify-center shadow-sm ${getSeatColor('AVAILABLE')}`}>
                    <Armchair size={8} className="text-black/10" />
                  </div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-[2px] border border-black/5 flex items-center justify-center ${getSeatColor('RESERVED')}`}>
                    <Armchair size={8} className="text-transparent" />
                  </div>
                  <span>Reserved</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[#B91C1C]">
                <Users size={12} />
                <span>{availableCount} / {totalSeats}</span>
              </div>
            </div>

            {/* Screen */}
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-4/5 h-1 bg-black/5 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B91C1C]/20 to-transparent"></div>
              </div>
              <span className="text-[9px] font-bold tracking-[0.8em] text-black/20 uppercase">SCREEN</span>
            </div>

            <div className="relative bg-[#F8F8F8] p-8 rounded-sm border border-black/5 shadow-inner">
              {isLoading ? (
                <div className="flex items-center justify-center h-32 w-32">
                  <div className="w-6 h-6 border-2 border-[#B91C1C] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div 
                  className="relative"
                  style={{
                    width: maxX + SEAT_SIZE,
                    height: maxY + SEAT_SIZE,
                  }}
                >
                  {currentSeats.map((seat) => (
                    <div
                      key={seat.id}
                      className={`
                        absolute w-4 h-4 rounded-[2px] border border-black/5 
                        transition-all duration-300 flex items-center justify-center
                        ${getSeatColor(seat.status)}
                        ${seat.status === "AVAILABLE" ? "cursor-pointer hover:scale-110 hover:border-[#B91C1C]/50 shadow-sm" : ""}
                      `}
                      style={{
                        left: seat.posX,
                        top: seat.posY,
                      }}
                    >
                      <Armchair size={10} className={seat.status === 'AVAILABLE' ? 'text-black/10' : 'text-transparent'} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rating Info */}
            <div className="w-full bg-[#FDFDFD] border border-black/5 p-4 rounded-sm flex items-center gap-4">
              <img 
                src={ratingImages[finalKey as AgeRatingType] || ratingImages.ALL} 
                alt={finalKey}
                className="w-10 h-10 object-contain drop-shadow-sm" 
              />
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-[#1A1A1A] tracking-tight">
                  본 상영은 <span className="text-[#B91C1C] underline decoration-2 underline-offset-4">{ratingData.highlight}</span>입니다.
                </p>
                <p className="text-[11px] text-black/40 leading-relaxed font-medium">
                  {ratingData.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#FDFDFD] border-t border-black/5 flex gap-4 rounded-b-md">
            <button 
              onClick={onClose} 
              className="flex-1 py-3 bg-white border border-black/10 text-[#1A1A1A] font-bold text-[11px] uppercase tracking-widest hover:bg-black/5 transition-colors rounded-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleBookingClick} 
              className="flex-[2] py-3 bg-[#B91C1C] text-white font-bold text-[11px] uppercase tracking-widest hover:bg-[#991B1B] transition-colors rounded-sm shadow-md"
            >
              Select Seats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatPreviewModal;