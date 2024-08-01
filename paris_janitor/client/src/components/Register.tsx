import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/register.css';

interface LocationState {
    role?: string;
}

const Register: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(state?.role || 'guest');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (state?.role) {
            setRole(state.role);
        }
    }, [state]);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError("Mot de passe ne concorde pas");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstname, lastname, email, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Inscription succès ! maintenant vous pouvez vous login.');
                setError('');

                setTimeout(() => {
                    if (role == 'client') {
                        navigate('/login/owner');
                    } else {
                        navigate('/login/client');
                    }
                }, 3000);
            } else {
                setError(data.message || 'Inscription échoué');
                setSuccess('');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Erreur serveur ! Réessayer plus tard.');
            setSuccess('');
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>S'inscrire</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <input
                    type="text"
                    placeholder="Nom"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Prénom"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirmer mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                Je suis un:
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="guest">Client</option>
                    <option value="client">Bailleur</option>
                </select>
                <button onClick={handleRegister}>S'inscrire</button>
            </div>
        </div>
    );
};

export default Register;
