/*import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./pages/Main";
import Gnb from "./components/Gnb"; // Gnb 경로 맞춰주세요
import TicketingPage from "./pages/TicketingPage";

function App() {
  return (
    <Router>
      <Gnb /> {/* 항상 상단에 Gnb 표시 }
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/ticketing" element={<TicketingPage />} />
      </Routes>
    </Router>
  );
}

export default App;*/
// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import SeatBooking from "./pages/SeatBooking";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "10px", borderBottom: "1px solid gray" }}>
        <Link to="/seat-booking">좌석 예매</Link>
      </nav>

      <Routes>
        <Route path="/seat-booking" element={<SeatBooking />} />
        <Route path="*" element={<div>홈페이지 또는 다른 페이지</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;