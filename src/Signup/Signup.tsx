import { User, Mail, NotebookPen, Search, LockKeyhole, MoveDown, FilePenLine } from 'lucide-react';
import './Signup.css';
import { useState} from 'react';
import emailjs from '@emailjs/browser';
import { toast, ToastContainer } from 'react-toastify';
// import { Insurance, ProviderAttributes } from '../Utility/Types';
import { InsuranceModal } from './InsuranceModal';
import { Button } from '@chakra-ui/react';

interface EmailJSResponse {
    text: string;
    status: number;
}

export const Signup = () => {
    const [provider, setProvider] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedInsurances, setSelectedInsurances] = useState<Record<string, boolean>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     const selectedInsuranceNames = Object.keys(selectedInsurances).filter(name => selectedInsurances[name]);
        
        // Send the form data to your server
        // For example:
        // fetch('/api/send-insurance-data', {
        //   method: 'POST',
        //   body: JSON.stringify({ selectedInsurances: selectedInsuranceNames }),
        //   headers: {
        //     'Content-Type': 'application/json'
        //   }
        // });
    // };
    const submitInquiry = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const templateParams = {
            provider: provider,
            message: message,
            email: email
        }

        setIsLoading(true);
        emailjs.send('service_d6byt4s', 'template_rdrgmli', templateParams, 'YtcUeRrOLBFogwZI7')
            .then((res: EmailJSResponse) => {
                toast.success(`Email sent successfully!, ${res.text}`);
                setProvider('');
                setMessage('');
                setIsLoading(false);
            })
            .catch((err: any) => {
                toast.error(`Error sending email, ${err}`);
                setIsLoading(false);
            });
    }

    if (isLoading) {
        toast.info('Sending email...');
    }
    const handleSelect = (selectedInsurances: string[]) => {
        setSelectedInsurances(prev => {
            const newSelections = {} as Record<string, boolean>;
            selectedInsurances.forEach(insurance => {
                newSelections[insurance] = true;
            });
            return { ...prev, ...newSelections };
        });
        setIsModalOpen(false);
    };
    
    return (
        <section className='signupWrapper'>
            <ToastContainer />
            <div className='signupContainer'>
                <h1 className='signupImageText'>Provider Sign Up</h1>

                <form className='signupForm' onSubmit={submitInquiry}> <div className='input'>
                    <User className='userIcon' />
                    <input type='text' id='username' name='username' value={provider} placeholder='Provider Name' required onChange={(e) => setProvider(e.target.value)} />
                </div>
                    <div className='input'>
                        <Mail className='mailIcon' />
                        <input type='email' id='email' name='email' placeholder='Email'
                            required value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <Button type="button" onClick={() => setIsModalOpen(true)}>Add Insurances</Button>

                    <InsuranceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={handleSelect}  />
                    <button type='submit' className='loginButton' >Sign Up</button>

                </form>
                <section className='signupInstructions'>
                    <h1>How It Works</h1>
                    <div className="instructionContainer">
                        <div className="iconColumn">
                            <NotebookPen  className="instructionIcon1" />
                            <MoveDown className="arrow1" />
                            <Search className="instructionIcon2" />
                            <MoveDown className="arrow2" />
                            <LockKeyhole className="instructionIcon3" />
                            <MoveDown className="arrow3" />
                            <FilePenLine className="instructionIcon4" />
                        </div>
                        <div className="messageColumn">
                            <p className='step1'>Fill out the form with all necessary information.</p>
                            <p className='step2'>Admin will review your information and approve the request if everything is met.</p>
                            <p className='step3'>Admin will provide a temporary password and login.</p>
                            <p className='step4'>As a provider you can now update your information as often as needed!</p>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    )
}
