import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/login.css';

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
    const [role, setRole] = useState(state?.role || 'guest'); // Default to 'guest'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Set the role from state if available
        if (state?.role) {
            setRole(state.role);
        }
    }, [state]);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match");
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
                setSuccess('Registered successfully. Now you need to login.');
                setError('');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    if (role == 'client') {
                        navigate('/login/owner');
                    } else {
                        navigate('/login/client');
                    }
                }, 3000);
            } else {
                setError(data.message || 'Registration failed');
                setSuccess('');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('An error occurred. Please try again.');
            setSuccess('');
        }
    };

    return (
        <div className="center-content">
            <div>
                <h2>Register</h2>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Last Name"
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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                Je suis un:
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="guest">Client</option>
                    <option value="client">Bailleur</option>
                </select>
                <button onClick={handleRegister}>Register</button>
            </div>
        </div>
    );
};

export default Register;
