import React from 'react';
import '../styles/services.css';

const Services: React.FC = () => {
    return (
        <div className="manage-services">
            <h2>Services</h2>
            <table className="manage-services-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Property</th>
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

export default Services;
