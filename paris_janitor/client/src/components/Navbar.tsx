import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import '../styles/navbar.css';

interface NavbarProps {
    openModal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ openModal }) => {
    const { isAuthenticated, userRole, logout } = useAuth();

    console.log('Navbar rendered, isAuthenticated:', isAuthenticated, 'userRole:', userRole);

    const navigate = useNavigate();

    console.log('Navbar rendered, isAuthenticated:', isAuthenticated, 'userRole:', userRole);

    const handleLogout = () => {
        console.log("Logout button clicked");
        logout();
        navigate(`/login/${userRole === 'guest' ? 'client' : 'owner'}`);
    };

    return (
        <nav>
            <Link to="/">Accueil</Link>
            {isAuthenticated ? (
                <>
                    {userRole === 'guest' && <Link to="/dashboard/client">Dashboard</Link>}
                    {userRole === 'client' && <Link to="/dashboard/owner">Dashboard</Link>}
                    <button onClick={handleLogout}>Se Déconnecter</button>
                </>
            ) : (
                <>
                    <Link to="/login/owner">Espace bailleur</Link>
                    <Link to="/login/client">Espace client</Link>
                    <button onClick={openModal}>Simulation Devis</button>
                </>
            )}
        </nav>
    );
};

export default Navbar;
