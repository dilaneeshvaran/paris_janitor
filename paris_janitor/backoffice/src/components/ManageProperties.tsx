import React, { useState, useEffect } from 'react';
import '../styles/manage-properties.css';

interface Property {
    id: number;
    name: string;
    description: string;
    address: string;
    price: number;
    owner_id: number;
    imageUrl: string;
    verified: boolean;
}

interface Reservation {
    id: number;
    property_id: number;
    client_id: number;
    traveler_id: number;
    startDate: string;
    endDate: string;
    status: string;
}


const ManageProperties: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [reservations, setReservations] = useState<{ [key: number]: Reservation[] }>({});
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch('http://localhost:3000/properties', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.properties && Array.isArray(data.properties)) {
                    setProperties(data.properties);
                } else {
                    console.error('Data is not in expected format', data);
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }, [token]);

    const handleVerifyClick = (propertyId: number, verified: boolean) => {
        fetch(`http://localhost:3000/properties/${propertyId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ verified: !verified })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(() => {
            setProperties(properties.map(property =>
                property.id === propertyId ? { ...property, verified: !verified } : property
            ));
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    };


    const handleViewReservationsClick = (propertyId: number) => {
        fetch(`http://localhost:3000/reservations/property/${propertyId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setReservations(prevState => ({ ...prevState, [propertyId]: data }));
                } else {
                    console.error('Data is not in expected format', data);
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    };

    return (
        <div className="manage-properties">
            <h2>Manager Propriétés</h2>
            <table className="manage-properties-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Lieu</th>
                        <th>Vérifié</th>
                        <th>Actions</th>
                        <th>Réservations</th>
                    </tr>
                </thead>
                <tbody>
                    {properties.map(property => (
                        <tr key={property.id}>
                            <td>{property.id}</td>
                            <td>{property.name}</td>
                            <td>{property.address}</td>
                            <td>{property.verified ? 'Oui' : 'Non'}</td>
                            <td>
                                <button onClick={() => handleVerifyClick(property.id, property.verified)}>
                                    {property.verified ? 'Ne Pas Vérifier' : 'Verifier'}
                                </button>
                            </td>
                            <td>
                                <button onClick={() => handleViewReservationsClick(property.id)}>
                                    Voir Réservations
                                </button>
                                {reservations[property.id] && (
                                    <ul>
                                        {reservations[property.id].map(reservation => (
                                            <li key={reservation.id}>
                                                {new Date(reservation.startDate).toLocaleDateString()} à {new Date(reservation.endDate).toLocaleDateString()} - {reservation.status}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageProperties;
