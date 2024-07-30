import React from 'react';
import { Property } from './Owner';

interface PropertyListProps {
    properties: Property[];
    onModify: (property: Property) => void;
    onDelete: (id: number) => void;
    onViewReservations: (id: number) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, onModify, onDelete, onViewReservations }) => {
    return (
        <ul>
            {properties.map((property) => (
                <li key={property.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <img src={property.imageUrl} alt={property.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
                    <div style={{ flexGrow: 1 }}>
                        <div>{property.name} {property.verified && <span style={{ color: 'green' }}>(Verified)</span>}</div>
                        <div>{property.description}</div>
                        <div>Address: {property.address}</div>
                        <div>Price: ${property.price}</div>
                        <div>Availability: {property.availabilityCalendar}</div>
                    </div>
                    <button onClick={() => onModify(property)} style={{ marginRight: '5px' }}>Modify</button>
                    <button onClick={() => onDelete(property.id)} style={{ marginRight: '5px' }}>Delete</button>
                    <button onClick={() => onViewReservations(property.id)}>View Reservations</button>
                </li>
            ))}
        </ul>
    );
};

export default PropertyList;
