import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import '../styles/navbar.css';

interface NavbarProps {
    openModal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ openModal }) => {
    const { isAuthenticated, userRole, logout } = useAuth();

    console.log('Navbar rendered, isAuthenticated:', isAuthenticated, 'userRole:', userRole);

    const handleLogout = () => {
        console.log("Logout button clicked");
        logout();
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
                    <button onClick={openModal}>Open Simulation Modal</button>

                </>
            )}
        </nav>
    );
};

export default Navbar;
