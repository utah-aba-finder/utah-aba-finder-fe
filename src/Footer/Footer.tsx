import React from 'react';
import { Linkedin, Github } from 'lucide-react';
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer"> 
            <div className="h-[.2em] bg-[#544d49] w-full" />
            <div className="footer-content bg-white">
                <div className="social-icons">
                    <Linkedin className="icon" size={24} />
                    <Github className="icon" size={24} />
                </div>
                <div className="copyright">
                    © 2024 Autism Services Locator. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;