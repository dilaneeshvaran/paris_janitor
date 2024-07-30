import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/owner.css';

export interface Property {
    id: number;
    name: string;
    address: string;
    price: number;
    imageUrl: string;
    description: string;
    verified: boolean;
    availabilityCalendar: string;
}

const OwnerDashboard: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [newProperty, setNewProperty] = useState<Omit<Property, 'id' | 'verified'>>({
        name: '',
        description: '',
        address: '',
        price: 0,
        imageUrl: '',
        availabilityCalendar: ''
    });
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [availabilityDates, setAvailabilityDates] = useState<Date[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (userId && token) {
            axios.get(`http://localhost:3000/properties/owner/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    setProperties(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the properties!', error);
                });
        } else {
            console.error('User ID or token not found in local storage');
        }
    }, []);

    const handleCreateRoom = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (token && userId) {
            let imageUrl = '';
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
                    return; // Early return if image upload fails
                }
            }

            const propertyData = {
                ...newProperty,
                owner_id: userId,
                verified: false,
                imageUrl,
                availabilityCalendar: availabilityDates.length > 0
                    ? availabilityDates.map(date => date.toISOString()).join(', ')
                    : ''
            };

            try {
                const response = await axios.post('http://localhost:3000/properties', propertyData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProperties([...properties, response.data]);
                setIsCreateModalOpen(false);
                setNewProperty({
                    name: '',
                    description: '',
                    address: '',
                    price: 0,
                    imageUrl: '',
                    availabilityCalendar: ''
                });
                setAvailabilityDates([]);
                setSelectedFile(null);
            } catch (error) {
                console.error('Error creating room:', error);
            }
        } else {
            console.error('Token or User ID not found');
        }
    };

    const handleUpdateRoom = async () => {
        const token = localStorage.getItem('token');
        if (token && selectedProperty) {
            let imageUrl = selectedProperty.imageUrl;
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

            const updatedPropertyData = {
                ...selectedProperty,
                imageUrl,
                availabilityCalendar: availabilityDates.length > 0
                    ? availabilityDates.map(date => date.toISOString()).join(', ')
                    : ''
            };

            axios.put(`http://localhost:3000/properties/${selectedProperty.id}`, updatedPropertyData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    setProperties(properties.map(property => property.id === selectedProperty.id ? response.data : property));
                    setIsUpdateModalOpen(false);
                    setSelectedProperty(null);
                    setAvailabilityDates([]);
                    setSelectedFile(null);
                })
                .catch(error => {
                    console.error('Error updating room:', error);
                });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (isCreateModalOpen) {
            setNewProperty(prevState => ({
                ...prevState,
                [name]: name === 'price' ? parseFloat(value) : value
            }));
        } else if (isUpdateModalOpen && selectedProperty) {
            setSelectedProperty(prevState => prevState ? ({
                ...prevState,
                [name]: name === 'price' ? parseFloat(value) : value
            }) : null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDeleteRoom = (id: number) => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.delete(`http://localhost:3000/properties/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(() => {
                    setProperties(properties.filter(property => property.id !== id));
                })
                .catch(error => {
                    console.error('Error deleting room:', error);
                });
        }
    };

    const handleModifyRoom = (property: Property) => {
        setSelectedProperty(property);
        setAvailabilityDates(property.availabilityCalendar ? property.availabilityCalendar.split(', ').map(dateStr => new Date(dateStr)) : []);
        setIsUpdateModalOpen(true);
    };

    const handleViewReservations = (id: number) => {
        // Implement the logic to navigate to the reservation information page or modal
        console.log(`View reservations for room ID: ${id}`);
    };

    return (
        <div>
            <button onClick={() => setIsCreateModalOpen(true)}>Ajouter</button>

            <h3>Propriétés</h3>
            {properties.length === 0 ? (
                <p>No properties found.</p>
            ) : (
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
                            <button onClick={() => handleModifyRoom(property)} style={{ marginRight: '5px' }}>Modify</button>
                            <button onClick={() => handleDeleteRoom(property.id)} style={{ marginRight: '5px' }}>Delete</button>
                            <button onClick={() => handleViewReservations(property.id)}>View Reservations</button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Create Property Modal */}
            {isCreateModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={() => setIsCreateModalOpen(false)}>&times;</span>
                        <h2>Create New Room</h2>
                        <input
                            type="text"
                            name="name"
                            value={newProperty.name}
                            onChange={handleInputChange}
                            placeholder="Room Name"
                        />
                        <input
                            type="text"
                            name="description"
                            value={newProperty.description}
                            onChange={handleInputChange}
                            placeholder="Description"
                        />
                        <input
                            type="text"
                            name="address"
                            value={newProperty.address}
                            onChange={handleInputChange}
                            placeholder="Address"
                        />
                        <input
                            type="number"
                            name="price"
                            value={newProperty.price}
                            onChange={handleInputChange}
                            placeholder="Price"
                        />
                        <input
                            type="file"
                            name="image"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        <button onClick={handleCreateRoom}>Create</button>
                    </div>
                </div>
            )}

            {/* Update Property Modal */}
            {isUpdateModalOpen && selectedProperty && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={() => setIsUpdateModalOpen(false)}>&times;</span>
                        <h2>Update Room</h2>
                        <input
                            type="text"
                            name="name"
                            value={selectedProperty.name}
                            onChange={handleInputChange}
                            placeholder="Room Name"
                        />
                        <input
                            type="text"
                            name="description"
                            value={selectedProperty.description}
                            onChange={handleInputChange}
                            placeholder="Description"
                        />
                        <input
                            type="text"
                            name="address"
                            value={selectedProperty.address}
                            onChange={handleInputChange}
                            placeholder="Address"
                        />
                        <input
                            type="number"
                            name="price"
                            value={selectedProperty.price}
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
                        <button onClick={handleUpdateRoom}>Update</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerDashboard;
