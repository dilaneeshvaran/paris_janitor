import React, { useState, useEffect } from 'react';
import '../styles/home.css';

interface Property {
    id: number;
    name: string;
    address: string;
    price: number;
    imageUrl: string;
    description: string;
}

const Home: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    useEffect(() => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzIyMjcwOTE0LCJleHAiOjE3MjIyNzQ1MTR9.mUIVb-PaIdeSPch5hMheOOZnPGf818gv9Yoc1TT_IXU';

        fetch('http://localhost:3000/properties', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log('Fetched data:', data); // Log the fetched data
                if (data && Array.isArray(data.properties)) {
                    setProperties(data.properties);
                } else {
                    console.error('Unexpected data format:', data);
                }
            })
            .catch(error => console.error('Error fetching properties:', error));
    }, []);

    const handleItemClick = (property: Property) => {
        setSelectedProperty(property);
    };

    const handleCloseModal = () => {
        setSelectedProperty(null);
    };

    return (
        <div className="container">
            <ul className="property-list">
                {properties.map(property => (
                    <li key={property.id} onClick={() => handleItemClick(property)}>
                        <h2>{property.name}</h2>
                        <img src={property.imageUrl} alt={property.name} />
                    </li>
                ))}
            </ul>

            {selectedProperty && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={handleCloseModal}>&times;</span>
                        <h2>{selectedProperty.name}</h2>
                        <img src={selectedProperty.imageUrl} alt={selectedProperty.name} />
                        <p>{selectedProperty.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
