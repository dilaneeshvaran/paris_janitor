import React from 'react';
import '../styles/simulations.css';

const ReceivedSimulations: React.FC = () => {
    return (
        <div className="received-simulations">
            <h2>Received Simulations</h2>
            <table className="received-simulations-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Property</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {/* simulations */}
                </tbody>
            </table>
        </div>
    );
}

export default ReceivedSimulations;
