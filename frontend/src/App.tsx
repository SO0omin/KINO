import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
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
import KakaoCallbackPage from "./pages/Callback/KakaoCallbackPage";
import NaverCallbackPage from './pages/Callback/NaverCallbackPage';
import GoogleCallbackPage from './pages/Callback/GoogleCallbackPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MovieDetailPage from "./pages/MovieDetailPage";
import MyPage from "./pages/MyPage";
import PaymentPage from "./pages/Payment/PaymentPage";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage";
import PaymentFailPage from "./pages/Payment/PaymentFailPage";
import TheaterListPage from "./pages/TheaterListPage";
import TimetablePage from "./pages/TimetablePage";


function AppRoutes() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* 상단 네비게이션 바 */}
            <Gnb />

            <main className="flex-grow">
                <Routes>
                    {/* 메인 및 기본 서비스 페이지 */}
                    <Route path="/" element={<MainPage />} />
                    <Route path="/movie-list" element={<MovieListPage />} />
                    <Route path="/theater-list" element={<TheaterListPage />} />
                    <Route path="/movies/:id" element={<MovieDetailPage />} />
                    <Route path="/timetables" element={<TimetablePage />} />

                    {/* 마이페이지 리다이렉트 및 메인 */}
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/mypage/*" element={<MyPage />} />
                    <Route path="/mypage/vouchers/store" element={<Navigate to="/mypage/vouchers/movie" replace />} />

                    {/* 예매 및 좌석 관련 */}
                    <Route path="/ticketing" element={<TicketingPage />} />
                    <Route path="/seat-booking" element={<SeatBookingPage />} />

                    {/* 인증 및 회원 관련 (질문자님 최신 작업 반영) */}
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/find-account" element={<FindAccountPage />} />
                    <Route path="/oauth/callback/kakao" element={<KakaoCallbackPage />} />
                    <Route path="/oauth/callback/naver" element={<NaverCallbackPage />} />
                    <Route path="/oauth/callback/google" element={<GoogleCallbackPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* 결제 관련 */}
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/payment/success" element={<PaymentSuccessPage />} />
                    <Route path="/payment/fail" element={<PaymentFailPage />} />

                    {/* 404 폴백 페이지 */}
                    <Route path="*" element={<div className="flex items-center justify-center min-h-[50vh]">페이지를 찾을 수 없습니다.</div>} />
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
