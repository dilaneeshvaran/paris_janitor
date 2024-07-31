import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface RevenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownerId: number;
}

const RevenueModal: React.FC<RevenueModalProps> = ({ isOpen, onClose, ownerId }) => {
    const [revenueData, setRevenueData] = useState<{ monthlyRevenue: number; totalRevenue: number; reservations: any[] }>({ monthlyRevenue: 0, totalRevenue: 0, reservations: [] });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPropertyName = async (reservationId: number, token: string) => {
            try {
                const response = await axios.get(`http://localhost:3000/properties/reservation/${reservationId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                return response.data.name;
            } catch (err) {
                console.error(`Error fetching property name for reservation ${reservationId}:`, err);
                return 'Unknown Property';
            }
        };

        const fetchRevenueData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token non trouvé.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3000/invoices/owner/${ownerId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const invoices = response.data;
                const currentMonth = new Date().getMonth();
                let monthlyRevenue = 0;
                let totalRevenue = 0;

                const reservationsWithPropertyNames = await Promise.all(
                    invoices.map(async (invoice: any) => {
                        const propertyName = await fetchPropertyName(invoice.reservation_id, token);
                        totalRevenue += invoice.amount;
                        if (new Date(invoice.date).getMonth() === currentMonth) {
                            monthlyRevenue += invoice.amount;
                        }
                        return { ...invoice, propertyName };
                    })
                );

                setRevenueData({ monthlyRevenue, totalRevenue, reservations: reservationsWithPropertyNames });
            } catch (err) {
                setError('Erreur recuperation donnée de revenue.');
                console.error('Error fetching revenue data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchRevenueData();
        }
    }, [isOpen, ownerId]);

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Détails Revenues</h2>
                {loading ? (
                    <p>Chargement...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <div>
                        <p><strong>Revenue Mensuel:</strong> ${revenueData.monthlyRevenue.toFixed(2)}</p>
                        <p><strong>Revenue Total:</strong> ${revenueData.totalRevenue.toFixed(2)}</p>
                        <h3>Reservations</h3>
                        <ul>
                            {revenueData.reservations.map((reservation, index) => (
                                <li key={index}>
                                    {reservation.description} - ${reservation.amount.toFixed(2)} - {reservation.propertyName}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueModal;
