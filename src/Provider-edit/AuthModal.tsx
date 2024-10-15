import './AuthModal.css';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../Provider-login/AuthProvider';
import { X } from 'lucide-react';
import { useState } from 'react';

interface AuthModalProps {          
    onClose: () => void;
    handleShownModal: (hideModal: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, handleShownModal }) => {
    const { setToken } = useAuth();
    const [hideModal, setHideModal] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('providerId');
        onClose();
        setToken(null);
    }
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHideModal(e.target.checked);
    }
    const handleConfirm = () => {
        handleShownModal(hideModal);
    }


    return (
        <div className='auth-modal'>
            <div className='auth-modal-content'>
                <X className='close-modal' onClick={onClose} />
                <h1>For security reasons, if you refresh the page or navigate to another page, you will be logged out.</h1>
                <p>If you have any questions, please contact the admin at <Link to="/contact" className='authwarning-link' onClick={handleLogout}>Contact Us</Link>. Upon clicking the link, you will be logged out.</p>
                <div className='auth-modal-checkbox-container'> 
                    <input type='checkbox' id='dontShowAgain' name='dontShowAgain' checked={hideModal} onChange={handleCheckboxChange}/> 
                    <label htmlFor='dontShowAgain'>Don't show this again</label>
                </div>
                <button onClick={handleConfirm} className='continue-editing-button'>Continue editing</button>
            </div>
        </div>
    );
};
