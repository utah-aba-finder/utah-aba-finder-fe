import React from 'react';
import { Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer"> 
            <div className="h-[.2em] bg-[#544d49] w-full flex" />
            <div className="w-full flex flex-row items-center justify-center">
                <div className="w-1/3 flex flex-row items-center  justify-center">

                <h3>Follow us on:</h3>
                    <Link to="https://www.linkedin.com/company/autism-services-locator/" target="_blank">
                        <Linkedin className="p-2" size={24} />
                    </Link>
                </div>
                <div className="w-1/3 flex flex-row items-center justify-center text-sm">
                    <h3>© 2024 Autism Services Locator. All Rights Reserved. <br/>
                    A 501(c)3 Non-Profit Organization</h3>
                </div>
                <div className="w-1/3 flex flex-col items-center justify-center">
                    <Link to="/servicedisclaimer" className='text-lg underline-offset-4 text-[#4A6FA5]'>Service Disclaimer</Link>
                    <Link to="/careers" className='text-lg underline-offset-4 text-[#4A6FA5]'>Careers</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;