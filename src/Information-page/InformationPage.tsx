import React, { Component } from 'react';
import informationPic from '../Assets/information-banner.jpg';
import './InformationPage.css';

type Props = {};
type State = {};

class InformationPage extends Component<Props, State> {
    state = {};

    render() {
        return (
            <div className='info-page'>
                <div className='info-banner-container'>
                    <img src={informationPic} alt="Information banner" className='infoPic' />
                    <h1 className='info-banner-title'>What is Autism Spectrum Disorder?</h1>
                </div>
                <div className='info-content'>
                    <section className='info-content-section1'>
                        <h2 className='info-content-title'>Autism Spectrum Disorder (ASD)</h2>
                        <p>Autism spectrum disorder (ASD) is a neurological and developmental disorder that affects how people interact with others, communicate, learn, and behave. Although autism can be diagnosed at any age, it is described as a “developmental disorder” because symptoms generally appear in the first 2 years of life.</p>
                    </section>
                    <section className='info-content-section2'>
                        <h2 className='info-content-title'>Can it be treated?</h2>
                        <p>There is no cure for autism spectrum disorder (ASD), but there are servcies that can help improve symptoms and support development and learning. The goal of these services is to help people with ASD function better in their daily lives and improve their quality of life. Services can be provided in a variety of settings, including at home, in the community, in schools, or through health services.</p>
                    </section>
                    <section className='info-content-section3'>
                        {/* <details> */}
                        <summary className='info-content-title'>
                            Helpful services for ASD
                        </summary>
                        <ul className='spaced-list'>
                            <li><strong>Early intervention:</strong> Research suggests that early intervention, especially during preschool years, can have a significant positive impact on symptoms and later skills.</li>

                            <li><strong>Behavioral therapies:</strong> These include applied behavior analysis (ABA), behavioral management therapy, and cognitive behavior therapy.</li>

                            <li><strong>Educational therapies:</strong> These can include school-based therapies and special symbols that help children learn to communicate.</li>

                            <li><strong>Occupational therapy:</strong> This can help children learn life skills like dressing themselves, feeding, bathing, and relating to others.</li>

                            <li><strong>Sensory integration therapy:</strong> This can help children learn to cope with sensory information that might upset them, like bright lights, certain sounds, or being touched.</li>

                            <li><strong>Other therapies:</strong> These can include physical therapy, speech-language therapy, joint attention therapy, and nutritional therapy.</li>

                            <li><strong>Medications:</strong> Some symptoms may be helped by medications.</li>
                        </ul>
                        {/* </details> */}
                    </section>
                </div>
            </div>
        );
    }
}

export default InformationPage;