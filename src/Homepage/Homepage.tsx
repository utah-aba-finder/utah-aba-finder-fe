import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import utah from '../Assets/Utah-Background.jpg'
import mapIcon from '../Assets/map-icon.png'
import puzzleIcon from '../Assets/puzzle-icon.png'
import insuranceIcon from '../Assets/insurance-icon.png'
import familyIcon from '../Assets/family-icon.png'
import spanishPic from '../Assets/spanish-pic.jpg'
import "./Homepage.css"
import Joyride, { Step } from 'react-joyride';
import studyIcon from '../Assets/material.png'

type Props = {}

type State = {
    run: boolean,
    steps: Step[],
}

class Homepage extends Component<Props, State> {
    state = {
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
                content: 'Here, you can locate providers, educate yourself with autism, get insurance info, get resources,and take the M-CHAT or the CAST test.',
            },
            {
                target: '.spanish-section-button',
                content: 'You can search for Spanish-speaking providers as well.',
            },
            {
                target: '#menu-button',
                content: 'Click menu button to view the contents and explore our website!',
            },
        ]
    }

    componentDidMount() {
        const hasVisited = localStorage.getItem('hasVisited');

        if (!hasVisited) {
            this.setState({ run: true });
        }
    }

    handleJoyrideCallback = (data: any) => {
        const { status } = data;

        const finishedStatuses = ['finished', 'skipped'];

        if (finishedStatuses.includes(status)) {
            localStorage.setItem('hasVisited', 'true');
        }
    };

    render() {
        const { run, steps } = this.state;

        return (
            <div className='homepage-container'>
                <Joyride
                    run={run}
                    steps={steps}
                    continuous={true}
                    showProgress={true}
                    showSkipButton={true}
                    callback={this.handleJoyrideCallback}
                />

                <div className='discover-section'>
                    <img src={utah} alt="background-image" className='discover-section-backgroundImage' />
                    <div className='discover-section-container'>
                        <h1 className='discover-section-title'>
                            Discover the Ideal ABA Therapy Provider <br /> for Your Child in Utah
                        </h1>
                        <div className='discover-section-content'>
                            <p className='discover-section-description'>
                                Are you feeling overwhelmed in your search for the right care? We’re here to guide you every step of the way. <br />Start your journey with confidence today.
                            </p>
                            <Link to="/providers" className='discover-section-button'>Start Your Journey</Link>
                        </div>
                    </div>
                </div>

                <div className='county-section'>
                    <h2 className='county-section-title'>Counties Covered</h2>
                    <div className='county-section-list-wrapper'>
                        <div className='county-section-list'>
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

                <div className='begin-section'>
                    <h2 className='begin-section-title'>Begin Your Journey with Essential Information</h2>
                    <p className='begin-section-description'>
                        Not sure about your child’s condition or haven’t received a diagnosis yet? <br />
                        We’re here for you. Start by taking a simple screening test to see if your child meets the criteria.
                    </p>
                    <div className='begin-section-button-container'>
                        <Link to="/providers" className='begin-section-button1'> VIEW PROVIDERS</Link>
                        <Link to="/screening" className='begin-section-button2'>SCREENING TOOLS </Link>
                        <Link to="/contact" className='begin-section-button3'> CONTACT US</Link>
                    </div>
                </div>

                <div className="icons-section" id="view">
                    <div className="icons-section-icon" id={"block"}>
                        <Link className='homeIcons'to="/providers"><img src={mapIcon} alt="Map Icon" /></Link>
                        <p>Locate the Providers</p>
                    </div>
                    <div className="icons-section-icon" id={"block"}>
                        <Link className='homeIcons' to="/information"><img src={puzzleIcon} alt="Puzzle Icon" /></Link>
                        <p>Educate Yourself with Autism</p>
                    </div>
                    <div className="icons-section-icon" id={"block"}>
                        <Link className='homeIcons' to="/providers"><img src={insuranceIcon} alt="Insurance Icon" /></Link>
                        <p>Verify Insurance Coverage</p>
                    </div>
                    <div className="icons-section-icon" id={"block"}>
                        <Link className='homeIcons' to="/resources"><img src={studyIcon} alt="Resources Icon" /></Link>
                        <p>Get helpful Resources</p>
                    </div>
                    <div className="icons-section-icon" id={"block"}>
                        <Link to="/screening"><img src={familyIcon} alt="Family Icon" /></Link>
                        <p>Rest Assured <br /> We got you!</p>
                    </div>
                </div>

                <div className='spanish-section'>
                    <div className="spanish-section-texts">
                        <h2 className='spanish-section-title'>Now Available: Spanish-Speaking Providers</h2>
                        <p className='spanish-section-description'>
                            We know how important it is to communicate in your language. We have Spanish-speaking providers available to assist with your ABA needs in Utah.
                        </p>
                        <Link to="/providers" className='spanish-section-button'>Learn More</Link>
                    </div>
                    <div className="spanish-section-image">
                        <img src={spanishPic} alt="Spanish" className='spanish-section-pic' />
                    </div>
                </div>
            </div>
        )
    }
}

export default Homepage