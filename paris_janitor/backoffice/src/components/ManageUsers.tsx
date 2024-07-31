import React from 'react';
import '../styles/manage-users.css';

const ManageUsers: React.FC = () => {
    return (
        <div className="manage-users">
            <h2>Manage Users</h2>
            <table className="manage-users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {/*  user rows */}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;
