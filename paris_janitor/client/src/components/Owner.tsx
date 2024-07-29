import React, { useState } from 'react';

const OwnerDashboard: React.FC = () => {
    const [rooms, setRooms] = useState<string[]>([]);
    const [roomName, setRoomName] = useState<string>('');

    const handleCreateRoom = () => {
        if (roomName.trim()) {
            setRooms([...rooms, roomName]);
            setRoomName('');
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
                    <li key={index}>{room}</li>
                ))}
            </ul>
        </div>
    );
};

export default OwnerDashboard;
