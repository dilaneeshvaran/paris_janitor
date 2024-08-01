import React, { useState, useEffect } from 'react';
import '../styles/home.css';
import Footer from './Footer';

export interface Property {
    id: number;
    name: string;
    address: string;
    price: number;
    imageUrl: string;
    description: string;
}

const Home: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        fetch('http://localhost:3000/properties/verified')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched data:', data);
                if (data && Array.isArray(data.properties)) {
                    setProperties(data.properties);
                } else {
                    console.error('Unexpected data format:', data);
                }
            })
            .catch(error => console.error('Error fetching properties:', error));
    }, []);

    useEffect(() => {
        if (properties.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide((prevSlide) => (prevSlide + 1) % properties.length);
            }, 3000);//slide change tous les 3 secondes

            return () => clearInterval(timer);
        }
    }, [properties.length]);

    const handleItemClick = (property: Property) => {
        console.log('Property clicked:', property);
        setSelectedProperty(property);
    };

    const handleCloseModal = () => {
        setSelectedProperty(null);
    };

    const handlePrevSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide === 0 ? properties.length - 1 : prevSlide - 1));
    };

    const handleNextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % properties.length);
    };

    return (
        <div className="home-container">
            <h1>Paris Janitor</h1>
            <p>Bienvenue chez Paris Janitor (PJ)
                Depuis 2018, Paris Janitor (PJ) révolutionne la conciergerie immobilière à Paris en offrant des services de gestion locative saisonnière de qualité supérieure. Nous prenons en charge toutes les étapes de la location de votre bien immobilier, de la gestion des réservations à l'entretien, en passant par l'accueil des clients. Grâce à notre plateforme en ligne intuitive, les propriétaires peuvent facilement obtenir une simulation de devis et de gains potentiels, leur permettant de louer leurs logements en toute sérénité. Rejoignez de nombreux bailleurs satisfaits qui ont choisi PJ pour la qualité de notre accueil et la richesse de nos prestations.</p>
            {properties.length === 0 ? (
                <p>Chargement...</p>
            ) : (
                <div className="slideshow">
                    {properties.map((property, index) => (
                        <div
                            key={property.id}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => handleItemClick(property)}
                        >
                            <img src={property.imageUrl} alt={property.name} />
                            <h2>{property.name}</h2>
                        </div>
                    ))}
                    <button className="prev" onClick={handlePrevSlide}>&#10094;</button>
                    <button className="next" onClick={handleNextSlide}>&#10095;</button>
                </div>
            )}

            {selectedProperty && (
                <div className="modal" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <span className="close-button" onClick={handleCloseModal}>&times;</span>
                        <h2>{selectedProperty.name}</h2>
                        <img src={selectedProperty.imageUrl} alt={selectedProperty.name} />
                        <p>{selectedProperty.description}</p>
                    </div>
                </div>
            )}
            <Footer />

        </div>

    );
};

export default Home;
