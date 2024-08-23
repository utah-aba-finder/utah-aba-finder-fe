import React, { Component } from 'react'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import utah from '../Assets/utah.jpg'
import "./Homepage.css"

type Props = {}

type State = {}

class Homepage extends Component<Props, State> {
    state = {}

    render() {
        return (
            <div className='homepage-container'>
                <Header />
                <div className='discover-section'>

                    <img src={utah} alt="background-image" className='discover-section-backgroundImage' />

                    <h1 className='discover-section-title'>Discover the Ideal ABA Therapy Provider <br /> for Your Child with Autism in Utah</h1>

                    <div className='discover-section-content'>
                        <p className='discover-section-description'>Are you feeling overwhelmed in your search for the right care? We’re here to guide you every step of the way. Start your journey with confidence today.</p>
                        <button className='discover-section-button'>Start Your Journey</button>
                    </div>

                </div>
                <div className='county-section'></div>
                <div className='begin-section'></div>
                <div className='icons-section'></div>
                <div className='spanish-section'></div>
                <Footer />
            </div>
        )
    }
}

export default Homepage