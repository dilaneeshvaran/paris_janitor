import React, { useEffect, useState } from 'react';
import '../styles/client.css';
import Reserve from './Reserve';

interface Property {
    id: number;
    name: string;
    description: string;
    price: number;
}

const ClientDashboard: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            <div className="properties-list">
                {properties.length > 0 ? (
                    properties.map(property => (
                        <div key={property.id} className="property-item">
                            <h3>{property.name}</h3>
                            <p>{property.description}</p>
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
        </div>
    );
};

export default ClientDashboard;
