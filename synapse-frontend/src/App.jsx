import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { useState } from "react"
import LandingPage from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Rooms from "./components/Room";
import { clearAuth } from "./utils/auth";

function App() {
  const [authKey, setAuthKey] = useState(0); // Force re-render on auth changes

  // Use HashRouter by default to avoid 404s on static hosts without rewrite rules
  // Set VITE_HASH_ROUTER=false to use BrowserRouter instead
  const RouterComponent = (import.meta.env?.VITE_HASH_ROUTER === 'false') ? BrowserRouter : HashRouter;

  const handleLogin = () => {
    setAuthKey(prev => prev + 1); // Trigger re-render
  };

  const handleLogout = () => {
    clearAuth(); // Use auth utility to clear authentication
    setAuthKey(prev => prev + 1); // Trigger re-render
  };

  return (
    <RouterComponent key={authKey}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
        
        {/* Routes that depend on backend authentication */}
        <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
        <Route path="/rooms" element={<Rooms onLogout={handleLogout} />} />
      </Routes>
    </RouterComponent>
  );
}

export default App;
