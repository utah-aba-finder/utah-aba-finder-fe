import React from 'react'
import './ScreeningPage.css'
import { Link } from 'react-router-dom'


export const ScreeningPage: React.FC = () => {

    return (
        <div className='ScreeningPageWrapper'>
            <div className='ImageContainer'>
                <h1 className='toolsText'>Screening Tools</h1>
            </div>
            <div className='ScreeningContainer'>
                <div className='ScreeningMessage'>
                    <h1 className='keepInMind'>Keep In Mind!!</h1>
                    <p>If you think that your child may have autism, you can use these screening tools as an initial step in the assessment process.</p>

                    <p>Please keep in mind that these tools are intended to identify potential signs of autism and are not a substitute for an official diagnosis. Please seek a certified helthcare professional for an official diagnosis.</p>
                    <br />
                    <br />
                    <p><strong>M-CHAT:</strong> Modified Checklist for Autism in Toddlers. For children 3 and under.</p>
                    <p><strong>CAST:</strong> Childhood Autism Spectrum Test. For children 4 and older.</p>
                </div>
                <div className='BorderDiv'></div>
                <div className='ScreeningButtons'>
                    <h2 className='buttonText'>For Children 3 and Under:</h2>
                    <a href='https://www.autismspeaks.org/screen-your-child' aria-label='m-cat test button' className='ScreeningButton1'>TAKE THE M-CHAT</a>
                    <h2 className='buttonText'>For Children 4 and Up:</h2>
                    <Link to='/screening/cast' aria-label='cast test button' className='ScreeningButton2'>TAKE THE CAST</Link>
                    <h2 className='buttonText'>Adult Screening Tests:</h2>
                    <a target='blank' href='https://embrace-autism.com/autism-tests/' aria-label='additional screening tests button' className='ScreeningButton3'>VIEW ADULT TESTS</a>
                </div>
            </div>
        </div>
    )
}