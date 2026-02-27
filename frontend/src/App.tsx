import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Footer from "./components/common/Footer";
import Gnb from "./components/common/Gnb";
import MainPage from "./pages/MainPage";
import MovieListPage from "./pages/MovieListPage";
import TicketingPage from "./pages/TicketingPage";
import SeatBookingPage from "./pages/SeatBookingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import FindAccountPage from "./pages/FindAccountPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import MyPage from "./pages/MyPage"; // ✨ 새로 추가된 마이페이지
import PaymentPage from "./pages/Payment/PaymentPage";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage";
import PaymentFailPage from "./pages/Payment/PaymentFailPage";
import TheaterListPage from "./pages/TheaterListPage";
import TimetablePage from "./pages/TimetablePage";

function AppRoutes() {
    const { pathname } = useLocation();
    // ✨ 마이페이지 하위 경로에서는 Gnb를 숨기는 로직
    const hideGnb = pathname.startsWith("/my-page");

    return (
        <div className="flex flex-col min-h-screen">
            {/* hideGnb가 false일 때만 Gnb 렌더링 */}
            {!hideGnb && <Gnb />}

            <main className="flex-grow">
                <Routes>
                    {/* 메인 및 기본 페이지 */}
                    <Route path="/" element={<MainPage />} />
                    <Route path="/movie-list" element={<MovieListPage />} />
                    <Route path="/theater-list" element={<TheaterListPage />} />
                    <Route path="/movie-detail/:id" element={<MovieDetailPage />} />
                    <Route path="/timetables" element={<TimetablePage />} />

                    {/* 마이페이지 관련 (새로 추가됨!) */}
                    <Route path="/my-page/*" element={<MyPage />} />

                    {/* 예매 및 좌석 관련 */}
                    <Route path="/ticketing" element={<TicketingPage />} />
                    <Route path="/seat-booking" element={<SeatBookingPage />} />

                    {/* 인증 및 회원 관련 */}
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/find-account" element={<FindAccountPage />} />

                    {/* 결제 관련 */}
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/payment/success" element={<PaymentSuccessPage />} />
                    <Route path="/payment/fail" element={<PaymentFailPage />} />

                    {/* 404 폴백 페이지 */}
                    <Route path="*" element={<div>홈페이지 또는 다른 페이지</div>} />
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;