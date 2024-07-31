import React, { useState, useEffect, ChangeEvent } from 'react';
import '../styles/manage-users.css';

interface User {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role: string;
    subscription_status: boolean;
    vip_status: boolean;
}

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editUserId, setEditUserId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState({
        firstname: '',
        lastname: '',
        email: ''
    });
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch('http://localhost:3000/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                if (data.users && Array.isArray(data.users)) {
                    setUsers(data.users);
                } else {
                    console.error('Data is not in expected format', data);
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }, [token]);

    const handleEditClick = (user: User) => {
        setEditUserId(user.id);
        setEditFormData({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
        });
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleSaveClick = (userId: number) => {
        fetch(`http://localhost:3000/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(editFormData)
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then((updatedUser) => {
            setUsers(users.map(user => (user.id === userId ? { ...user, ...editFormData } : user)));
            setEditUserId(null);
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    };

    return (
        <div className="manage-users">
            <h2>Manage Users</h2>
            <table className="manage-users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>VIP Status</th>
                        <th>Paid for VIP</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>
                                {editUserId === user.id ? (
                                    <input
                                        type="text"
                                        name="firstname"
                                        value={editFormData.firstname}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    user.firstname
                                )}
                            </td>
                            <td>
                                {editUserId === user.id ? (
                                    <input
                                        type="text"
                                        name="lastname"
                                        value={editFormData.lastname}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    user.lastname
                                )}
                            </td>
                            <td>
                                {editUserId === user.id ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editFormData.email}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    user.email
                                )}
                            </td>
                            <td>{user.vip_status ? 'VIP' : 'Regular'}</td>
                            <td>
                                {user.vip_status ? (
                                    <FetchVipStatus userId={user.id} token={token} />
                                ) : (
                                    'N/A'
                                )}
                            </td>
                            <td>
                                {editUserId === user.id ? (
                                    <button onClick={() => handleSaveClick(user.id)}>Save</button>
                                ) : (
                                    <button onClick={() => handleEditClick(user)}>Edit</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const FetchVipStatus: React.FC<{ userId: number, token: string | null }> = ({ userId, token }) => {
    const [isVipPaid, setIsVipPaid] = useState<boolean | null>(null);

    useEffect(() => {
        if (token) {
            fetch(`http://localhost:3000/invoices/vip/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data: boolean) => setIsVipPaid(data))
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }
    }, [userId, token]);

    return <>{isVipPaid ? 'Yes' : 'No'}</>;
};

export default ManageUsers;
