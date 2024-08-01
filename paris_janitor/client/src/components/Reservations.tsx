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

interface Property {
    id: number;
    name: string;
}

interface ReservationsProps {
    userId: string;
    onClose: () => void;
}

const Reservations: React.FC<ReservationsProps> = ({ userId, onClose }) => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [properties, setProperties] = useState<{ [key: number]: Property }>({});
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
                    fetchPropertyDetails(response.data);
                } else {
                    setError('Chargement des réservations échoué.');
                }
            })
            .catch(error => {
                console.error('Error fetching reservations:', error);
                setError('Chargement des réservations échoué. Réessayer plus tard.');
            });
    }, [userId]);

    const fetchPropertyDetails = (reservations: Reservation[]) => {
        const token = localStorage.getItem('token');
        const propertyIds = Array.from(new Set(reservations.map(reservation => reservation.property_id)));
        const propertyRequests = propertyIds.map(id =>
            axios.get(`http://localhost:3000/properties/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
        );

        Promise.all(propertyRequests)
            .then(responses => {
                const propertiesMap: { [key: number]: Property } = {};
                responses.forEach(response => {
                    const property: Property = response.data;
                    propertiesMap[property.id] = property;
                });
                setProperties(propertiesMap);
            })
            .catch(error => {
                console.error('Error fetching property details:', error);
                setError('Chargement des détails des propriétés échoué.');
            });
    };

    const generatePDF = (reservation: Reservation) => {
        const doc = new jsPDF();
        doc.text('Facture', 20, 20);
        (doc as any).autoTable({
            startY: 30,
            head: [['Propriété', 'Date Début', 'Date Fin', 'Status']],
            body: [
                [properties[reservation.property_id]?.name || '', new Date(reservation.startDate).toLocaleDateString(), new Date(reservation.endDate).toLocaleDateString(), reservation.status],
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
            setError('Veuillez choisir un service et fournir une description.');
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
                setError('Soumission de demande échoué ! Réessayer plus tard.');
            });
    };

    const handleCancelReservation = (reservationId: number) => {
        const token = localStorage.getItem('token');

        axios.delete(`http://localhost:3000/reservations/${reservationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                return axios.delete(`http://localhost:3000/availability/reservation/${reservationId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            })
            .then(() => {
                setReservations(reservations.filter(reservation => reservation.id !== reservationId));
                setError(null);
            })
            .catch(error => {
                console.error('Error cancelling reservation:', error);
                setError('Annulation de la réservation échoué. Réessayer plus tard.');
            });
    };

    return (
        <div className="reservations-modal">
            <div className="reservations-modal__content">
                <button className="reservations-modal__close-button" onClick={onClose}>Fermer</button>
                {error && <p className="reservations-modal__error">{error}</p>}
                {reservations.length > 0 ? (
                    <table className="reservations-modal__table">
                        <thead>
                            <tr>
                                <th>Propriété</th>
                                <th>Date Début</th>
                                <th>Date Fin</th>
                                <th>Status</th>
                                <th>Action</th>
                                <th>Service</th>
                                <th>Description</th>
                                <th>Valider</th>
                                <th>Annuler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map(reservation => {
                                const startDate = new Date(reservation.startDate);
                                const endDate = new Date(reservation.endDate);
                                const now = new Date();

                                return (
                                    <tr key={reservation.id}>
                                        <td>{properties[reservation.property_id]?.name || 'Chargement...'}</td>
                                        <td>{startDate.toLocaleDateString()}</td>
                                        <td>{endDate.toLocaleDateString()}</td>
                                        <td>{reservation.status}</td>
                                        <td>
                                            <button className="reservations-modal__button" onClick={() => generatePDF(reservation)}>Avoir le devis</button>
                                        </td>
                                        <td>
                                            <select
                                                className="reservations-modal__select"
                                                onChange={(event) => handleServiceChange(event, reservation.id)}
                                                value={currentReservationId === reservation.id ? selectedService : ''}
                                            >
                                                <option value="">Choisir le service</option>
                                                <option value="cleaning">Nettoyage</option>
                                                <option value="repair">Réparation</option>
                                                <option value="accessory">Accessoire</option>
                                                <option value="baggage">Bagage</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                className="reservations-modal__input"
                                                type="text"
                                                placeholder="Description"
                                                value={currentReservationId === reservation.id ? description : ''}
                                                onChange={handleDescriptionChange}
                                                disabled={currentReservationId !== reservation.id}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="reservations-modal__button"
                                                onClick={handleSubmitServiceDemand}
                                                disabled={endDate < now}
                                            >
                                                Envoyer la demande
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="reservations-modal__button"
                                                onClick={() => handleCancelReservation(reservation.id)}
                                                disabled={startDate <= now}
                                            >
                                                Annuler
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p>Aucune réservation trouvée.</p>
                )}
            </div>
        </div>
    );
};

export default Reservations;
