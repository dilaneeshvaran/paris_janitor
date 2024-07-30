import React from 'react';
import { Property } from './types';

interface PropertyItemProps {
    property: Property;
    onModifyRoom: (property: Property) => void;
    onDeleteRoom: (id: number) => void;
    onViewReservations: (id: number) => void;
}

const PropertyItem: React.FC<PropertyItemProps> = ({ property, onModifyRoom, onDeleteRoom, onViewReservations }) => {
    return (
        <li style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <img src={property.imageUrl} alt={property.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
            <div style={{ flexGrow: 1 }}>
                <div>{property.name} {property.verified && <span style={{ color: 'green' }}>(Verified)</span>}</div>
                <div>{property.description}</div>
                <div>Address: {property.address}</div>
                <div>Price: ${property.price}</div>
            </div>
            <button onClick={() => onModifyRoom(property)} style={{ marginRight: '5px' }}>Modify</button>
            <button onClick={() => onDeleteRoom(property.id)} style={{ marginRight: '5px' }}>Delete</button>
            <button onClick={() => onViewReservations(property.id)}>View Reservations</button>
        </li>
    );
};

export default PropertyItem;
