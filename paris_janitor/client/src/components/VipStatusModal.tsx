import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

Modal.setAppElement('#root');
const stripePromise = loadStripe('pk_test_51PScAqGc0PhuZBe9Uqm7XP3iXPKio8QNqbt4iNfSINUE06VzAPldOUwEgVn94rLLmQKd8STxK6fj12YKwBeiMRbS00DCyPSNGY');

interface VipStatusModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    userId: number;
}

interface PaymentHistory {
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


    console.log("::::::::vipstatus", vipStatus);
    console.log("::::::::userid", userId);


    const handlePayment = async () => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3000/api/payment/membership', { userId });
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
            const response = await axios.get(`/api/user/${userId}/payments`);
            setPaymentHistory(response.data);
        } catch (error) {
            console.error('Error fetching payment history:', error);
        }
    };

    const toggleHistory = () => {
        setShowHistory(!showHistory);
        if (!showHistory) fetchPaymentHistory();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="VIP Status Modal"
        >
            <h2>VIP Status</h2>
            <p>VIP Status: {vipStatus ? 'Activé' : 'Non'}</p>
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
                {showHistory ? 'Hide History' : 'See History'}
            </button>
            {showHistory && (
                <div>
                    <h3>Payment History</h3>
                    <ul>
                        {paymentHistory.map((payment, index) => (
                            <li key={index}>
                                {new Date(payment.date).toLocaleDateString()}: ${payment.amount / 100}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Modal>
    );
};

export default VipStatusModal;
