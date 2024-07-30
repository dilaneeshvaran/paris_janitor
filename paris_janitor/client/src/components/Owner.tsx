import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyList from './PropertyList';
import PropertyModal from './PropertyModal';
import { Property } from './types';

const OwnerDashboard: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [availabilityDates, setAvailabilityDates] = useState<Date[]>([]);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (userId && token) {
            axios.get(`http://localhost:3000/properties/owner/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    setProperties(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the properties!', error);
                });
        } else {
            console.error('User ID or token not found in local storage');
        }
    }, []);

    const handleModifyRoom = (property: Property) => {
        setSelectedProperty(property);
        setIsUpdateModalOpen(true);
    };

    const handleDeleteRoom = (id: number) => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.delete(`http://localhost:3000/properties/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(() => {
                    setProperties(properties.filter(property => property.id !== id));
                })
                .catch(error => {
                    console.error('Error deleting room:', error);
                });
        }
    };

    const handleViewReservations = (id: number) => {
        console.log(`View reservations for room ID: ${id}`);
    };

    return (
        <div>
            <button onClick={() => setIsCreateModalOpen(true)}>Ajouter</button>
            <h3>Propriétés</h3>
            <PropertyList
                properties={properties}
                onModifyRoom={handleModifyRoom}
                onDeleteRoom={handleDeleteRoom}
                onViewReservations={handleViewReservations}
            />
            {isCreateModalOpen && (
                <PropertyModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    setProperties={setProperties}
                    availabilityDates={availabilityDates}
                    setAvailabilityDates={setAvailabilityDates}
                />
            )}
            {isUpdateModalOpen && selectedProperty && (
                <PropertyModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    property={selectedProperty}
                    setProperties={setProperties}
                    availabilityDates={availabilityDates}
                    setAvailabilityDates={setAvailabilityDates}
                />
            )}
        </div>
    );
};

export default OwnerDashboard;
