import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ManageUsers from './components/ManageUsers';
import ManageProperties from './components/ManageProperties';
import ReceivedSimulations from './components/ReceivedSimulations';
import ProtectedRoute from './components/ProtectedRoute';
import Services from './components/Services';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute component={AdminDashboard} />}>
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-properties" element={<ManageProperties />} />
          <Route path="received-simulations" element={<ReceivedSimulations />} />
          <Route path="services" element={<Services />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
