import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar: React.FC = () => {
    return (
        <nav>
            <Link to="/">Accueil</Link>
            <Link to="/login/owner">Se Connecter en tant que bailleur</Link>
            <Link to="/login/client">Se Connecter en tant que client</Link>
        </nav>
    );
};

export default Navbar;
