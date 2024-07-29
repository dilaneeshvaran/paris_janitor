import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import OwnerDashboard from './components/Owner';
import ClientDashboard from './components/Client';
import { AuthProvider } from './components/AuthContext';
import './App.css';

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
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
