import React from 'react'
import donateBanner from '../Assets/donate.jpg'
import '../Donations/Donations.css'

const Donations = () => {
    return (
        <div>
            <div className='donateBannerContainer'>
                <img src={donateBanner} alt="Login Banner" className='loginBanner' />
                <h1 className='donateBannerTitle'>Donate</h1>
            </div>
            <div className='donateContainer'>
                <p>Thank you for your interest in donating to Utah ABA Locator! <br /> We are a non-profit organization that relies on the generosity of people like you to continue our work.</p>

                <p>If you have any questions about donating, please contact us at <a href="mailto:utahabalocator@gmail.com">utahabalocator@gmail.com</a>.</p>
            </div>
        </div>
    )
}

export default Donations