import { NotebookPen, MoveDown, Search, LockKeyhole, FilePenLine } from 'lucide-react'; import './Signup.css';
import { useState } from 'react'
import { SignupModal } from './SignupModal';



export const Signup = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isModalOpen, setIsModalOpen] = useState(false);



    return (
        <section className='signupWrapper'>
            <div className='signupContainer'>
                <h1 className='signupImageText'>Provider Sign Up</h1>

                <section className='signupInstructions'>
                    <h1>How It Works</h1>
                    <div className="instructionContainer">
                        <div className="iconColumn">
                            <NotebookPen className="instructionIcon1" />
                            <p>Fill out the form with all necessary information.</p>
                            <MoveDown className="arrow1" />
                            <Search className="instructionIcon2" />
                            <p>Admin will review your information and approve the request if everything is met.</p>
                            <MoveDown className="arrow2" />
                            <LockKeyhole className="instructionIcon3" />
                            <p>Admin will provide a temporary password and login.</p>
                            <MoveDown className="arrow3" />
                            <FilePenLine className="instructionIcon4" />
                            <p>As a provider you can now update your information as often as needed!</p>
                        </div>

                    </div>
                    <button className='get-started-button' onClick={() => setIsModalOpen(true)}>Get Started</button>
                </section>
            </div>
            {isModalOpen &&
                <SignupModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            }
        </section>
    )
}
