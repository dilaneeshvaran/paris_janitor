import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

Modal.setAppElement('#root');
const stripePromise = loadStripe('pk_test_51PScAqGc0PhuZBe9Uqm7XP3iXPKio8QNqbt4iNfSINUE06VzAPldOUwEgVn94rLLmQKd8STxK6fj12YKwBeiMRbS00DCyPSNGY');

interface VipStatusModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    userId: number;
}

interface PaymentHistory {
    id: string;
    date: string;
    amount: number;
}

const VipStatusModal: React.FC<VipStatusModalProps> = ({ isOpen, onRequestClose, userId }) => {
    const [vipStatus, setVipStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [showHistory, setShowHistory] = useState<boolean>(false);

    useEffect(() => {
        const checkVipStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:3000/users/vip/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setVipStatus(response.data.isVip);
            } catch (error) {
                console.error('Error checking VIP status:', error);
            }
        };

        checkVipStatus();
    }, [userId]);

    const handlePayment = async () => {
        try {
            setLoading(true);
            const clientId = userId
            const amount = 10;
            const pay_vip = true;

            console.log('Client-side values:', { userId, clientId, amount });
            const response = await axios.post('http://localhost:3000/api/payment/membership', {
                userId,
                clientId,
                amount,
                pay_vip,
            });

            const sessionId = response.data.id;
            const stripe = await stripePromise;

            if (stripe) {
                const result = await stripe.redirectToCheckout({ sessionId });
                if (result.error) {
                    console.log(result.error.message);
                }
            } else {
                console.log("Stripe.js has not loaded yet.");
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSubscription = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/users/${userId}/vip`,
                { vip_status: false },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setVipStatus(false);
        } catch (error) {
            console.error('Error removing subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/invoices/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPaymentHistory(response.data);
        } catch (error) {
            console.error('Error fetching payment history:', error);
        }
    };

    const toggleHistory = () => {
        setShowHistory(!showHistory);
        if (!showHistory) fetchPaymentHistory();
    };

    const generatePDF = (payment: PaymentHistory) => {
        const doc = new jsPDF();
        doc.text('Facture', 20, 20);
        (doc as any).autoTable({
            startY: 30,
            head: [['Date', 'Amount']],
            body: [
                [new Date(payment.date).toLocaleDateString(), `$${payment.amount}`],
            ],
        });
        doc.save(`facture_${payment.id}.pdf`);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="VIP Status Modal"
        >
            <h2>Status VIP</h2>
            <p>VIP: {vipStatus ? 'Activé' : 'Non'}</p>
            {!vipStatus ? (
                <button onClick={handlePayment} disabled={loading}>
                    {loading ? 'Proces en cours...' : 'Activer le Status VIP pour $10'}
                </button>
            ) : (
                <button onClick={handleRemoveSubscription} disabled={loading}>
                    {loading ? 'Proces en cours...' : 'Désactiver le Status VIP'}
                </button>
            )}
            <button onClick={toggleHistory}>
                {showHistory ? 'Cacher Historique' : 'Voir Historique'}
            </button>
            {showHistory && (
                <div>
                    <h3>Historique Paiement</h3>
                    <ul>
                        {paymentHistory.map((payment, index) => (
                            <li key={index}>
                                {new Date(payment.date).toLocaleDateString()}: ${payment.amount}
                                <button onClick={() => generatePDF(payment)}>Télécharger la Facture</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <button onClick={onRequestClose}>
                Retourner
            </button>
        </Modal>
    );
};

export default VipStatusModal;
