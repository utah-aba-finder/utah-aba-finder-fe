import {  MoveDown } from 'lucide-react'; import './Signup.css';
import { useState } from 'react'
import  SignupModal  from './SignupModal';



export const Signup = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'free' | 'sponsor' | 'premium' | null>(null);



    return (
        <section className='signupWrapper'>
            {!isModalOpen ?
            <div className='signupContainer'>
                <div className='signupImageTextContainer'>
                    <h1 className='signupImageText'>Provider Sign Up</h1>
                </div>
                <div className='signupInstructionsContainer'>
                <section className='signupInstructions'>
                    <h1>How It Works</h1>
                    <div className="instructionContainer">
                        <div className="iconColumn">
                            {/* <NotebookPen className="instructionIcon1" /> */}
                            <p>Choose which plan you would like to sign up for.</p>
                            <MoveDown className="arrow1" />
                            {/* <Search className="instructionIcon2" /> */}
                            <p>Fill out the form with all necessary information.</p>
                            <MoveDown className="arrow2" />
                            {/* <LockKeyhole className="instructionIcon3" /> */}
                            <p>Once submitted, admin will review your information and approve the request if everything is met.</p>
                            <MoveDown className="arrow3" />
                            {/* <FilePenLine className="instructionIcon4" /> */}
                            <p>As a provider you can now update your information as often as needed!</p>
                        </div>

                    </div>
                </section>
                <section className="plan-options-container">
      <h2>Choose Your Plan</h2>
      <table>
        <thead>
          <tr>
            <th>Plan Name</th>
            <th>Description</th>
            <th>Pricing</th>
          </tr>
        </thead>
        <tbody>
          <tr className="basic-plan">
            <td>BASIC</td>
            <td>Display your information for free with access for one person to edit as often as possible. Be shown alphabetically by service. Display your logo, insurances taken, contact information, link to your website, addresses, and services offered (i.e, in-home, in-clinic, telehealth).</td>
            <td>FREE <button className='get-started-button' onClick={() => {
                setSelectedPlan('free');
                setIsModalOpen(true);
            }}>Get Started</button></td>
          </tr>
          <tr className="sponsor-plan">
            <td>Sponsor</td>
            <td>Be on the first page shown for your specific service (Evaluations, ABA, Speech, Occupational). Add media images, testimonials, have up to 5 people with separate access to your information within your company.</td>
            <td>$25/month <button className='get-started-button' onClick={() => {
                setSelectedPlan('sponsor');
                setIsModalOpen(true);
            }}>Get Started</button></td>
          </tr>
          <tr className="premium-sponsor-plan">
            <td>Premium Sponsor</td>
            <td>Be on the first page shown for your specific service (Evaluations, ABA, Speech, Occupational). Add media images, testimonials, be able to pick and choose who has access to your information with no limits, see how many people click on your information daily, and communicate with potential clients through the site.</td>
            <td>$50/month <button className='get-started-button' onClick={() => {
                setSelectedPlan('premium');
                setIsModalOpen(true);
            }}>Get Started</button></td>
          </tr>
        </tbody>
      </table>
    </section>
    </div>
            </div>
            :
            <SignupModal
                handleCloseForm={() => setIsModalOpen(false)}
                onProviderCreated={() => setIsModalOpen(false)}
                selectedPlan={selectedPlan}
            />
            }
            
        </section>
    )
}
