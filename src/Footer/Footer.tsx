import React from 'react';
import { Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer"> 
            <div className="h-[.2em] bg-[#544d49] w-full" />
            <div className="footer-content bg-white">
                <h3>Follow us on:</h3>
                <div className="social-icons">
                    <Link to="https://www.linkedin.com/company/autism-services-locator/" target="_blank">
                        <Linkedin className="icon" size={24} />
                    </Link>
                </div>
                <div className="copyright">
                    Copyright © 2024 Autism Services Locator. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;