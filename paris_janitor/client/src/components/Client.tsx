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
            <div className="client-dashboard-buttons">
                <button onClick={() => setShowReservations(true)}>Mes Réservations</button>
                <button onClick={() => setShowEditProfile(true)}>Modifier Profil</button>
                <button onClick={() => setIsVipModalOpen(true)}>Vérifier Status VIP</button>
                <button onClick={() => setShowServices(true)}>Voir les Services</button>
            </div>
            <div className="properties-list-c">
                {properties.length > 0 ? (
                    properties.map(property => (
                        <div key={property.id} className="property-item-c">
                            <div className="property-img-wrapper-c">
                                <img className="img-reserve-c" src={property.imageUrl} alt={property.name} />
                            </div>
                            <div className="property-info-c">
                                <h3>{property.name}</h3>
                                <p>{property.description}</p>
                                <p className="property-price-c">Price: ${property.price}</p>
                                <button className="reserve-button-c" onClick={() => setSelectedProperty(property)}>Réserver</button>
                            </div>
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
