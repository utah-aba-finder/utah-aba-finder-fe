import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Assets/NewLogo3.png';
import Menu from '../Assets/menu.png';
import Close from '../Assets/close.png'
import "./Header.css";

const Header: React.FC = () => {
    const [menuOpen, setMenuOpen] = React.useState<boolean>(false);

    const toggleMenu = () => {
        setMenuOpen(prevMenuOpen => !prevMenuOpen);
    };

    return (
        <div className='Header'>
            <Link to="/"><img src={Logo} alt="main-logo" className="main-logo" tabIndex={0} /></Link>
            <img
                src={menuOpen ? Close : Menu}
                className={`menu ${menuOpen ? 'open' : ''}`}
                onClick={toggleMenu}
            />
            <div className={`menu-content ${menuOpen ? 'open' : ''}`} tabIndex={0}>
                <Link to="/" onClick={toggleMenu}>Home</Link>
                <Link to="/providers" onClick={toggleMenu}>Find Providers</Link>
                <Link to="/screening" onClick={toggleMenu}>Screening Tools</Link>
                <Link to="/information" onClick={toggleMenu}>Information</Link>
                <Link to="/providerLogin" onClick={toggleMenu}>Provider Login</Link>
                <Link to="/contact" onClick={toggleMenu}>Contact</Link>
            </div>
        </div>
    );
}

export default Header;