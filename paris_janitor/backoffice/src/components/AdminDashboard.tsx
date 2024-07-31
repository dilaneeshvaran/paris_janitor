import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import '../styles/admin.css';

const AdminDashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <ul>
          <li>
            <Link to="manage-users">Manage Users</Link>
          </li>
          <li>
            <Link to="manage-properties">Manage Properties</Link>
          </li>
          <li>
            <Link to="received-simulations">Received Simulations</Link>
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
