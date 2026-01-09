import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./pages/Main";
import Gnb from "./components/Gnb"; // Gnb 경로 맞춰주세요
import TicketingPage from "./pages/TicketingPage";

function App() {
  return (
    <Router>
      <Gnb /> {/* 항상 상단에 Gnb 표시 */}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/ticketing" element={<TicketingPage />} />
      </Routes>
    </Router>
  );
}

export default App;