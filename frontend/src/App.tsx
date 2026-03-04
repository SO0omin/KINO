import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Footer from "./components/common/Footer";
import Gnb from "./components/common/Gnb";
import MainPage from "./pages/MainPage";
import MovieDetail from "./pages/MovieDetail";
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

function AppRoutes() {
  return (
    <>
      <Gnb />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/movie-list" element={<MovieListPage />} />
        <Route path="/ticketing" element={<TicketingPage />} />
        <Route path="/seat-booking" element={<SeatBookingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/find-account" element={<FindAccountPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />
        <Route path="/my-page" element={<MyPage />} />
        <Route path="/my-page/reservations" element={<MyPage />} />
        <Route path="/my-page/vouchers" element={<MyPage />} />
        <Route path="/my-page/vouchers/movie" element={<MyPage />} />
        <Route path="/my-page/vouchers/store" element={<MyPage />} />
        <Route path="/my-page/coupons" element={<MyPage />} />
        <Route path="/my-page/points" element={<MyPage />} />
        <Route path="/my-page/point-password" element={<MyPage />} />
        <Route path="/my-page/movie-story" element={<MyPage />} />
        <Route path="/my-page/events" element={<MyPage />} />
        <Route path="/my-page/inquiries" element={<MyPage />} />
        <Route path="/my-page/payments" element={<MyPage />} />
        <Route path="/my-page/cards" element={<MyPage />} />
        <Route path="/my-page/profile" element={<MyPage />} />
        <Route path="/my-page/profile/preferences" element={<MyPage />} />
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
