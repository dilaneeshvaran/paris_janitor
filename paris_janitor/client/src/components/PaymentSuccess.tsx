import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const userRole = localStorage.getItem('role');

        const handleRedirect = () => {
            if (userRole === 'guest') {
                navigate('/dashboard/client');
            } else if (userRole === 'client') {
                navigate('/dashboard/owner');
            } else {
                console.error('User role not found in local storage');
            }
        };

        const timer = setTimeout(() => {
            handleRedirect();
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div>
            <h1>Vip Activé !</h1>
            <p>Redirection vers votre espace...</p>
        </div>
    );
};

export default PaymentSuccess;
