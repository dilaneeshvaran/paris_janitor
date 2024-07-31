import React, { useState, useEffect } from 'react';
import '../styles/simulations.css';

interface Simulation {
    id: number;
    address: string;
    typeProperty: string;
    typeLocation: string;
    numberRooms: number;
    capacity: number;
    surface: number;
    email: string;
    fullName: string;
    phoneNumber: string;
}

const ReceivedSimulations: React.FC = () => {
    const [simulations, setSimulations] = useState<Simulation[]>([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch('http://localhost:3000/simulations', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.simulations && Array.isArray(data.simulations)) {
                    setSimulations(data.simulations);
                } else {
                    console.error('Data is not in expected format', data);
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }, [token]);

    return (
        <div className="received-simulations">
            <h2>Received Simulations</h2>
            <table className="received-simulations-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Address</th>
                        <th>Type Bien</th>
                        <th>Type Location</th>
                        <th>Nombre de Chambre</th>
                        <th>Capacité</th>
                        <th>Surface</th>
                        <th>Email</th>
                        <th>Nom Prénom</th>
                        <th>Numéro Tél</th>
                    </tr>
                </thead>
                <tbody>
                    {simulations.map(simulation => (
                        <tr key={simulation.id}>
                            <td>{simulation.id}</td>
                            <td>{simulation.address}</td>
                            <td>{simulation.typeProperty}</td>
                            <td>{simulation.typeLocation}</td>
                            <td>{simulation.numberRooms}</td>
                            <td>{simulation.capacity}</td>
                            <td>{simulation.surface}</td>
                            <td>{simulation.email}</td>
                            <td>{simulation.fullName}</td>
                            <td>{simulation.phoneNumber}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ReceivedSimulations;
