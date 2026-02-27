import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from './contexts/AuthContext';

import Gnb from "./components/common/Gnb";
import Footer from "./components/common/Footer";

import MainPage from "./pages/MainPage";
import MovieListPage from "./pages/MovieListPage";
import TicketingPage from "./pages/TicketingPage";
import SeatBookingPage from "./pages/SeatBookingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import FindAccountPage from "./pages/FindAccountPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import PaymentPage from "./pages/Payment/PaymentPage";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage";
import PaymentFailPage from "./pages/Payment/PaymentFailPage";
import TheaterListPage from "./pages/TheaterListPage";
import TimetablePage from "./pages/TimetablePage";

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
                    <Route path="/movie-list" element={<MovieListPage />} />
                    <Route path="/theater-list" element={<TheaterListPage />} />
                    <Route path="/movie-detail/:id" element={<MovieDetailPage />} />
                    <Route path="/timetables" element={<TimetablePage />} />

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
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;