import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useAuth } from "react-oidc-context";

import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import TradingBot from "./pages/Trading/Trading";
import "./App.css";

function App() {
  const auth = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>();

  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated);
  }, [auth.isAuthenticated]);

  return (
    <Router>
      <Routes>
        {isAuthenticated && <Route path="/" element={<Home />} />}
        {!isAuthenticated && <Route path="/" element={<Login />} />}
        <Route path="/login" element={<Login />} />
        <Route path="/trading" element={<TradingBot />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
