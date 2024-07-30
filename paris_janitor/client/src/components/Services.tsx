import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Load your Stripe public key
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

        // Fetch services
        fetch(`http://localhost:3000/services/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setServices(data);
                    // Fetch property names for each service
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
                    setError('Failed to load services.');
                }
            })
            .catch(error => {
                console.error('Error fetching services:', error);
                setError('Failed to load services.');
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

            // Create the payment for the service
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
                alert(data.message || 'Failed to create Stripe Checkout session.');
                return;
            }

            const { id } = await paymentResponse.json();
            const { error } = await stripe.redirectToCheckout({ sessionId: id });

            if (error) {
                console.error('Stripe Checkout error:', error);
                alert('Payment failed. Please try again.');
                return;
            }

            alert('Payment successful!');
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('An error occurred while processing the payment. Please try again.');
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>Close</button>
                {error && <p className="error">{error}</p>}
                {services.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id}>
                                    <td>{propertyNames[service.reservation_id] || 'Loading...'}</td>
                                    <td>{service.description}</td>
                                    <td>{service.service_type}</td>
                                    <td>${service.price}</td>
                                    <td>{service.status}</td>
                                    <td>
                                        <button
                                            onClick={() => handleProceedPayment(service)}
                                            disabled={service.status !== 'accepted'}
                                        >
                                            Proceed Payment
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No services found.</p>
                )}
            </div>
        </div>
    );
};

export default Services;
