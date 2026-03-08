import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  expiresAt: string; // "2026-03-08T14:30:00"
  onExpire?: () => void; // 시간 다 됐을 때 실행할 콜백 (선택)
}

export function ReservationTimer({ expiresAt, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - Date.now();
      return Math.max(0, Math.floor(difference / 1000));
    };

    // 초기 계산
    setTimeLeft(calculateTimeLeft());

    // 1초마다 갱신
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    // 🚨 중요: 컴포넌트 사라질 때 타이머 해제 (메모리 누수 방지)
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (timeLeft <= 0) {
    return <span className="text-red-500 font-bold">만료됨</span>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-1.5 text-[#eb4d32] font-mono font-bold">
      <Clock className="w-4 h-4" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}