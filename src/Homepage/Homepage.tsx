import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import utah from '../Assets/williamsonFamily.jpeg';
import './Homepage.css';
import Joyride from 'react-joyride';
import love from '../Assets/love.jpg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from 'emailjs-com';
//sponsor images
import wansutter from '../Assets/sponsor-images/wansutter.png';
import ACU from '../Assets/sponsor-images/ACU.png'



type Props = {}

interface State {
    run: boolean;
    steps: Array<{ target: string; content: string; disableBeacon?: boolean }>;
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
                content: 'Welcome to our website! Start your journey by a quick tour. Here you can find you desired providers.',
                disableBeacon: true
            },
            {
                target: '.sponsor-section',
                content: 'See our sponsors who help make this website possible!',
            },
            {
                target: '.begin-section',
                content: 'Here you can find providers, screening tools, and contact us for any questions.',
            },
            {
                target: '.what-we-are-about',
                content: 'Learn more about what we are all about!',
            },
            {
                target: 'header nav',
                content: 'Click to view providers, Conduct Screening Tests, Donate, or contact us for any questions.',
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

        const now = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            this.setState({ run: true });
        }
        if (!dontShow && (!lastVisit || now - parseInt(lastVisit) > twentyFourHours)) {
            this.setState({ showModal: true });
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
        }
    }

    render() {
        const { run, steps, showModal, dontShowAgain, name, email, message } = this.state;

        // console.log('is modal showing', showModal);

        return (
            <div className="homepage-container">
                <ToastContainer />
                {/* Modal */}
                {showModal && (
                    <div className="homepage-modal-overlay">
                        <div className="homepage-modal">
                            <h2>Scheduled Maintenance!</h2>
                            <div className="homepage-modal-content">

                                <p>If you have been to our website before, you may have noticed some changes!
                                    We have changed our name from Utah ABA Locator to Autism Services Locator and we are now a 501(c)(3) organization.</p>

                                <ul>
                                    <li><strong>Sponsorship Opportunities:</strong> Become a sponsor and support our mission! Sponsors will be featured in a special <strong>Sponsors Section</strong> on our site recognizing their contributions to the autism care community.</li>
                                    <br />
                                    <li><strong>Expanding Services:</strong> We're currently adding <strong>Occupational</strong> and <strong>Speech Therapy</strong> , and <strong>Autism Evaluation Providers</strong> to our platform, making it easier for you to find comprehensive care options for your child all in one place.</li>
                                    <h3>** If you're a provider and would like to be added to our platform, please <Link to="/contact" className='text-[#4A6FA5]'>contact us</Link>, it's completely free!</h3>
                                    <br />
                                </ul>
                                <h2 className='text-center'>Upcoming Changes!</h2>
                                <ul>
                                    <li><strong>Nationwide Coverage:</strong> Our website is expanding to cover the entire <strong>United States</strong>! No matter where you are, you'll soon be able to find the right ABA providers, therapists, and resources near you.</li>
                                </ul>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        onChange={this.handleCheckboxChange}
                                        checked={dontShowAgain}
                                    />
                                    Don't show this again
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
                                We're here to guide you every step of the way in finding the best providers for you and your family. Start your journey with a bit of ease.
                            </p>
                        </div>
                        <div className="discover-section-button-container">
                            <Link to="/providers" className="discover-section-button">Start Your Journey</Link>
                        </div>
                    </div>
                </div>

                {/* Donate Button */}
                <Link to="/donate" className="floating-donate-button">
                    Donate
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
                        <Link to="/providers" className="begin-section-button1"> VIEW PROVIDERS</Link>
                        <Link to="/screening" className="begin-section-button2">SCREENING TOOLS</Link>
                        <Link to="/contact" className="begin-section-button3"> CONTACT US</Link>
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
