import React, { useEffect, useState } from 'react';
import '../styles/client.css';
import Reserve from './Reserve';
import Reservations from './Reservations';
import EditProfile from './EditProfile';
import VipStatusModal from './VipStatusModal';
import Services from './Services';

interface Property {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

const ClientDashboard: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [showReservations, setShowReservations] = useState<boolean>(false);
    const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
    const [isVipModalOpen, setIsVipModalOpen] = useState<boolean>(false);
    const [showServices, setShowServices] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const userId = localStorage.getItem('userId') || '';

    useEffect(() => {
        fetch('http://localhost:3000/properties/verified')
            .then(response => response.json())
            .then(data => {
                if (data && Array.isArray(data.properties)) {
                    setProperties(data.properties);
                } else {
                    console.error('Unexpected data format:', data);
                    setError('Failed to load properties.');
                }
            })
            .catch(error => {
                console.error('Error fetching properties:', error);
                setError('Failed to load properties.');
            });
    }, []);

    return (
        <div className="client-dashboard">
            {error && <p className="error">{error}</p>}
            <button onClick={() => setShowReservations(true)}>My Reservations</button>
            <button onClick={() => setShowEditProfile(true)}>Edit Profile</button>
            <button onClick={() => setIsVipModalOpen(true)}>Check VIP Status</button>
            <button onClick={() => setShowServices(true)}>View Services</button>
            <div className="properties-list">
                {properties.length > 0 ? (
                    properties.map(property => (
                        <div key={property.id} className="property-item">
                            <h3>{property.name}</h3>
                            <p>{property.description}</p>
                            <p>Price: ${property.price}</p>
                            <img className='img-reserve' src={property.imageUrl} alt={property.name} />
                            <button onClick={() => setSelectedProperty(property)}>Reserve</button>
                        </div>
                    ))
                ) : (
                    <p>No properties available.</p>
                )}
            </div>
            {selectedProperty && (
                <Reserve
                    propertyId={selectedProperty.id}
                    price={selectedProperty.price}
                    onClose={() => setSelectedProperty(null)}
                />
            )}
            {showReservations && (
                <Reservations
                    userId={userId}
                    onClose={() => setShowReservations(false)}
                />
            )}
            {showEditProfile && (
                <EditProfile
                    userId={userId}
                    onClose={() => setShowEditProfile(false)}
                />
            )}
            {isVipModalOpen && (
                <VipStatusModal
                    isOpen={isVipModalOpen}
                    onRequestClose={() => setIsVipModalOpen(false)}
                    userId={parseInt(userId, 10)}
                />
            )}
            {showServices && (
                <Services
                    userId={userId}
                    onClose={() => setShowServices(false)}
                />
            )}
        </div>
    );
};

export default ClientDashboard;
