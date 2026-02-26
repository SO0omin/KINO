import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Gnb from "./components/Gnb.tsx"; 
import Main from "./pages/Main.tsx";
// 폴더 구조에 맞춰 import 경로 수정
import PaymentPage from "./pages/Payment/PaymentPage.tsx";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage.tsx";
import PaymentFailPage from "./pages/Payment/PaymentFailPage.tsx";
import MyPage from "./pages/MyPage.tsx";

function AppRoutes() {
  const location = useLocation();
  const hideGnb = location.pathname.startsWith("/my-page");

  return (
    <>
      {!hideGnb && <Gnb />}
      <Routes>
        <Route path="/" element={<Main />} />
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
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
