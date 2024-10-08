import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import '../styles/simulation.css';

interface SimulationFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const SimulationForm: React.FC<SimulationFormProps> = ({ isOpen, onClose }) => {
    const [address, setAddress] = useState('');
    const [typeProperty, setTypeProperty] = useState('');
    const [typeLocation, setTypeLocation] = useState('');
    const [numberRooms, setNumberRooms] = useState<number | ''>('');
    const [capacity, setCapacity] = useState<number | ''>('');
    const [surface, setSurface] = useState<number | ''>('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isDownloadReady, setIsDownloadReady] = useState<boolean>(false);
    const [pdf, setPdf] = useState<jsPDF | null>(null);

    useEffect(() => {
        calculatePrice();
    }, [address, typeProperty, typeLocation, numberRooms, capacity, surface]);

    const calculatePrice = () => {
        const basePrice = 1000;
        const roomFactor = numberRooms ? numberRooms * 100 : 0;
        const capacityFactor = capacity ? capacity * 50 : 0;
        const surfaceFactor = surface ? surface * 20 : 0;

        const typePropertyFactors: Record<string, number> = {
            'appartement': 1.2,
            'garage': 0.8,
            'maison': 1.5,
            'chambre': 0.9,
            'studio': 1.0
        };

        const typeLocationFactors: Record<string, number> = {
            'logement complet': 1.0,
            'logement chambre': 0.7
        };

        const propertyFactor = typePropertyFactors[typeProperty] || 1;
        const locationFactor = typeLocationFactors[typeLocation] || 1;

        const totalPrice = (basePrice + roomFactor + capacityFactor + surfaceFactor) * propertyFactor * locationFactor;
        setPrice(totalPrice);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        setIsProcessing(true);
        setIsDownloadReady(false);

        try {
            const response = await axios.post('http://localhost:3000/simulations', {
                address,
                typeProperty,
                typeLocation,
                numberRooms,
                capacity,
                surface,
                email,
                fullName,
                phoneNumber
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                setMessage('Merci ! nous vous contacterons !.');
                setError(null);
                generatePDF();
                clearForm();
            }
        } catch (error) {
            setError('reverifiez votre email!.');
            setMessage(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const clearForm = () => {
        setAddress('');
        setTypeProperty('');
        setTypeLocation('');
        setNumberRooms('');
        setCapacity('');
        setSurface('');
        setEmail('');
        setFullName('');
        setPhoneNumber('');
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text('Attention : ceci est une simulation de devis', 10, 10);
        doc.text('Details de votre demande', 10, 10);
        doc.text(`Address: ${address}`, 10, 20);
        doc.text(`Type de Propriété: ${typeProperty}`, 10, 30);
        doc.text(`Type de Location: ${typeLocation}`, 10, 40);
        doc.text(`Nombre de Chambres: ${numberRooms}`, 10, 50);
        doc.text(`Capacité: ${capacity}`, 10, 60);
        doc.text(`Surface: ${surface} sq metres`, 10, 70);
        doc.text(`Email: ${email}`, 10, 80);
        doc.text(`Nom Prénom: ${fullName}`, 10, 90);
        doc.text(`Numéro Tél: ${phoneNumber}`, 10, 100);
        doc.text(`Prix Estimé: $${price}`, 10, 110);
        setPdf(doc);
        setIsDownloadReady(true);
    };

    const downloadPDF = () => {
        if (pdf) {
            pdf.save('simulation.pdf');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="simulation-modal">
            <div className="simulation-modal-content">
                <span className="simulation-close" onClick={onClose}>&times;</span>
                <h2>Simulation Devis</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Address:
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Type de Properiété:
                        <select
                            className="simulation-select-property"
                            value={typeProperty}
                            onChange={(e) => setTypeProperty(e.target.value)}
                            required
                        >
                            <option value="">Select</option>
                            <option value="appartement">Appartement</option>
                            <option value="garage">Garage</option>
                            <option value="maison">Maison</option>
                            <option value="chambre">Chambre</option>
                            <option value="studio">Studio</option>
                        </select>
                    </label>
                    <label>
                        Type de Location:
                        <select
                            className="simulation-select-location"
                            value={typeLocation}
                            onChange={(e) => setTypeLocation(e.target.value)}
                            required
                        >
                            <option value="">Choisir</option>
                            <option value="logement complet">Logement Complet</option>
                            <option value="logement chambre">Logement Chambre</option>
                        </select>
                    </label>
                    <label>
                        Nombre de Chambres:
                        <input
                            type="number"
                            value={numberRooms}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 0) {
                                    setNumberRooms(value);
                                }
                            }}
                            required
                        />
                    </label>
                    <label>
                        Capacité:
                        <input
                            type="number"
                            value={capacity}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 0) {
                                    setCapacity(value);
                                }
                            }}
                            required
                        />
                    </label>
                    <label>
                        Surface (sq metres):
                        <input
                            type="number"
                            value={surface}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 0) {
                                    setSurface(value);
                                }
                            }}
                            required
                        />
                    </label>

                    <label>
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Nom Prénom:
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Numéro Tél:
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            pattern="^\+33[0-9]{9}$"
                            placeholder="+33712121212"
                            required
                        />
                    </label>

                    <button type="submit" disabled={isProcessing}>
                        {isProcessing ? 'Calcul en cours...' : 'Génerer le devis'}
                    </button>
                </form>
                {isDownloadReady && (
                    <button onClick={downloadPDF}>Télécharger le devis en PDF</button>
                )}
                {message && <div className="simulation-message success">{message}</div>}
                {error && <div className="simulation-message error">{error}</div>}
            </div>
        </div>
    );
};

export default SimulationForm;
