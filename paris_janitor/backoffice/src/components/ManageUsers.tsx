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

interface Invoice {
    amount: number;
    client_id: number;
    date: string;
    reservation_id: number;
    pay_vip: boolean;
    service_id: number;
    id: number;
}

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editUserId, setEditUserId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState({
        firstname: '',
        lastname: '',
        email: ''
    });
    const [invoices, setInvoices] = useState<{ [key: number]: Invoice[] }>({});
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
                    data.users.forEach((user: User) => fetchUserInvoices(user.id));
                } else {
                    console.error('Data is not in expected format', data);
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }, [token]);

    const fetchUserInvoices = (userId: number) => {
        fetch(`http://localhost:3000/invoices/owner/${userId}`, {
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
            .then((data: Invoice[]) => {
                setInvoices(prevInvoices => ({
                    ...prevInvoices,
                    [userId]: data
                }));
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    };

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

    const calculateTotalRevenue = (userId: number) => {
        const userInvoices = invoices[userId] || [];
        return userInvoices.reduce((total, invoice) => total + invoice.amount, 0);
    };

    const calculateMonthlyRevenue = (userId: number) => {
        const userInvoices = invoices[userId] || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return userInvoices
            .filter(invoice => {
                const invoiceDate = new Date(invoice.date);
                return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
            })
            .reduce((total, invoice) => total + invoice.amount, 0);
    };

    return (
        <div className="manage-users">
            <h2>Manage Users</h2>
            <table className="manage-users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status VIP</th>
                        <th>VIP Payé</th>
                        <th>Revenue Totale</th>
                        <th>Revenue Ce Mois</th>
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
                            <td>{user.role}</td>
                            <td>{user.vip_status ? 'VIP' : 'Non'}</td>
                            <td>
                                {user.vip_status ? (
                                    <FetchVipStatus userId={user.id} token={token} />
                                ) : (
                                    'N/A'
                                )}
                            </td>
                            <td>{calculateTotalRevenue(user.id)}</td>
                            <td>{calculateMonthlyRevenue(user.id)}</td>
                            <td>
                                {editUserId === user.id ? (
                                    <button onClick={() => handleSaveClick(user.id)}>Enregistrer</button>
                                ) : (
                                    <button onClick={() => handleEditClick(user)}>Modifier</button>
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

    return <>{isVipPaid ? 'Oui' : 'Non'}</>;
};

export default ManageUsers;
