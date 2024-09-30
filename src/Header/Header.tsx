import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Assets/NewLogo3.png';
import Menu from '../Assets/menu.png';
import Close from '../Assets/close.png';
import "./Header.css";

const Header: React.FC = () => {
    const [menuOpen, setMenuOpen] = React.useState<boolean>(false);

    const toggleMenu = () => {
        setMenuOpen(prevMenuOpen => !prevMenuOpen);
    };

    return (
        <header className={`Header ${menuOpen ? 'open' : 'closed'}`}>
            <div className='headerContainer'>
                <Link to="/" aria-label="Homepage" className="main-logo-link">
                    <img
                        src={Logo}
                        alt="main-logo"
                        className="main-logo"
                    />
                </Link>
                <img
                    src={menuOpen ? Close : Menu}
                    className={`menu ${menuOpen ? 'open' : ''}`}
                    alt='menu'
                    onClick={toggleMenu}
                    role="button"
                    tabIndex={0}
                    aria-expanded={menuOpen}
                    aria-controls="menu-content"
                />
            </div>
            <nav id="menu-content" className={`menu-content ${menuOpen ? 'open' : ''}`} tabIndex={0}>
                <Link to="/" onClick={toggleMenu}>Home</Link>
                <Link to="/providers" onClick={toggleMenu}>Find Providers</Link>
                <Link to="favoriteproviders" onClick={toggleMenu}> Favorited Providers </Link>
                <Link to="/screening" onClick={toggleMenu}>Screening Tools</Link>
                <Link to="/information" onClick={toggleMenu}>What is ASD?</Link>
                <Link to="/resources" onClick={toggleMenu}>Resources</Link>
                <Link to="/providerLogin" onClick={toggleMenu}>Provider Login</Link>
                <Link to="/contact" onClick={toggleMenu}>Contact</Link>
                <Link to="/about" onClick={toggleMenu}>About Us</Link>
            </nav>
        </header>
    );
}

export default Header;