import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Gnb from "./components/Gnb"; 
import Main from "./pages/Main";
// 폴더 구조에 맞춰 import 경로 수정
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
        
        {/* 3. 결제 관련 경로 (계층형 구조 적용) */}
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />
      </Routes>
    </Router>
  );
}

export default App;