import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  expiresAt: string; // "2026-03-08T14:30:00"
  onExpire?: () => void; // 시간 다 됐을 때 실행할 콜백 (선택)
}

export function ReservationTimer({ expiresAt, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

useEffect(() => {
    // 💡 범인을 잡기 위한 팩트 체크 로그!
    console.log("🚨 [시간 디버깅 시작] 🚨");
    console.log("1. 서버가 준 원본 데이터(expiresAt):", expiresAt);
    
    // (만약 배열로 왔다면 문자열로 조립해서 확인)
    let targetDate;
    if (Array.isArray(expiresAt)) {
      targetDate = new Date(expiresAt[0], expiresAt[1] - 1, expiresAt[2], expiresAt[3], expiresAt[4], expiresAt[5] || 0);
    } else {
      targetDate = new Date(expiresAt);
    }

    console.log("2. 브라우저가 해석한 만료 시간:", targetDate.toLocaleString());
    console.log("3. 지금 내 컴퓨터(브라우저) 시간:", new Date().toLocaleString());
    console.log("4. 차이(남은 초):", Math.floor((targetDate.getTime() - Date.now()) / 1000));
    console.log("========================");  
    const calculateTimeLeft = () => {
      // 💡 디버깅을 위해 getTime() 값도 따로 변수로 뺍니다.
      const targetTime = new Date(expiresAt).getTime();
      const nowTime = Date.now();
      const difference = targetTime - nowTime;
      
      return Math.max(0, Math.floor(difference / 1000));
    };

    // 초기 계산
    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);
    
    // 💡 여기에 디버깅용 로그를 예쁘게 찍어봅시다!
    console.log("====== [타이머 시간 체크] ======");
    console.log("1. 서버가 준 만료시간(원본):", expiresAt);
    console.log("2. 브라우저 현재시간:", new Date().toString());
    console.log("3. 남은 시간(초):", initialTimeLeft);
    console.log("===============================");

    // 1초마다 갱신
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // (선택) 1초마다 줄어드는 걸 보고 싶다면 아래 주석을 푸세요
      console.log("⏳ 째깍째깍 남은 초:", remaining);

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