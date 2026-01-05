import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./pages/Main";
import Gnb from "./components/Gnb"; // Gnb 경로 맞춰주세요

function App() {
  return (
    <Router>
      <Gnb /> {/* 항상 상단에 Gnb 표시 */}
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;