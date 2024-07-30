import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyList from './PropertyList';
import PropertyModal from './PropertyModal';
import VipStatusModal from './VipStatusModal'; // Import the VIP Status Modal
import ReservationModal from './ReservationModal'; // Import the Reservation Modal
import EditProfile from './EditProfile'; // Import the EditProfile component
import PropertyStateModal from './PropertyStateModal'; // Import the PropertyStateModal
import { Property } from './types';

const OwnerDashboard: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [availabilityDates, setAvailabilityDates] = useState<Date[]>([]);
    const [isVipModalOpen, setIsVipModalOpen] = useState<boolean>(false);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState<boolean>(false);
    const [viewingPropertyId, setViewingPropertyId] = useState<number | null>(null);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false); // State for EditProfile modal
    const [isStateModalOpen, setIsStateModalOpen] = useState<boolean>(false); // State for PropertyStateModal
    const [viewingStatePropertyId, setViewingStatePropertyId] = useState<number | null>(null); // ID for PropertyStateModal

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
        setViewingPropertyId(id);
        setIsReservationModalOpen(true);
    };

    const handleViewState = (id: number) => {
        setViewingStatePropertyId(id);
        setIsStateModalOpen(true);
    };

    const handleEditProfile = () => {
        setIsEditProfileModalOpen(true);
    };

    return (
        <div>
            <div>
                <button onClick={() => setIsVipModalOpen(true)}>Check VIP Status</button>
                <button onClick={handleEditProfile}>Edit Profile</button>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)}>Ajouter</button>
            <h3>Propriétés</h3>
            <PropertyList
                properties={properties}
                onModifyRoom={handleModifyRoom}
                onDeleteRoom={handleDeleteRoom}
                onViewReservations={handleViewReservations}
                onViewState={handleViewState} // Pass the new handler
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
            {isVipModalOpen && (
                <VipStatusModal
                    isOpen={isVipModalOpen}
                    onRequestClose={() => setIsVipModalOpen(false)}
                    userId={parseInt(localStorage.getItem('userId') || '0', 10)}
                />
            )}
            {isReservationModalOpen && viewingPropertyId !== null && (
                <ReservationModal
                    isOpen={isReservationModalOpen}
                    onClose={() => setIsReservationModalOpen(false)}
                    propertyId={viewingPropertyId}
                />
            )}
            {isStateModalOpen && viewingStatePropertyId !== null && (
                <PropertyStateModal
                    isOpen={isStateModalOpen}
                    onRequestClose={() => setIsStateModalOpen(false)}
                    propertyId={viewingStatePropertyId}
                />
            )}
            {isEditProfileModalOpen && (
                <EditProfile
                    userId={localStorage.getItem('userId') || ''}
                    onClose={() => setIsEditProfileModalOpen(false)}
                />
            )}
        </div>
    );
};

export default OwnerDashboard;
