import {  MoveDown } from 'lucide-react'; import './Signup.css';
import { useState } from 'react'
import  SignupModal  from './SignupModal';



export const Signup = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <section className='signupWrapper'>
            {!isModalOpen ? (
                <div className='signupContainer'>
                    <div className='signupImageTextContainer'>
                        <h1 className='signupImageText'>Provider Sign Up</h1>
                    </div>
                    <div className='signupInstructionsContainer'>
                        <section className='signupInstructions'>
                            <h1>How It Works</h1>
                            <div className="instructionContainer">
                                <div className="iconColumn">
                                    <p>Fill out the form with all necessary information.</p>
                                    <MoveDown className="arrow1" />
                                    <p>Once submitted, admin will review your information and approve the request if all required information is met, send a confirmation email, and you will be able to login to your account.</p>
                                    <MoveDown className="arrow2" />
                                    <p>As a provider you can now update your information as often as needed!</p>
                                </div>
                            </div>
                            <button 
                                className='get-started-button' 
                                onClick={() => setIsModalOpen(true)}
                            >
                                Get Started
                            </button>
                        </section>
                    </div>
                </div>
            ) : (
                <SignupModal
                    handleCloseForm={() => setIsModalOpen(false)}
                    onProviderCreated={() => setIsModalOpen(false)}
                />
            )}
        </section>
    )
}
