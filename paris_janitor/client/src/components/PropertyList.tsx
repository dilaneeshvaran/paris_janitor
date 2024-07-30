import React from 'react';
import PropertyItem from './PropertyItem';
import { Property } from './types';

interface PropertyListProps {
    properties: Property[];
    onModifyRoom: (property: Property) => void;
    onDeleteRoom: (id: number) => void;
    onViewReservations: (id: number) => void;
    onViewState: (id: number) => void; // New prop
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, onModifyRoom, onDeleteRoom, onViewReservations, onViewState }) => {
    return (
        <ul>
            {properties.length === 0 ? (
                <p>No properties found.</p>
            ) : (
                properties.map((property) => (
                    <PropertyItem
                        key={property.id}
                        property={property}
                        onModifyRoom={onModifyRoom}
                        onDeleteRoom={onDeleteRoom}
                        onViewReservations={onViewReservations}
                        onViewState={onViewState}
                    />
                ))
            )}
        </ul>
    );
};

export default PropertyList;
