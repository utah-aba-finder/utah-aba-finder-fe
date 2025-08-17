import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import utah from '../Assets/williamsonFamily.jpeg';
import './Homepage.css';
import Joyride, { Step } from 'react-joyride';
import love from '../Assets/love.jpg';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from 'emailjs-com';
import SEO from '../Utility/SEO';
//sponsor images
import wansutter from '../Assets/sponsor-images/wansutter.png';
import ACU from '../Assets/sponsor-images/ACU.png'
import { DraftingCompassIcon, Mail, StethoscopeIcon } from 'lucide-react';
import StructuredData from '../Utility/StructuredData';


type Props = {}

interface State {
    run: boolean;
    steps: Step[];
    showModal: boolean;
    dontShowAgain: boolean;
    name: string;
    email: string;
    message: string;
}

const sponsors = [
    { name: 'Wansutter HR Consulting', image: wansutter, website: 'https://www.linkedin.com/company/wansutter-hr-consulting' },
    { name: 'ACU', image: ACU, website: 'https://www.autismcouncilofutah.org/' }
];

class Homepage extends Component<Props, State> {
    private form = React.createRef<HTMLFormElement>();

    state: State = {
        run: false,
        steps: [
            {
                target: '.discover-section-button',
                content: 'Welcome to our website! Start your journey by clicking this button to find providers.',
                disableBeacon: true,
                placement: 'top'
            },
            {
                target: '.sponsor-section',
                content: 'See our sponsors who help make this website possible!',
                placement: 'top'
            },
            {
                target: '.begin-section-button1',
                content: 'Click here to view all available providers.',
                placement: 'top'
            },
            {
                target: '.begin-section-button2',
                content: 'Take screening tests to see if you or your child meet autism criteria.',
                placement: 'top'
            },
            {
                target: '.begin-section-button3',
                content: 'Contact us for any questions or support.',
                placement: 'top'
            },
            {
                target: '.what-we-are-about',
                content: 'Learn more about our mission and what we do!',
                placement: 'top'
            },
            {
                target: 'header nav',
                content: 'Use the navbar to navigate through our other pages!',
                placement: 'bottom'
            },
            {
                target: 'button[aria-label="Toggle menu"]',
                content: 'On mobile, tap this button to open the navigation menu.',
                placement: 'bottom'
            },
            {
                target: '.lg\\:hidden nav',
                content: 'This is the mobile navigation menu with all our pages.',
                placement: 'top'
            }
        ],
        showModal: false,
        dontShowAgain: false,
        name: '',
        email: '',
        message: ''
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        this.setState({ [name]: value } as unknown as Pick<State, keyof State>);
    };

    handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!this.state.email.includes('@') || !this.state.email.includes('.com')) {
            toast.error('Please enter a valid email address with "@" and ".com"');
            return;
        }

        const templateParams = {
            user_name: this.state.name,
            user_email: this.state.email,
            message: this.state.message
        };

        emailjs.send('service_b9y8kte', 'template_a2x7i2h', templateParams, '1FQP_qM9qMVxNGTmi')
            .then((result) => {
                toast.success('Email sent successfully');
                this.setState({
                    name: '',
                    email: '',
                    message: ''
                });
            }, (error) => {
                toast.error('Error sending email');
            });
    };

    componentDidMount() {
        const lastVisit = localStorage.getItem('lastVisit');
        const dontShow = localStorage.getItem('dontShowAgain');
        const hasVisited = localStorage.getItem('hasVisited');

        const now = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        // Show walkthrough first if user hasn't visited
        if (!hasVisited) {
            this.setState({ run: true });
        } else {
            // Only show modal if walkthrough has been completed and modal conditions are met
            if (!dontShow && (!lastVisit || now - parseInt(lastVisit) > twentyFourHours)) {
                this.setState({ showModal: true });
            }
        }
    }

    handleCheckboxChange = () => {
        this.setState(prevState => ({
            dontShowAgain: !prevState.dontShowAgain
        }));
    }

    closeModal = () => {
        const { dontShowAgain } = this.state;

        localStorage.setItem('lastVisit', new Date().getTime().toString());

        if (dontShowAgain) {
            localStorage.setItem('dontShowAgain', 'true');
        }

        this.setState({ showModal: false });
    }

    handleJoyrideCallback = (data: any) => {
        const { status } = data;
        const finishedStatuses = ['finished', 'skipped'];

        if (finishedStatuses.includes(status)) {
            localStorage.setItem('hasVisited', 'true');
            
            // After walkthrough is completed, check if modal should be shown
            const lastVisit = localStorage.getItem('lastVisit');
            const dontShow = localStorage.getItem('dontShowAgain');
            const now = new Date().getTime();
            const twentyFourHours = 24 * 60 * 60 * 1000;
            
            if (!dontShow && (!lastVisit || now - parseInt(lastVisit) > twentyFourHours)) {
                this.setState({ showModal: true });
            }
        }
    }

    render() {
        const { run, steps, showModal, dontShowAgain, name, email, message } = this.state;

        // console.log('is modal showing', showModal);

        return (
            <div className="homepage-container">
                <SEO 
                    title="Find Autism Service Providers Near You"
                    description="Get the care you deserve with our free directory of autism service providers. Find autism evaluations, ABA therapy, speech therapy, and occupational therapy services across the United States."
                    keywords="autism services, ABA therapy, autism providers, autism evaluation, speech therapy, occupational therapy, autism spectrum disorder, ASD, autism treatment, autism resources, find autism providers"
                    url="https://autismserviceslocator.com"
                />
                <StructuredData 
                    type="Organization"
                    data={{
                        name: "Autism Services Locator",
                        description: "Free Directory of Autism Services Providers in the United States",
                        url: "https://autismserviceslocator.com",
                        logo: "https://autismserviceslocator.com/ASL_5.2.png",
                        sameAs: [
                            "https://www.facebook.com/autismserviceslocator",
                            "https://twitter.com/autismserviceslocator"
                        ],
                        contactPoint: {
                            "@type": "ContactPoint",
                            telephone: "+1-800-AUTISM",
                            contactType: "customer service",
                            availableLanguage: "English"
                        },
                        areaServed: {
                            "@type": "Country",
                            name: "United States"
                        },
                        serviceType: [
                            "Autism Evaluations",
                            "ABA Therapy",
                            "Speech Therapy",
                            "Occupational Therapy"
                        ]
                    }}
                />
                <StructuredData 
                    type="WebSite"
                    data={{
                        name: "Autism Services Locator",
                        description: "Find autism service providers across the United States",
                        url: "https://autismserviceslocator.com",
                        potentialAction: {
                            "@type": "SearchAction",
                            target: "https://autismserviceslocator.com/providers?search={search_term_string}",
                            "query-input": "required name=search_term_string"
                        }
                    }}
                />
        
                {/* Modal */}
                {showModal && (
                    <div className="homepage-modal-overlay">
                        <div className="homepage-modal">
                            {/* <h2>Scheduled Maintenance!</h2> */}
                            <div className="homepage-modal-content">
                                <h1 className='text-center'>Welcome to Autism Services Locator!</h1>
                                <p>By using our website, you agree to our <Link to="/servicedisclaimer" className='text-[#4A6FA5]'>Service Disclaimer</Link>.</p>
                                <h2 className='text-center'>What's New</h2>
                                <ul>
                                    <li><strong>Nationwide Coverage:</strong> Our website is expanding to cover the entire <strong>United States</strong>! No matter where you are, you'll soon be able to find the right providers and resources near you.</li>
                                    <br/>
                                    <li><strong>Sponsorship Opportunities:</strong> Become a sponsor and support our mission! Sponsors will be featured in a special <strong>Sponsors Section</strong> on our site recognizing their contributions to the autism care community.</li>
                                    <br />
                                    <h3>💡 <strong>Are you a provider?</strong> Join our platform for free! <Link to="/provider-signup" className='text-[#4A6FA5]'>Sign up here</Link></h3>
                                    <br />
                                </ul>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        onChange={this.handleCheckboxChange}
                                        checked={dontShowAgain}
                                    />
                                    Remember my preference (don't show this message again)
                                </label>
                            </div>

                            <button className="homepage-modal-button" onClick={this.closeModal}>Go to Homepage</button>
                        </div>
                    </div>
                )}

                <Joyride
                    run={run}
                    steps={steps}
                    continuous={true}
                    showProgress={true}
                    showSkipButton={true}
                    callback={this.handleJoyrideCallback}
                />

                {/* Discover Section */}
                <div className="discover-section">
                    <img src={utah} alt="background-image" className="discover-section-backgroundImage" />
                    <div className="discover-section-container">
                        <h1 className="discover-section-title">Get The Care You Deserve</h1> <br />
                        <h2 className="discover-section-subtitle">Autism Evaluations | ABA Therapy | Speech Therapy | Occupational Therapy</h2>
                        <div className="discover-section-content">
                            <p className="discover-section-description">
                                We're here to make your search in finding the best providers for you and your family easier. Start your journey with a bit of ease.
                            </p>
                        </div>
                        <div className="discover-section-button-container">
                            <Link to="/providers" className="discover-section-button">Start Your Journey</Link>
                        </div>
                    </div>
                </div>

                {/* Help Us Grow Button */}
                <Link to="/donate" className="floating-donate-button">
                    Help Us Grow
                </Link>

                {/* Sponsors Section */}
                <div className="sponsor-section">
                    <div className="sponsor-section-title-container">
                        <h2 className="sponsor-section-title">Our <br /> Proud <br /> Sponsors</h2>
                    </div>
                    <div className="sponsor-section-list-wrapper">
                        {sponsors.map((sponsor, index) => (
                            <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                                <img className="sponsor-section-list-image" src={sponsor.image} alt={sponsor.name} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Begin Section */}
                <div className="begin-section">
                    <h2 className="begin-section-title">Begin Your Journey with Essential Information</h2>
                    <p className="begin-section-description">
                        Not sure about your child's condition or haven't received a diagnosis yet? <br />
                        Start by taking a simple screening test to see if your child or yourself meet the criteria.
                    </p>
                    <div className="begin-section-button-container">
                        <Link to="/providers" className="begin-section-button1"> VIEW PROVIDERS <StethoscopeIcon className="ml-1 h-5 w-5 text-[white]" /></Link>
                        <Link to="/screening" className="begin-section-button2">SCREENING TOOLS <DraftingCompassIcon className="ml-1 h-5 w-5 text-[white]" /></Link>
                        <Link to="/contact" className="begin-section-button3"> CONTACT US <Mail className="ml-1 h-5 w-5 text-[white]" /></Link>
                    </div>
                </div>

                {/* Icons Section */}
                <div className="what-we-are-about" id="view">
                    <div className="what-we-are-about-container">
                        <img src={love} alt="heart" className="what-we-are-about-image" />
                    </div>
                    <div className="what-we-are-about-text-container">
                        <h1 className="what-we-are-about-title">What We're All About</h1>
                        <h2 className="what-we-are-about-subtitle">Made for Everyone</h2>
                        <p className="what-we-are-about-description">We founded Autism Services with one goal in mind: to provide high-quality support and resources for families seeking different types of providers. Our mission is to ensure that families have access to the best possible care for their children, regardless of their location. We strive to make the process of finding and connecting with autism services simple, reliable, and accessible for everyone.</p>
                        {/* <button className="max-w-fit bg-[#4A6FA5] text-white rounded-md px-4 py-2 hover:bg-[#A54A4A] border-none">Learn More About Us</button> */}
                    </div>
                </div>
                <div className='contact-form-container'>
                    <h2 className='contact-form-title'>We'd Love to Hear From You</h2>
                    <form className='contact-form' onSubmit={this.handleSubmit}>
                        <input
                            type="text"
                            className='contact-form-input'
                            name="name"
                            value={name}
                            onChange={this.handleInputChange}
                            placeholder='Name'
                            required
                        />
                        <input
                            type="email"
                            className='contact-form-input'
                            name="email"
                            value={email}
                            onChange={this.handleInputChange}
                            placeholder='Email'
                            required
                        />
                        <textarea
                            className='contact-form-textarea'
                            name="message"
                            value={message}
                            onChange={this.handleInputChange}
                            placeholder='Message'
                            required
                        />
                        <button type='submit'>Submit</button>
                    </form>
                </div>
            </div>
        );
    }
}

export default Homepage;
