import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Gnb from "./components/Gnb"; 
import Main from "./pages/Main";
import Gnb from "./components/Gnb";
import TicketingPage from "./pages/TicketingPage";
import SeatBooking from "./pages/SeatBooking";
import MovieDetail from './pages/MovieDetail';
import PaymentPage from "./pages/Payment/PaymentPage";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage";
import PaymentFailPage from "./pages/Payment/PaymentFailPage";

function App() {
  return (
    <Router>
      {/* 1. Gnb는 Routes 밖에 두어 모든 페이지에서 공통으로 보이게 합니다. */}
      <Gnb /> 
      
      <Routes>
        {/* 2. 메인 페이지 */}
        <Route path="/" element={<Main />} />
        <Route path="/ticketing" element={<TicketingPage />} />
        <Route path="/seat-booking" element={<SeatBooking />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="*" element={<div>홈페이지 또는 다른 페이지</div>} />
        
        {/* 3. 결제 관련 경로 (계층형 구조 적용) */}
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />
      </Routes>
    </Router>
  );
}

export default App;