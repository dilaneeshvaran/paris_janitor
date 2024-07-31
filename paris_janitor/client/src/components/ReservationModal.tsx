import React, { useEffect, useState } from 'react';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { Reservation } from './types';

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: number;
}

const SERVICE_ID = import.meta.env.VITE_REACT_APP_EMAILJS_SERVICE_ID!;
const TEMPLATE_ID = import.meta.env.VITE_REACT_APP_EMAILJS_TEMPLATE_ID!;
const PUBLIC_KEY = import.meta.env.VITE_REACT_APP_EMAILJS_PUBLIC_KEY!;

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, propertyId }) => {
    const [reservations, setReservations] = useState<Reservation[]>([]);

    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:3000/reservations/property/${propertyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    const futureReservations = response.data.filter((reservation: Reservation) =>
                        new Date(reservation.endDate) > new Date()
                    );
                    setReservations(futureReservations);
                })
                .catch(error => {
                    console.error('Error fetching reservations:', error);
                });
        }
    }, [isOpen, propertyId]);

    const handleCancelReservation = async (reservationId: number) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const reservationResponse = await axios.get(`http://localhost:3000/reservations/${reservationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const clientId = reservationResponse.data.client_id;
            const propertyId = reservationResponse.data.property_id;

            const propertyRes = await axios.get(`http://localhost:3000/properties/${propertyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const userResponse = await axios.get(`http://localhost:3000/users/${clientId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const userEmail = userResponse.data.email;
            const userName = userResponse.data.firstname + ' ' + userResponse.data.lastname;
            const propertyName = propertyRes.data.name;

            console.log('User email:', userEmail);

            await axios.delete(`http://localhost:3000/reservations/${reservationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setReservations(prevReservations =>
                prevReservations.filter(reservation => reservation.id !== reservationId)
            );

            const templateParams = {
                name: userName,
                user_email: userEmail,
                message: `Votre reservation de ${propertyName} a été annulé.`
            };

            emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
                .then(() => {
                    console.log('Email sent successfully');
                })
                .catch((error: any) => {
                    console.error('Failed to send email:', error);
                });

        } catch (error) {
            console.error('Error canceling reservation:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>Close</button>
                <h3>Reservations</h3>
                {reservations.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map(reservation => (
                                <tr key={reservation.id}>
                                    <td>{reservation.client_id}</td>
                                    <td>{new Date(reservation.startDate).toLocaleDateString()}</td>
                                    <td>{new Date(reservation.endDate).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => handleCancelReservation(reservation.id)}>
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No reservations found.</p>
                )}
            </div>
        </div>
    );
};

export default ReservationModal;
