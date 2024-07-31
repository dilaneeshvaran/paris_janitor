import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import '../styles/reservations.css';

export interface Reservation {
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
    const [selectedService, setSelectedService] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [currentReservationId, setCurrentReservationId] = useState<number | null>(null);

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
                    setError('Chargement des réservations échoué.');
                }
            })
            .catch(error => {
                console.error('Error fetching reservations:', error);
                setError('Chargement des réservations échoué. réessayer plus tard.');
            });
    }, [userId]);

    const generatePDF = (reservation: Reservation) => {
        const doc = new jsPDF();
        doc.text('Facture', 20, 20);
        (doc as any).autoTable({
            startY: 30,
            head: [['ID Propriété', 'Date Début', 'Date Fin', 'Status']],
            body: [
                [reservation.property_id.toString(), new Date(reservation.startDate).toLocaleDateString(), new Date(reservation.endDate).toLocaleDateString(), reservation.status],
            ],
        });
        doc.save(`facture_${reservation.id}.pdf`);
    };

    const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>, reservationId: number) => {
        setSelectedService(event.target.value);
        setCurrentReservationId(reservationId);
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    };

    const handleSubmitServiceDemand = () => {
        if (!selectedService || !description) {
            setError('Veilleez choisir un service et fournir une description.');
            return;
        }

        const token = localStorage.getItem('token');
        const serviceData = {
            reservation_id: currentReservationId,
            service_type: selectedService,
            price: 10,
            description: description,
        };

        axios.post('http://localhost:3000/services', serviceData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                console.log('Service demand submitted:', response.data);
                setSelectedService('');
                setDescription('');
                setError(null);
            })
            .catch(error => {
                console.error('Error submitting service demand:', error);
                setError('Soumission de demande échoué ! réessayer plus tard.');
            });
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>Fermer</button>
                {error && <p className="error">{error}</p>}
                {reservations.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>ID Propriété</th>
                                <th>Date Début</th>
                                <th>Date Fin</th>
                                <th>Status</th>
                                <th>Action</th>
                                <th>Service</th>
                                <th>Description</th>
                                <th>Valider</th>
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
                                        <button onClick={() => generatePDF(reservation)}>Avoir le devis</button>
                                    </td>
                                    <td>
                                        <select onChange={(event) => handleServiceChange(event, reservation.id)} value={currentReservationId === reservation.id ? selectedService : ''}>
                                            <option value="">Choisir le service</option>
                                            <option value="cleaning">Nettoyage</option>
                                            <option value="repair">Reparation</option>
                                            <option value="accessory">Accessoire</option>
                                            <option value="baggage">Baggage</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={currentReservationId === reservation.id ? description : ''}
                                            onChange={handleDescriptionChange}
                                            disabled={currentReservationId !== reservation.id}
                                        />
                                    </td>
                                    <td>
                                        <button onClick={handleSubmitServiceDemand}>Envoyer la demande</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Aucune réservation trouvé.</p>
                )}
            </div>
        </div>
    );
};

export default Reservations;
