import React, { useState, useEffect } from 'react';
import '../styles/services.css';

interface Service {
    id: number;
    description: string;
    price: number;
    provider_id: number;
    service_type: string;
    reservation_id: number;
    status: "pending" | "completed" | "accepted" | "cancelled";
}

interface Provider {
    id: number;
    name: string;
}

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<"pending" | "completed" | "accepted" | "cancelled">("pending");
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch('http://localhost:3000/services', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.services && Array.isArray(data.services)) {
                    setServices(data.services);
                } else {
                    console.error('Data is not in expected format', data);
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

        fetch('http://localhost:3000/providers', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.providers && Array.isArray(data.providers)) {
                    setProviders(data.providers);
                } else {
                    console.error('Data is not in expected format', data);
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }, [token]);

    const handleStatusChange = (serviceId: number) => {
        if (selectedProvider === null) {
            alert("Veillez choisir un prestataire avant de modifier le status.");
            return;
        }

        fetch(`http://localhost:3000/services/${serviceId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ provider_id: selectedProvider, status: selectedStatus })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(() => {
            setServices(services.map(service =>
                service.id === serviceId ? { ...service, provider_id: selectedProvider, status: selectedStatus } : service
            ));

            fetch('http://localhost:3000/interventions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ service_id: serviceId, provider_id: selectedProvider, date: new Date().toISOString(), status: 'pending' })
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    };

    return (
        <div className="manage-services">
            <h2>Services</h2>
            <table className="manage-services-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Prix</th>
                        <th>Prestataire</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map(service => (
                        <tr key={service.id}>
                            <td>{service.service_type}</td>
                            <td>{service.description}</td>
                            <td>{service.price}</td>
                            <td>
                                <select
                                    value={service.provider_id || ""}
                                    onChange={e => setSelectedProvider(Number(e.target.value))}
                                >
                                    <option value="">Choisir le Prestataire</option>
                                    {providers.map(provider => (
                                        <option key={provider.id} value={provider.id}>
                                            {provider.name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <select
                                    value={service.status}
                                    onChange={e => setSelectedStatus(e.target.value as "pending" | "completed" | "accepted" | "cancelled")}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </td>
                            <td>
                                <button onClick={() => handleStatusChange(service.id)}>Mettre à jour</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Services;
