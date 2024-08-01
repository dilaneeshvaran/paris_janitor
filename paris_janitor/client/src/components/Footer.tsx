import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import '../styles/footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <p>&copy; 2018 Paris Janitor. Tous droits réservés.</p>
            <div className="footer-icons">
                <a href="mailto:eeshvarand@gmail.com" aria-label="Email">
                    <FontAwesomeIcon icon={faEnvelope} />
                </a>
                <a href="https://facebook.com" aria-label="Facebook">
                    <FontAwesomeIcon icon={faFacebook} />
                </a>
                <a href="https://twitter.com" aria-label="Twitter">
                    <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="https://instagram.com" aria-label="Instagram">
                    <FontAwesomeIcon icon={faInstagram} />
                </a>
            </div>
        </footer>
    );
};

export default Footer;
