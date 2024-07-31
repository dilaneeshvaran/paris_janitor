import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import '../styles/login.css';


const Login: React.FC = () => {
    const { userType } = useParams<{ userType: string }>();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                const { token, userId, role } = data;

                if (!role || !userId) {
                    setError('Réponse serveur invalide.');
                    return;
                }

                let allowedRole = '';
                if (userType === 'client') {
                    allowedRole = 'guest';
                } else if (userType === 'owner') {
                    allowedRole = 'client';
                }

                if (role !== allowedRole) {
                    setError(`Seuls ${allowedRole}s sont autorisé dans cet espace.`);
                    return;
                }

                login(token, userId, role);

                if (role === 'guest') {
                    navigate('/dashboard/client');
                } else if (role === 'client') {
                    navigate('/dashboard/owner');
                }
            } else {
                setError(data.message || 'Login échoué');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Erreur serveur! réessayer.');
        }
    };

    const handleRegisterClick = () => {
        let role = '';
        if (userType === 'client') {
            role = 'guest';
        } else if (userType === 'owner') {
            role = 'client';
        }
        navigate('/register', { state: { role } });
    };

    return (
        <div className="center-content">
            <div>
                <h2>Login en tant que {userType}</h2>
                {error && <p className="error">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin}>Login</button>
                <button onClick={handleRegisterClick}>S'inscrire</button>
            </div>
        </div>
    );
};

export default Login;