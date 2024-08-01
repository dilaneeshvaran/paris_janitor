import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import '../styles/state.css';

interface Service {
    id: number;
    status: string;
    service_type: string;
    description: string;
}

interface PropertyStateModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    propertyId: number;
}

const PropertyStateModal: React.FC<PropertyStateModalProps> = ({ isOpen, onRequestClose, propertyId }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:3000/services/property/${propertyId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setServices(response.data);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchServices();
        }
    }, [isOpen, propertyId]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Property State Modal"
            className="property-state-modal"
            overlayClassName="property-state-modal__overlay"
        >
            <h2 className="property-state-modal__header">État de la propriété</h2>
            {loading ? (
                <p className="property-state-modal__loading">Chargement...</p>
            ) : (
                <table className="property-state-modal__table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Type de Service</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr key={service.id}>
                                <td>{service.status}</td>
                                <td>{service.service_type}</td>
                                <td>{service.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <button className="property-state-modal__close-button" onClick={onRequestClose}>Fermer</button>
        </Modal>
    );
};

export default PropertyStateModal;
