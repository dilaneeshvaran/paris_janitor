import React from 'react';
import '../styles/property-item.css';
import { Property } from './types';

interface PropertyItemProps {
    property: Property;
    onModifyRoom: (property: Property) => void;
    onDeleteRoom: (id: number) => void;
    onViewReservations: (id: number) => void;
    onViewState: (id: number) => void;
}

const PropertyItem: React.FC<PropertyItemProps> = ({
    property,
    onModifyRoom,
    onDeleteRoom,
    onViewReservations,
    onViewState,
}) => {
    return (
        <li className="property-item">
            <img
                src={property.imageUrl}
                alt={property.name}
                className="property-item__image"
            />
            <div className="property-item__details">
                <div className="property-item__name">
                    {property.name}
                    {property.verified && (
                        <span className="property-item__verified">
                            (Vérifié)
                        </span>
                    )}
                </div>
                <div className="property-item__description">
                    {property.description}
                </div>
                <div className="property-item__address">
                    Addresse: {property.address}
                </div>
                <div className="property-item__price">
                    Prix: ${property.price}
                </div>
            </div>
            <button
                onClick={() => onModifyRoom(property)}
                className="property-item__button"
            >
                Modifier
            </button>
            <button
                onClick={() => onDeleteRoom(property.id)}
                className="property-item__button"
            >
                Supprimer
            </button>
            <button
                onClick={() => onViewReservations(property.id)}
                className="property-item__button"
            >
                Voir Réservations
            </button>
            <button
                onClick={() => onViewState(property.id)}
                className="property-item__button"
            >
                Voir L'état
            </button>
        </li>
    );
};

export default PropertyItem;
