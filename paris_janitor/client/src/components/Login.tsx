import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/login.css';

const Login: React.FC = () => {
    const { userType } = useParams<{ userType: string }>();
    const navigate = useNavigate();

    const handleLogin = () => {
        if (userType === 'owner') {
            navigate('/dashboard/owner');
        } else if (userType === 'client') {
            navigate('/dashboard/client');
        }
    };

    return (
        <div className="center-content">
            <div>
                <h2>Login as {userType}</h2>
                <button onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
};

export default Login;