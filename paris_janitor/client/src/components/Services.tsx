import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import '../styles/services.css';

const stripePromise = loadStripe('pk_test_51PScAqGc0PhuZBe9Uqm7XP3iXPKio8QNqbt4iNfSINUE06VzAPldOUwEgVn94rLLmQKd8STxK6fj12YKwBeiMRbS00DCyPSNGY');

interface Service {
    id: number;
    description: string;
    service_type: string;
    price: number;
    provider_id: number;
    reservation_id: number;
    status: "pending" | "completed" | "accepted" | "cancelled";
}

interface ServicesProps {
    userId: string;
    onClose: () => void;
}

const Services: React.FC<ServicesProps> = ({ userId, onClose }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [propertyNames, setPropertyNames] = useState<{ [key: number]: string }>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch(`http://localhost:3000/services/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setServices(data);
                    //nom propriete
                    data.forEach((service: Service) => {
                        fetch(`http://localhost:3000/properties/service/${service.reservation_id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        })
                            .then(res => res.json())
                            .then(propertyData => {
                                if (Array.isArray(propertyData) && propertyData.length > 0) {
                                    setPropertyNames(prevNames => ({
                                        ...prevNames,
                                        [service.reservation_id]: propertyData[0].name,
                                    }));
                                }
                            })
                            .catch(err => console.error('Error fetching property data:', err));
                    });
                } else {
                    console.error('Unexpected data format:', data);
                    setError('Chargement de service échoué.');
                }
            })
            .catch(error => {
                console.error('Error fetching services:', error);
                setError('Chargement de service échoué. réessayer plus tard');
            });
    }, [userId]);

    const handleProceedPayment = async (service: Service) => {
        const stripe = await stripePromise;
        if (!stripe) {
            console.error('Stripe has not loaded.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const paymentResponse = await fetch('http://localhost:3000/api/payment/reservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: service.price,
                    userId,
                    clientId: userId,
                }),
            });

            if (!paymentResponse.ok) {
                const data = await paymentResponse.json();
                alert(data.message || 'Checkout échoué.');
                return;
            }

            const { id } = await paymentResponse.json();
            const { error } = await stripe.redirectToCheckout({ sessionId: id });

            if (error) {
                console.error('Stripe Checkout error:', error);
                alert('Paiement échoué, réessayer.');
                return;
            }

            alert('Payment effectué!');
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Paiement échoué, réessayer plus tard.');
        }
    };

    return (
        <div className="services-modal">
            <div className="services-modal-content">
                <button className="close-button" onClick={onClose}>Fermer</button>
                {error && <p className="error">{error}</p>}
                {services.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Propriété</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Prix</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id}>
                                    <td>{propertyNames[service.reservation_id] || 'Chargement...'}</td>
                                    <td>{service.description}</td>
                                    <td>{service.service_type}</td>
                                    <td>${service.price}</td>
                                    <td>{service.status}</td>
                                    <td>
                                        <button
                                            onClick={() => handleProceedPayment(service)}
                                            disabled={service.status !== 'accepted'}
                                        >
                                            Payer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Aucun Service Trouvé.</p>
                )}
            </div>
        </div>
    );
};

export default Services;
