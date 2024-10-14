import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import utah from '../Assets/Utah-Background.jpg';
import mapIcon from '../Assets/map-icon.png';
import puzzleIcon from '../Assets/puzzle-icon.png';
import insuranceIcon from '../Assets/insurance-icon.png';
import familyIcon from '../Assets/family-icon.png';
import spanishPic from '../Assets/spanish-pic.jpg';
import './Homepage.css';
import Joyride, { Step } from 'react-joyride';
import studyIcon from '../Assets/material.png';

type Props = {}

interface State {
    run: boolean;
    steps: Array<{ target: string; content: string; disableBeacon?: boolean }>;
    showModal: boolean;
    dontShowAgain: boolean;
}

class Homepage extends Component<Props, State> {
    state: State = {
        run: false,
        steps: [
            {
                target: '.discover-section-title',
                content: 'Welcome to our website! Start your journey by a quick tour.',
                disableBeacon: true
            },
            {
                target: '.county-section',
                content: 'Check out the counties we cover for ABA therapy in Utah.',
            },
            {
                target: '.begin-section-button-container',
                content: 'Click to view providers, take M-CHAT or CAST, or contact us for any questions.',
            },
            {
                target: '.icons-section',
                content: 'Here, you can locate providers, educate yourself with autism, get insurance info, get resources, and take the M-CHAT or the CAST test.',
            },
            {
                target: '.spanish-section-button',
                content: 'You can search for Spanish-speaking providers as well.',
            },
            {
                target: '#menu-button',
                content: 'Click menu button to view the contents and explore our website!',
            },
        ],
        showModal: false,
        dontShowAgain: false
    }

    componentDidMount() {
        const lastVisit = localStorage.getItem('lastVisit');
        const dontShow = localStorage.getItem('dontShowAgain');

        const now = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;

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
        const { run, steps, showModal, dontShowAgain } = this.state;

        // console.log('is modal showing', showModal);

        return (
            <div className="homepage-container">
                {/* Modal */}
                {showModal && (
                    <div className="homepage-modal-overlay">
                        <div className="homepage-modal">
                            <h2>Upcoming Changes!</h2>
                            <div className="homepage-modal-content">
                                <p>We're excited to announce some amazing new features coming soon to improve your experience and better support families seeking care:</p>

                                <ul>
                                    <li><strong>Sponsorship Opportunities:</strong> Become a sponsor and support our mission! Sponsors will be featured in a special <strong>Sponsors Section</strong> on our website and receive a <strong>special badge</strong> recognizing their contributions to the autism care community.</li>
                                    <br />
                                    <li><strong>Donation Feature:</strong> You'll be able to contribute and support autism care providers and families in need. Every donation makes a difference!</li>
                                    <br />
                                    <li><strong>Expanding Services:</strong> We're adding <strong>occupational</strong> and <strong>speech therapy</strong> , and <strong>diagnosis providers</strong> to our platform, making it easier for you to find comprehensive care options for your child all in one place.</li>
                                    <br />
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
                        <h1 className="discover-section-title">Find The Best Fit ABA Provider For You</h1>
                        <div className="discover-section-content">
                            <p className="discover-section-description">
                                We’re here to guide you every step of the way in finding the best ABA provider for you. <br />Start your journey with confidence today.
                            </p>
                        </div>
                        <div className="discover-section-button-container">
                            <Link to="/providers" className="discover-section-button">Start Your Journey</Link>
                        </div>
                    </div>
                </div>

                {/* Counties Section */}
                <div className="county-section">
                    <h2 className="county-section-title">Counties Covered</h2>
                    <div className="county-section-list-wrapper">
                        <div className="county-section-list">
                            <p>Salt Lake <br /> County</p>
                            <p>Utah <br /> County</p>
                            <p>Davis <br /> County</p>
                            <p>Weber <br /> County</p>
                            <p>Iron <br /> County</p>
                            <p>Cache <br /> County</p>
                            <p>Box Elder <br /> County</p>
                            <p>Washington <br /> County</p>
                            <p>Morgan <br /> County</p>
                            <p>Summit <br /> County</p>
                            <p>Tooele <br /> County</p>
                            <p>Duchesne <br /> County</p>
                            <p>Uintah <br /> County</p>
                            <p>Sanpete <br /> County</p>
                            <p>Wayne <br /> County</p>
                            <p>Salt Lake <br /> County</p>
                            <p>Utah <br /> County</p>
                            <p>Davis <br /> County</p>
                            <p>Weber <br /> County</p>
                            <p>Iron <br /> County</p>
                            <p>Cache <br /> County</p>
                            <p>Box Elder <br /> County</p>
                            <p>Washington <br /> County</p>
                            <p>Morgan <br /> County</p>
                            <p>Summit <br /> County</p>
                            <p>Tooele <br /> County</p>
                            <p>Duchesne <br /> County</p>
                            <p>Uintah <br /> County</p>
                            <p>Sanpete <br /> County</p>
                            <p>Wayne <br /> County</p>
                            <p>Salt Lake <br /> County</p>
                            <p>Utah <br /> County</p>
                            <p>Davis <br /> County</p>
                            <p>Weber <br /> County</p>
                            <p>Iron <br /> County</p>
                            <p>Cache <br /> County</p>
                            <p>Box Elder <br /> County</p>
                            <p>Washington <br /> County</p>
                            <p>Morgan <br /> County</p>
                            <p>Summit <br /> County</p>
                            <p>Tooele <br /> County</p>
                            <p>Duchesne <br /> County</p>
                            <p>Uintah <br /> County</p>
                            <p>Sanpete <br /> County</p>
                            <p>Wayne <br /> County</p>
                        </div>
                    </div>
                </div>

                {/* Begin Section */}
                <div className="begin-section">
                    <h2 className="begin-section-title">Begin Your Journey with Essential Information</h2>
                    <p className="begin-section-description">
                        Not sure about your child's condition or haven't received a diagnosis yet? <br />
                        We're here for you. Start by taking a simple screening test to see if your child meets the criteria.
                    </p>
                    <div className="begin-section-button-container">
                        <Link to="/providers" className="begin-section-button1"> VIEW PROVIDERS</Link>
                        <Link to="/screening" className="begin-section-button2">SCREENING TOOLS</Link>
                        <Link to="/contact" className="begin-section-button3"> CONTACT US</Link>
                    </div>
                </div>

                {/* Icons Section */}
                <div className="icons-section" id="view">
                    <div className="icons-section-icon" id="block">
                        <Link className="homeIcons" to="/providers"><img src={mapIcon} alt="Map Icon" /></Link>
                        <p>Locate the Providers</p>
                    </div>
                    <div className="icons-section-icon" id="block">
                        <Link className="homeIcons" to="/information"><img src={puzzleIcon} alt="Puzzle Icon" /></Link>
                        <p>Educate Yourself with Autism</p>
                    </div>
                    <div className="icons-section-icon" id="block">
                        <Link className="homeIcons" to="/providers"><img src={insuranceIcon} alt="Insurance Icon" /></Link>
                        <p>Verify Insurance Coverage</p>
                    </div>
                    <div className="icons-section-icon" id="block">
                        <Link className="homeIcons" to="/resources"><img src={studyIcon} alt="Resources Icon" /></Link>
                        <p>Get helpful Resources</p>
                    </div>
                    <div className="icons-section-icon" id="block">
                        <Link to="/screening"><img src={familyIcon} alt="Family Icon" /></Link>
                        <p>Rest Assured <br /> We got you!</p>
                    </div>
                </div>

                {/* Spanish-Speaking Providers Section */}
                <div className="spanish-section">
                    <div className="spanish-section-texts">
                        <h2 className="spanish-section-title">Now Available: Spanish-Speaking Providers</h2>
                        <p className="spanish-section-description">
                            We know how important it is to communicate in your language. We have Spanish-speaking providers available to assist with your ABA needs in Utah.
                        </p>
                        <Link to="/providers" className="spanish-section-button">Learn More</Link>
                    </div>
                    <div className="spanish-section-image">
                        <img src={spanishPic} alt="Spanish" className="spanish-section-pic" />
                    </div>
                </div>
            </div>
        );
    }
}

export default Homepage;
