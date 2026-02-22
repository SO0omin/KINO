import type { BookingData } from '../../types/model/payment';

interface BookingInfoProps {
  bookingData: BookingData;
}

export function BookingInfo({ bookingData }: BookingInfoProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl mb-4 pb-3 border-b-2 border-gray-300">예매정보</h2>
      <div className="bg-white rounded-lg p-6 flex gap-6">
        <div className="w-[120px] h-[160px] bg-[#f5e6d3] rounded flex-shrink-0 flex items-center justify-center">
          {bookingData.posterUrl ? (
            <img src={bookingData.posterUrl} alt="포스터" className="w-full h-full object-cover rounded" />
          ) : (
            <span className="text-sm text-gray-500">포스터</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl mb-3">{bookingData.movieTitle}</h3>
          <p className="text-gray-700 mb-1">{bookingData.dateTime}</p>
          <p className="text-gray-700 mb-1">{bookingData.theater}</p>
          <p className="text-gray-700">{bookingData.ticketType}</p>
        </div>
      </div>
    </section>
  );
}
