import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/property-modal.css';
import AvailabilityPicker from './AvailabilityPicker';
import { Property } from './types';

interface PropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    property?: Property;
    setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
    availabilityDates: Date[];
    setAvailabilityDates: React.Dispatch<React.SetStateAction<Date[]>>;
}

const PropertyModal: React.FC<PropertyModalProps> = ({
    isOpen,
    onClose,
    property,
    setProperties,
    availabilityDates,
    setAvailabilityDates,
}) => {
    const [formData, setFormData] = useState<Omit<Property, 'id' | 'verified'>>({
        name: property ? property.name : '',
        description: property ? property.description : '',
        address: property ? property.address : '',
        price: property ? property.price : 0,
        imageUrl: property ? property.imageUrl : ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (property) {
            setFormData({
                name: property.name,
                description: property.description,
                address: property.address,
                price: property.price,
                imageUrl: property.imageUrl
            });
        }
    }, [property]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: name === 'price' ? parseFloat(value) : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const saveAvailabilityDates = async (propertyId: number) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const existingDates = await fetchExistingAvailabilityDates(propertyId);
                const existingDatesStrings = existingDates.map((date: { start_date: string }) => new Date(date.start_date).toDateString());

                for (const date of availabilityDates) {
                    const { start_date, end_date } = formatAvailabilityDate(date);
                    if (!existingDatesStrings.includes(new Date(start_date).toDateString())) {
                        await axios.post(`http://localhost:3000/availability`, {
                            property_id: propertyId,
                            start_date,
                            end_date
                        }, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error saving availability dates:', error);
            }
        }
    };

    const fetchExistingAvailabilityDates = async (propertyId: number) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get(`http://localhost:3000/availability/property/${propertyId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching existing availability dates:', error);
                return [];
            }
        }
        return [];
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return;

        let imageUrl = formData.imageUrl;
        if (selectedFile) {
            const formData = new FormData();
            formData.append('image', selectedFile);
            try {
                const response = await axios.post('http://localhost:3000/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
                imageUrl = response.data.imageUrl;
            } catch (error) {
                console.error('Error uploading image:', error);
                return;
            }
        }

        const propertyData = {
            ...formData,
            owner_id: userId,
            verified: false,
            imageUrl
        };

        try {
            if (property) {
                const response = await axios.patch(`http://localhost:3000/properties/${property.id}`, propertyData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                await saveAvailabilityDates(property.id);
                setProperties(prevProperties => prevProperties.map(p => p.id === property.id ? response.data : p));
            } else {
                const response = await axios.post('http://localhost:3000/properties', propertyData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const newPropertyId = response.data.id;
                await saveAvailabilityDates(newPropertyId);
                setProperties(prevProperties => [...prevProperties, response.data]);
            }
            onClose();
            setAvailabilityDates([]);
        } catch (error) {
            console.error('Error saving property:', error);
        }
    };

    const formatAvailabilityDate = (date: Date) => {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        return {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        };
    };

    return (
        isOpen && (
            <div className="property-modal__overlay">
                <div className="property-modal__content">
                    <span className="property-modal__close-button" onClick={onClose}>&times;</span>
                    <h2 className="property-modal__title">{property ? 'Mettre à jour' : 'Créer'}</h2>
                    <input
                        className="property-modal__input"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nom"
                    />
                    <input
                        className="property-modal__input"
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Description"
                    />
                    <input
                        className="property-modal__input"
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Addresse"
                    />
                    <input
                        className="property-modal__input"
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Prix"
                    />
                    <input
                        className="property-modal__input"
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                    <div>
                        <label className="property-modal__label">Dates d'Indisponibilités:</label>
                        <AvailabilityPicker
                            availabilityDates={availabilityDates}
                            setAvailabilityDates={setAvailabilityDates}
                        />
                    </div>
                    <button className="property-modal__button" onClick={handleSubmit}>
                        {property ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </div>
        )
    );
};

export default PropertyModal;
