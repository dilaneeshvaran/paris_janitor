import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OwnerDashboard: React.FC = () => {
    const [rooms, setRooms] = useState<any[]>([]);
    const [roomName, setRoomName] = useState<string>('');

    useEffect(() => {
        axios.get('http://localhost:3000/properties/owner/1')
            .then(response => {
                setRooms(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the properties!', error);
            });
    }, []);

    const handleCreateRoom = () => {
        if (roomName.trim()) {
            axios.post('http://localhost:3000/properties/rooms', { name: roomName })
                .then(response => {
                    setRooms([...rooms, response.data]);
                    setRoomName('');
                })
                .catch(error => {
                    console.error('Error creating room:', error);
                });
        }
    };

    const handleDeleteRoom = (id: number) => {
        axios.delete(`http://localhost:3000/properties/rooms/${id}`)
            .then(() => {
                setRooms(rooms.filter(room => room.id !== id));
            })
            .catch(error => {
                console.error('Error deleting room:', error);
            });
    };

    const handleModifyRoom = (id: number) => {
        const newRoomName = prompt('Enter new room name:');
        if (newRoomName) {
            axios.put(`http://localhost:3000/properties/rooms/${id}`, { name: newRoomName })
                .then(response => {
                    setRooms(rooms.map(room => room.id === id ? response.data : room));
                })
                .catch(error => {
                    console.error('Error modifying room:', error);
                });
        }
    };

    return (
        <div>
            <h2>Owner Dashboard</h2>

            <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Room Name"
            />
            <button onClick={handleCreateRoom}>Create Room</button>

            <h3>My Rooms</h3>
            <ul>
                {rooms.map((room, index) => (
                    <li key={index}>
                        <img src={room.image} alt={room.name} style={{ width: '50px', height: '50px' }} />
                        {room.name}
                        <button onClick={() => handleModifyRoom(room.id)}>Modify</button>
                        <button onClick={() => handleDeleteRoom(room.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            {/* Add calendar and payment access components here */}
        </div>
    );
};

export default OwnerDashboard;
