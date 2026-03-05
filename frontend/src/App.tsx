import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
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
import MyPage from "./pages/MyPage";
import PaymentPage from "./pages/Payment/PaymentPage";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage";
import PaymentFailPage from "./pages/Payment/PaymentFailPage";

function LegacyMyPageRedirect() {
  const location = useLocation();
  const nextPath = location.pathname.replace(/^\/my-page/, "/mypage");
  return <Navigate to={`${nextPath}${location.search}`} replace />;
}

function AppRoutes() {
  return (
    <>
      <Gnb />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/movie-list" element={<MovieListPage />} />
        <Route path="/ticketing" element={<TicketingPage />} />
        <Route path="/seat-booking" element={<SeatBookingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/find-account" element={<FindAccountPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />
        <Route path="/my-page" element={<LegacyMyPageRedirect />} />
        <Route path="/my-page/*" element={<LegacyMyPageRedirect />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/reservations" element={<MyPage />} />
        <Route path="/mypage/vouchers" element={<MyPage />} />
        <Route path="/mypage/vouchers/movie" element={<MyPage />} />
        <Route path="/mypage/vouchers/store" element={<MyPage />} />
        <Route path="/mypage/coupons" element={<MyPage />} />
        <Route path="/mypage/points" element={<MyPage />} />
        <Route path="/mypage/point-password" element={<MyPage />} />
        <Route path="/mypage/movie-story" element={<MyPage />} />
        <Route path="/mypage/events" element={<MyPage />} />
        <Route path="/mypage/inquiries" element={<MyPage />} />
        <Route path="/mypage/payments" element={<MyPage />} />
        <Route path="/mypage/cards" element={<MyPage />} />
        <Route path="/mypage/profile" element={<MyPage />} />
        <Route path="/mypage/profile/preferences" element={<MyPage />} />
        <Route path="*" element={<div>홈페이지 또는 다른 페이지</div>} />
      </Routes>
      <Footer />
    </>
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
