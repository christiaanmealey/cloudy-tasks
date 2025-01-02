import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
