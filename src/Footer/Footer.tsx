import React from 'react';
import { Linkedin, Github } from 'lucide-react';
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer"> {/* Added top margin */}
            <div className="h-[.2em] bg-[#ff5722] w-full" />
            <div className="footer-content bg-white">
                <div className="social-icons">
                    <Linkedin className="icon" size={24} />
                    <Github className="icon" size={24} />
                </div>
                <div className="copyright">
                    © 2024 Utah ABA Locator. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;