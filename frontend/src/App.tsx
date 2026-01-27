import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Main from "./pages/Main";
import Gnb from "./components/Gnb";
import TicketingPage from "./pages/TicketingPage";
import SeatBooking from "./pages/SeatBooking";

function App() {
  return (
    <Router>
      <Gnb />

      <nav style={{ padding: "10px", borderBottom: "1px solid gray" }}>
        <Link to="/ticketing">빠른 예매 </Link>
        <Link to="/seat-booking">좌석 예매</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/ticketing" element={<TicketingPage />} />
        <Route path="/seat-booking" element={<SeatBooking />} />
        <Route path="*" element={<div>홈페이지 또는 다른 페이지</div>} />
      </Routes>
    </Router>
  );
}

export default App;