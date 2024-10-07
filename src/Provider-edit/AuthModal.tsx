import React, { useState } from 'react';
import './AuthModal.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Provider-login/AuthProvider';
import { X } from 'lucide-react';

interface AuthModalProps {          
    onClose: () => void;
}

export const AuthModal = ({ onClose }: AuthModalProps) => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const { setToken } = useAuth();
    const navigate = useNavigate();


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('providerId');
        onClose();
        setToken(null);
    }

    return (
        <div className='auth-modal'>
            <div className='auth-modal-content'>
                <X className='close-modal' onClick={onClose} />
                <h1>For security reasons, if you refresh the page or navigate to another page, you will be logged out.</h1>
                <p>If you have any questions, please contact the admin at <Link to="/contact" className='authwarning-link' onClick={handleLogout}>Contact Us</Link>. Upon clicking the link, you will also be logged out.</p>
                <p>To continue editing your information, please click the button below.</p>
                <button className='continue-editing-button' onClick={handleLogout}>Continue Editing</button>
            </div>
        </div>
    );
};
