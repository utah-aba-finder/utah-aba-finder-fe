import React from 'react';
import { Linkedin, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full h-full flex flex-col items-center  justify-center"> 
            {/* <div className="h-[.2em] bg-[#f1efed] w-full flex" /> */}
            <div className="w-full flex flex-col md:flex-col lg:flex-row items-center justify-center">
                <div className='w-full flex flex-col md:flex-col lg:flex-col items-center justify-center'>
                    <Link to="/contact" className='text-[#4A6FA5] no-underline text-lg font-bold pt-2'>Contact Us</Link>
                    <h3 className='text-lg p-0 m-0'><strong className='text-[#4A6FA5]'>Email:</strong> <a href="mailto:info@autismserviceslocator.com" className='text-[#010101] no-underline'>info@autismserviceslocator.com</a></h3>
                    <h3 className='text-lg p-0 m-0'><strong className='text-[#4A6FA5]'>Phone:</strong> <a href="tel:(801)833-0284" className='text-[#030303] no-underline'> (801)833-0284</a></h3>
                </div>
                <div className="w-full flex flex-col md:flex-row lg:flex-row items-center justify-center">
                    <h3 className='text-lg text-[#4A6FA5]'>Follow us on:</h3>
                    <Link to="https://www.linkedin.com/company/autism-services-locator/" target="_blank">
                        <Linkedin className="p-2" size={24} />
                    </Link>
                    <Link to="https://www.facebook.com/profile.php?id=61571553697036" target="_blank">
                        <Facebook className="p-2" size={24} />
                    </Link>
                </div>
                <div className="w-full flex flex-col md:flex-row lg:flex-col sm:flex-col items-center justify-center gap-4">
                    <Link to="/servicedisclaimer" className='text-lg underline-offset-4 text-[#4A6FA5]'>Service Disclaimer</Link>
                    <Link to="/careers" className='text-lg underline-offset-4 text-[#4A6FA5]'>Careers/Volunteering</Link>
                    <Link to="/sponsor" className='text-lg underline-offset-4 text-[#4A6FA5]'>Become a Sponsor</Link>
                </div>
            </div>
                <div className="w-full flex flex-col md:flex-row lg:flex-row items-center justify-center text-sm">
                    <h3>© 2024 Autism Services Locator. All Rights Reserved. <br/>
                    A 501(c)(3) Non-Profit Organization</h3>
                </div>
        </footer>
    );
};

export default Footer;