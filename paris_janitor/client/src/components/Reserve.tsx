import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51PScAqGc0PhuZBe9Uqm7XP3iXPKio8QNqbt4iNfSINUE06VzAPldOUwEgVn94rLLmQKd8STxK6fj12YKwBeiMRbS00DCyPSNGY');

interface ReserveProps {
    propertyId: number;
    price: number;
    onClose: () => void;
}

const Reserve: React.FC<ReserveProps> = ({ propertyId, price, onClose }) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [disabledDates, setDisabledDates] = useState<Date[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:3000/availability/property/${propertyId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data && Array.isArray(data)) {
                    const dates = data.flatMap(item => {
                        const start = new Date(item.start_date);
                        const end = new Date(item.end_date);
                        const range = [];
                        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                            range.push(new Date(d));
                        }
                        return range;
                    });
                    setDisabledDates(dates);
                } else {
                    setError('Failed to format availability.');
                }
            })
            .catch(error => {
                setError('Failed to load availability.');
            });
    }, [propertyId]);

    const handleDateChange = (value: Date | Date[] | null, type: 'start' | 'end') => {
        if (Array.isArray(value)) {
            if (value.length > 0 && value[0] instanceof Date) {
                const date = value[0];
                if (type === 'start') {
                    setStartDate(date);
                } else {
                    setEndDate(date);
                }
            }
        } else if (value instanceof Date || value === null) {
            if (type === 'start') {
                setStartDate(value);
            } else {
                setEndDate(value);
            }
        }
    };

    const handleStartDateChange = (value: Date | Date[] | null | any) => handleDateChange(value, 'start');
    const handleEndDateChange = (value: Date | Date[] | null | any) => handleDateChange(value, 'end');

    useEffect(() => {
        if (startDate && endDate) {
            const days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1; // +1 to include end date
            setTotalPrice(days * price);
        }
    }, [startDate, endDate, price]);

    const handleSubmit = async () => {
        const stripe = await stripePromise;
        if (!stripe) {
            console.error('Stripe has not loaded.');
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            // First, create the reservation
            const reservationResponse = await fetch('http://localhost:3000/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    property_id: propertyId,
                    client_id: userId,
                    traveler_id: userId,
                    startDate: startDate?.toISOString(),
                    endDate: endDate?.toISOString(),
                }),
            });

            if (!reservationResponse.ok) {
                const data = await reservationResponse.json();
                alert(data.message || 'Failed to create reservation.');
                return;
            }

            // Parse the reservation response to get the reservation ID
            const reservationData = await reservationResponse.json();
            const reservationId = reservationData.id;

            // Then, create the payment
            const paymentResponse = await fetch('http://localhost:3000/api/payment/reservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: totalPrice,
                    userId,
                    clientId: userId,
                    reservationId: reservationId.toString(),
                }),
            });

            if (!paymentResponse.ok) {
                const data = await paymentResponse.json();
                alert(data.message || 'Failed to create Stripe Checkout session.');
                return;
            }

            // After successful payment, update the availability
            const availabilityResponse = await fetch('http://localhost:3000/availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    property_id: propertyId,
                    start_date: startDate?.toISOString(),
                    end_date: endDate?.toISOString(),
                    reservation_id: reservationId,
                }),
            });

            if (!availabilityResponse.ok) {
                const errorDetails = await availabilityResponse.json();
                console.error('Failed to update availability:', errorDetails);
                alert('Reservation created but failed to update availability.');
                return;
            }

            const { id } = await paymentResponse.json();
            const { error } = await stripe.redirectToCheckout({ sessionId: id });

            if (error) {
                console.error('Stripe Checkout error:', error);
                alert('Payment failed. Please try again.');
                return;
            }

            alert('Reservation and payment successful!');
            onClose();
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('An error occurred while processing the payment. Please try again.');
        }
    };

    const tileDisabled = ({ date }: { date: Date }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today || disabledDates.some(disabledDate =>
            disabledDate.toDateString() === date.toDateString());
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Reserve Property</h2>
                {error && <p className="error">{error}</p>}
                <Calendar
                    onChange={handleStartDateChange}
                    value={startDate}
                    tileDisabled={tileDisabled}
                />
                <Calendar
                    onChange={handleEndDateChange}
                    value={endDate}
                    tileDisabled={tileDisabled}
                />
                <p><strong>Total Price: </strong>${totalPrice.toFixed(2)}</p>
                <button onClick={handleSubmit} disabled={!startDate || !endDate}>
                    Proceed to Payment
                </button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Reserve;
