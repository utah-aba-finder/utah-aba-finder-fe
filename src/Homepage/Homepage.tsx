import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import utah from '../Assets/williamsonFamily.jpeg';
import './Homepage.css';
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
        // Removed walkthrough and update message functionality
    }

    render() {
        const { name, email, message } = this.state;

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
                            "Advocates",
                            "Coaching & Mentoring",
                            "Speech Therapy",
                            "Occupational Therapy",
                            "Educational Programs",
                            "Barbers & Hair",
                            "Dentists",
                            "Orthodontists",
                            "Pediatricians",
                            "Physical Therapists",
                            "Therapists"
                        ],
                        provider: {
                            "@type": "Organization",
                            name: "Autism Services Locator",
                            url: "https://autismserviceslocator.com"
                        }
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

                {/* Discover Section */}
                <div className="discover-section">
                    <img src={utah} alt="background-image" className="discover-section-backgroundImage" />
                    <div className="discover-section-container">
                        <h1 className="discover-section-title">Get The Care You Deserve</h1> <br />
                            <h2 className="discover-section-subtitle">Autism Evaluations | ABA Therapy | Advocates | Coaching & Mentoring | Speech Therapy | Occupational Therapy | Educational Programs | Barbers & Hair | Dentists | Orthodontists | Pediatricians | Physical Therapists | Therapists</h2>
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
