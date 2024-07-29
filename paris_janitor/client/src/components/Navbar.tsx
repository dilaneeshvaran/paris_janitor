import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import '../styles/navbar.css';
const Navbar: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();

    console.log('Navbar rendered, isAuthenticated:', isAuthenticated);

    return (
        <nav>
            <Link to="/">Accueil</Link>
            {isAuthenticated ? (
                <>
                    <Link to="/dashboard/client">Dashboard</Link>
                    <button onClick={() => {
                        console.log("Logout button clicked");
                        logout();
                    }}>Se Déconnecter</button>
                </>
            ) : (
                <>
                    <Link to="/login/owner">Se Connecter en tant que bailleur</Link>
                    <Link to="/login/client">Se Connecter en tant que client</Link>
                </>
            )}
        </nav>
    );
};


export default Navbar;
