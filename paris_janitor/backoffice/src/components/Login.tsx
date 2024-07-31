import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/users/login', { email, password });
            const { token, role } = response.data;
            if (role === 'admin') {
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                navigate('/admin/manage-users');
            } else {
                alert('Vous n\'avez pas les droits pour accéder à cette page');
            }
        } catch (error) {
            console.error('Login error', error);
            alert('Login failed');
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Login</h2>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Mot de passe:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
