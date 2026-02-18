import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import Gnb from "./components/Gnb";
import TicketingPage from "./pages/TicketingPage";
import SeatBookingPage from "./pages/SeatBookingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import FindAccountPage from "./pages/FindAccountPage";

function App() {
  return (
    <Router>
      <Gnb />

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/ticketing" element={<TicketingPage />} />
        <Route path="/seat-booking" element={<SeatBookingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/find-account" element={<FindAccountPage />} />
        <Route path="*" element={<div>홈페이지 또는 다른 페이지</div>} />
      </Routes>
    </Router>
  );
}

export default App;