import type { BookingData } from '../../types/models/payment';

interface BookingInfoProps {
  bookingData: BookingData;
}

export function BookingInfo({ bookingData }: BookingInfoProps) {
  return (
    <section>
      <div className="flex items-center gap-3 text-[#B91C1C] font-bold tracking-[0.4em] uppercase text-xs mb-8">
        <div className="w-8 h-px bg-[#B91C1C]"></div>
        <span>Booking Info</span>
      </div>
      
      <div className="bg-[#FDFDFD] border border-black/5 rounded-sm p-8 shadow-xl flex flex-col sm:flex-row gap-8">
        <div className="w-24 sm:w-32 aspect-[2/3] bg-black/5 rounded-sm shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden border border-black/5">
          {bookingData.posterUrl ? (
            <img src={bookingData.posterUrl} alt="포스터" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/20">No Poster</span>
          )}
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-[#1A1A1A] mb-6">
            {bookingData.movieTitle}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="w-16 text-[10px] font-bold uppercase tracking-widest text-black/40">Date</span>
              <span className="text-sm font-medium text-[#1A1A1A]">{bookingData.dateTime}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16 text-[10px] font-bold uppercase tracking-widest text-black/40">Venue</span>
              <span className="text-sm font-medium text-[#1A1A1A]">{bookingData.theater}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-16 text-[10px] font-bold uppercase tracking-widest text-black/40 mt-0.5">Seats</span>
              <span className="text-sm font-medium text-[#B91C1C]">{bookingData.seatNamesText}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}