import React from 'react';
import PropertyItem from './PropertyItem';
import { Property } from './types';
import '../styles/property-list.css';

interface PropertyListProps {
    properties: Property[];
    onModifyRoom: (property: Property) => void;
    onDeleteRoom: (id: number) => void;
    onViewReservations: (id: number) => void;
    onViewState: (id: number) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
    properties,
    onModifyRoom,
    onDeleteRoom,
    onViewReservations,
    onViewState,
}) => {
    return (
        <ul className="property-list">
            {properties.length === 0 ? (
                <p className="property-list__empty-message">
                    Aucun propriété trouvé.
                </p>
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
