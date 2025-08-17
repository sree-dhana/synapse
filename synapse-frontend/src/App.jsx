import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react"
import LandingPage from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Rooms from "./components/Room";

function App() {
 
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <Router>
      <Routes>
      
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />

        <Route path="/signup" element={<Signup onSignup={() => setIsLoggedIn(true)} />} />

        
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Login onLogin={() => setIsLoggedIn(true)} />}
        />

       
        <Route
          path="/rooms"
          element={isLoggedIn ? <Rooms /> : <Login onLogin={() => setIsLoggedIn(true)} />}
        />

      </Routes>
    </Router>
  );
}

export default App;
