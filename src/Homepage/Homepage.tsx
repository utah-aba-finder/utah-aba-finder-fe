import React, { Component } from 'react'
import utah from '../Assets/Utah-Background.jpg'
import mapIcon from '../Assets/map-icon.png'
import puzzleIcon from '../Assets/puzzle-icon.png'
import insuranceIcon from '../Assets/insurance-icon.png'
import familyIcon from '../Assets/family-icon.png'
import spanishPic from '../Assets/spanish-pic.jpg'
import "./Homepage.css"

type Props = {}

type State = {}

class Homepage extends Component<Props, State> {
    state = {}

    render() {
        return (
            <div className='homepage-container'>
                <div className='discover-section'>
                    <img src={utah} alt="background-image" className='discover-section-backgroundImage' />
                    <div className='discover-section-container'>
                        <h1 className='discover-section-title'>
                            Discover the Ideal ABA Therapy Provider <br /> for Your Child with Autism in Utah
                        </h1>
                        <div className='discover-section-content'>
                            <p className='discover-section-description'>
                                Are you feeling overwhelmed in your search for the right care? We’re here to guide you every step of the way. <br />Start your journey with confidence today.
                            </p>
                            <button className='discover-section-button'>Start Your Journey</button>
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
                    <p className='begin-section-description'>Not sure about your child’s condition or haven’t received a diagnosis yet? We’re here to assist you. Start by taking a simple test to see if your child meets the criteria.</p>
                    <div className='begin-section-button-container'>
                        <button className='begin-section-button1'>VIEW PROVIDERS</button>
                        <button className='begin-section-button2'>HELP WITH DIAGNOSIS</button>
                    </div>

                </div>
                <div className="icons-section">
                    <div className="icons-section-icon">
                        <img src={mapIcon} alt="Map Icon" />
                        <p>Locate the Providers</p>
                    </div>
                    <div className="icons-section-icon">
                        <img src={puzzleIcon} alt="Puzzle Icon" />
                        <p>Educate Yourself with Autism</p>
                    </div>
                    <div className="icons-section-icon">
                        <img src={insuranceIcon} alt="Insurance Icon" />
                        <p>Verify Insurance Coverage</p>
                    </div>
                    <div className="icons-section-icon">
                        <img src={familyIcon} alt="Family Icon" />
                        <p>Rest Assured <br /> We got you!</p>
                    </div>
                </div>
                <div className='spanish-section'>
                    <div className="spanish-section-texts">
                        <h2>Now Available: Spanish-Speaking Providers</h2>
                        <p className='spanish-section-description'>We know how important it is to communicate in your language. We have Spanish-speaking providers available to assist with your ABA needs in Utah.</p>
                        <button className='spanish-section-button'>Learn More</button>
                    </div>
                    <div className="spanish-section-image">
                        <img src={spanishPic} alt="Spanish picture" className='spanish-section-pic' />
                    </div>
                </div>
            </div>
        )
    }
}

export default Homepage