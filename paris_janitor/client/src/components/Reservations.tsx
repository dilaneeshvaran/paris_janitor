import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import '../styles/reservations.css';

interface Reservation {
    id: number;
    property_id: number;
    client_id: number;
    traveler_id: number;
    startDate: string;
    endDate: string;
    status: string;
}

interface ReservationsProps {
    userId: string;
    onClose: () => void;
}

const Reservations: React.FC<ReservationsProps> = ({ userId, onClose }) => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:3000/reservations/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (response.data && Array.isArray(response.data)) {
                    setReservations(response.data);
                } else {
                    setError('Failed to load reservations.');
                }
            })
            .catch(error => {
                console.error('Error fetching reservations:', error);
                setError('Failed to load reservations.');
            });
    }, [userId]);

    const generatePDF = (reservation: Reservation) => {
        const doc = new jsPDF();
        doc.text('Facture', 20, 20);
        (doc as any).autoTable({
            startY: 30,
            head: [['Property ID', 'Start Date', 'End Date', 'Status']],
            body: [
                [reservation.property_id.toString(), new Date(reservation.startDate).toLocaleDateString(), new Date(reservation.endDate).toLocaleDateString(), reservation.status],
            ],
        });
        doc.save(`facture_${reservation.id}.pdf`);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>Close</button>
                {error && <p className="error">{error}</p>}
                {reservations.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Property ID</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map(reservation => (
                                <tr key={reservation.id}>
                                    <td>{reservation.property_id}</td>
                                    <td>{new Date(reservation.startDate).toLocaleDateString()}</td>
                                    <td>{new Date(reservation.endDate).toLocaleDateString()}</td>
                                    <td>{reservation.status}</td>
                                    <td>
                                        <button onClick={() => generatePDF(reservation)}>Get Facture</button>
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

export default Reservations;
