import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 💡 전역 상태 관리 (본인 작업)
import { AuthProvider } from './contexts/AuthContext';

// 💡 공통 컴포넌트
import Gnb from "./components/Gnb";

// 💡 페이지 컴포넌트 (본인 작업)
import MainPage from "./pages/MainPage"; // 🚨 주의: 팀원은 Main.tsx를 썼습니다. 실제 존재하는 파일명으로 맞춰주세요!
import TicketingPage from "./pages/TicketingPage";
import SeatBookingPage from "./pages/SeatBookingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import FindAccountPage from "./pages/FindAccountPage";

// 💡 페이지 컴포넌트 (팀원 작업: 결제 도메인)
import PaymentPage from "./pages/Payment/PaymentPage";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage";
import PaymentFailPage from "./pages/Payment/PaymentFailPage";

function App() {
    return (
        // 1. AuthProvider로 전체를 감싸서 결제 페이지에서도 회원 정보(memberId)를 쓸 수 있게 합니다!
        <AuthProvider>
            <Router>
                {/* 2. Gnb는 Routes 밖에 두어 모든 페이지에서 공통으로 보이게 합니다. */}
                <Gnb />

                <Routes>
                    {/* 메인 페이지 */}
                    <Route path="/" element={<MainPage />} />

                    {/* 예매 및 좌석 관련 */}
                    <Route path="/ticketing" element={<TicketingPage />} />
                    <Route path="/seat-booking" element={<SeatBookingPage />} />

                    {/* 인증 및 회원 관련 */}
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/find-account" element={<FindAccountPage />} />

                    {/* 결제 관련 (팀원 작업) */}
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/payment/success" element={<PaymentSuccessPage />} />
                    <Route path="/payment/fail" element={<PaymentFailPage />} />

                    {/* 404 폴백 페이지 */}
                    <Route path="*" element={<div>홈페이지 또는 다른 페이지</div>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;