import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import '../styles/admin.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <ul>
          <li>
            <Link to="manage-users">Manager Users</Link>
          </li>
          <li>
            <Link to="manage-properties">Manager Propriété</Link>
          </li>
          <li>
            <Link to="received-simulations">Simulations Devis</Link>
          </li>
          <li>
            <Link to="services">Services</Link>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-button">Déconnexion</button>
          </li>
        </ul>
      </nav>
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
