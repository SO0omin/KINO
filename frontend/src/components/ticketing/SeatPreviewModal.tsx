import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { seatBookingApi } from '../../api/seatBookingApi';
import { getSeatColor, getRatingDetails, mapRatingToStyle } from '../../mappers/ticketingMapper';
import type { Screening, Seat } from '../../types/ticketing';
import { useAuth } from '../../contexts/AuthContext';
import ratingImages, { type AgeRatingType } from "../../utils/getRatingImage";
import { X, Users, Armchair } from 'lucide-react';

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
      alert("예매를 하기 위해서는 로그인이 필요합니다."); //멘트수정
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
  const PADDING = 10;

  if (!isOpen || !screening) return null;

  const totalSeats = currentSeats.length;
  const availableCount = currentSeats.filter(s => s.status === 'AVAILABLE').length;
  const ratingStyle = mapRatingToStyle(screening.ageRating);
  const finalKey = ratingStyle.text === 'ALL' ? 'ALL' : `AGE_${ratingStyle.text}`;
  const ratingData = getRatingDetails(finalKey);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white p-8 flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-[#B91C1C] text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest rounded-full">Live Circuit</span>
              <h2 className="font-display text-3xl uppercase tracking-tight">{screening.movieTitle}</h2>
            </div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest">
              {screening.theaterName} • {screening.screenName} | <span className="text-white">{screening.startTime.replace('T', ' ')}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center gap-12">
          
          {/* Legend */}
          <div className="w-full flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-black/40">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border border-black/10 rounded-sm"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-black/5 rounded-sm"></div>
                <span>Reserved</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#B91C1C]">
              <Users size={14} />
              <span>{availableCount} / {totalSeats} Available</span>
            </div>
          </div>

          {/* Screen */}
          <div className="w-full flex flex-col items-center gap-4">
            <div className="w-4/5 h-1.5 bg-black/5 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B91C1C]/20 to-transparent"></div>
            </div>
            <span className="text-[10px] font-bold tracking-[0.8em] text-black/20 uppercase">S C R E E N</span>
          </div>

          {/* Seat Map */}
          <div className="relative bg-[#F8F8F8] p-10 rounded-xl border border-black/5 shadow-inner overflow-auto max-w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 w-80">
                <div className="w-8 h-8 border-2 border-[#B91C1C] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div 
                className="relative mx-auto"
                style={{
                  width: maxX + PADDING,
                  height: maxY + PADDING,
                }}
              >
                {currentSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className={`
                      absolute w-4 h-4 rounded-sm border border-black/5 
                      transition-all duration-300 flex items-center justify-center
                      ${getSeatColor(seat.status)}
                      ${seat.status === "AVAILABLE" ? "cursor-pointer hover:scale-110 hover:border-[#B91C1C]/50 shadow-sm" : ""}
                    `}
                    style={{
                      left: seat.posX,
                      top: seat.posY,
                    }}
                  >
                    <Armchair size={12} className={seat.status === 'AVAILABLE' ? 'text-black/10' : 'text-transparent'} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rating Info */}
          <div className="w-full bg-[#FDFDFD] border border-black/5 p-6 rounded-xl flex items-start gap-6">
            <img 
              src={ratingImages[finalKey as AgeRatingType] || ratingImages.ALL} 
              alt={finalKey}
              className="w-12 h-12 object-contain" 
            />
            <div className="space-y-1">
              <p className="font-bold text-sm text-[#1A1A1A]">
                This screening is rated <span className="text-[#B91C1C]">{ratingData.highlight}</span>
              </p>
              <p className="text-xs text-black/40 leading-relaxed font-medium">
                {ratingData.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F8F8] border-t border-black/5 flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 bg-white border border-black/10 text-[#1A1A1A] font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleBookingClick} 
            className="flex-[2] py-4 bg-[#B91C1C] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#991B1B] transition-all rounded-sm shadow-xl"
          >
            Select Seats
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatPreviewModal;
