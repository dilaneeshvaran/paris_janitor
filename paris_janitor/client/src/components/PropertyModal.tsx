import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Property } from './Owner';

interface PropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (property: Omit<Property, 'id' | 'verified'>, availabilityDates: Date[], selectedFile: File | null) => Promise<void>;
    property?: Property;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ isOpen, onClose, onSubmit, property }) => {
    const [propertyDetails, setPropertyDetails] = useState<Omit<Property, 'id' | 'verified'>>({
        name: '',
        description: '',
        address: '',
        price: 0,
        imageUrl: '',
        availabilityCalendar: ''
    });
    const [availabilityDates, setAvailabilityDates] = useState<Date[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (property) {
            setPropertyDetails({
                name: property.name,
                description: property.description,
                address: property.address,
                price: property.price,
                imageUrl: property.imageUrl,
                availabilityCalendar: property.availabilityCalendar
            });
            setAvailabilityDates(property.availabilityCalendar.split(', ').map(dateStr => new Date(dateStr)));
        }
    }, [property]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPropertyDetails(prevState => ({
            ...prevState,
            [name]: name === 'price' ? parseFloat(value) : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        onSubmit(propertyDetails, availabilityDates, selectedFile);
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close-button" onClick={onClose}>&times;</span>
                <h2>{property ? 'Update Room' : 'Create New Room'}</h2>
                <input
                    type="text"
                    name="name"
                    value={propertyDetails.name}
                    onChange={handleInputChange}
                    placeholder="Room Name"
                />
                <input
                    type="text"
                    name="description"
                    value={propertyDetails.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                />
                <input
                    type="text"
                    name="address"
                    value={propertyDetails.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                />
                <input
                    type="number"
                    name="price"
                    value={propertyDetails.price}
                    onChange={handleInputChange}
                    placeholder="Price"
                />
                <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    accept="image/*"
                />
                <div>
                    <label>Availability Dates:</label>
                    <DatePicker
                        selected={null}
                        onChange={date => date && setAvailabilityDates([...availabilityDates, date])}
                        inline
                    />
                    <div>
                        {availabilityDates.map((date, index) => (
                            <span key={index} style={{ marginRight: '5px' }}>{date.toDateString()}</span>
                        ))}
                    </div>
                </div>
                <button onClick={handleSubmit}>{property ? 'Update' : 'Create'}</button>
            </div>
        </div>
    );
};

export default PropertyModal;
