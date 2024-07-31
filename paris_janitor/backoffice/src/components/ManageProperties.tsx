import React from 'react';
import '../styles/manage-properties.css';

const ManageProperties: React.FC = () => {
    return (
        <div className="manage-properties">
            <h2>Manage Properties</h2>
            <table className="manage-properties-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {/* property rows here */}
                </tbody>
            </table>
        </div>
    );
};

export default ManageProperties;
