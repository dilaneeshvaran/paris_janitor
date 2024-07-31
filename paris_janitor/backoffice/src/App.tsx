import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard.tsx';
import ManageUsers from './components/ManageUsers';
import ManageProperties from './components/ManageProperties';
import ReceivedSimulations from './components/ReceivedSimulations';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute component={AdminDashboard} />}>
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-properties" element={<ManageProperties />} />
          <Route path="received-simulations" element={<ReceivedSimulations />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
