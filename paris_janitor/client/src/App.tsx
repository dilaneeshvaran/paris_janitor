import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import OwnerDashboard from './components/Owner';
import ClientDashboard from './components/Client';
import { AuthProvider } from './components/AuthContext';
import './App.css';
import PaymentSuccess from './components/PaymentSuccess';
import Register from './components/Register';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/:userType" element={<Login />} />
          <Route path="/dashboard/owner" element={<OwnerDashboard />} />
          <Route path="/dashboard/client" element={<ClientDashboard />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
