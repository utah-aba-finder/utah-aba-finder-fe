import React, { useState } from 'react';
import './Resources.css';
import { ChevronDown, ChevronUp } from 'lucide-react';
const resourceBannerVideo = require('../Assets/resource-banner.mp4');

const podCasts = [
    {
        title: "Autism Navigation Pod",
        url: "https://open.spotify.com/embed/episode/7lOy8KyWzMEJHwudATB5K6?utm_source=generator&theme=0"
    },
    {
        title: "Navigating Adult Autism",
        url: "https://open.spotify.com/embed/show/43VNbJfLCHwXod0rsfVqFW"
    },
    {
        title:"The Telepathy Tapes",
        url: "https://open.spotify.com/embed/show/1zigaPaUWO4G9SiFV0Kf1c"
    }
]




const Resources = () => {
    const [websites, setWebsites] = useState(false);
    const [podcasts, setPodcasts] = useState(false);
    const [providerInfo, setProviderInfo] = useState(false);

    return (
        <div className="resources-container">
            <div className="resources-banner">
                <video className="resources-banner-video" autoPlay muted loop playsInline>
                    <source src={resourceBannerVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="resources-title-container">
                    <h1 className="resources-title">Resources</h1>
                </div>
            </div>
            <div className="resources-content">
                <h2 className="resources-content-description">Click on any of the different buttons below to expand the resources!</h2>
                <button className={`provider-info-button ${providerInfo ? 'active' : ''}`} onClick={() => setProviderInfo(!providerInfo)}>Printable Information for Providers {providerInfo ? <ChevronUp /> : <ChevronDown />}</button>
                {providerInfo ? (
                    <div className="resources-content-container">
                    <hr className="divider" />
                    <p className="resources-content-description">Click below to download/print the document to handout</p>
                    <div className="provider-info-container">
                        <div className="provider-actions">
                            <a 
                                href={require('../Assets/ProviderHandout.png')}
                                download="provider_handout.png"
                                className="provider-info-link"
                            >
                                Download Printable Image
                            </a>
                            <button 
                                onClick={() => {
                                    const printWindow = window.open('', '_blank');
                                    if (printWindow) {
                                        printWindow.document.write(`
                                            <!DOCTYPE html>
                                            <html>
                                            <head>
                                                <title>Provider Handout - Print</title>
                                                <style>
                                                    @media print {
                                                        @page {
                                                            margin: 0;
                                                            size: letter;
                                                        }
                                                        body {
                                                            margin: 0;
                                                            padding: 0;
                                                        }
                                                        img {
                                                            width: 100vw;
                                                            height: 100vh;
                                                            object-fit: contain;
                                                            display: block;
                                                        }
                                                    }
                                                    body {
                                                        margin: 0;
                                                        padding: 0;
                                                        display: flex;
                                                        justify-content: center;
                                                        align-items: center;
                                                        min-height: 100vh;
                                                    }
                                                    img {
                                                        max-width: 100%;
                                                        max-height: 100vh;
                                                        object-fit: contain;
                                                    }
                                                </style>
                                            </head>
                                            <body>
                                                <img src="${require('../Assets/ProviderHandout.png')}" alt="Provider Handout" />
                                                <script>
                                                    window.onload = function() {
                                                        window.print();
                                                    }
                                                </script>
                                            </body>
                                            </html>
                                        `);
                                        printWindow.document.close();
                                    }
                                }}
                                className="provider-print-button"
                            >
                                Print
                            </button>
                        </div>
                        <img
                            src={require('../Assets/ProviderHandout.png')}
                            alt="Provider Handout Preview"
                            width="100%"
                            height="500px"
                            className="png-preview"
                            style={{ objectFit: 'contain', maxHeight: '500px' }}
                        />
                        </div>
                    </div>
                ) : null}

                <button className={`websites-button ${websites ? 'active' : ''}`} onClick={() => setWebsites(!websites)}>Useful Websites {websites ? <ChevronUp /> : <ChevronDown />}</button>
                {websites ? (
                    <div className="useful-websites-container">
                    <hr className="divider" />
                    <ul>
                        <li>
                            <a href="https://www.ssa.gov/ssi" target="_blank" rel="noopener noreferrer">
                                Social Security Administration
                            </a>
                            - Here you can find information about Social Security benefits for individuals with disabilites.
                        </li>
                        <li>
                            <a href="https://www.autismspeaks.org/" target="_blank" rel="noopener noreferrer">
                                Autism Speaks
                            </a>
                            - Autism Speaks offers a wealth of information about autism spectrum disorder (ASD), different therapy options including ABA therapy, and resources for families, educators, and professionals.
                        </li>
                        <li>
                            <a href="https://autismnavigator.com/" target="_blank" rel="noopener noreferrer">
                                Autism Navigator
                            </a>
                            - Autism Navigator provides online courses and resources for families and professionals, focusing on early diagnosis and intervention for autism, including ABA strategies.
                        </li>
                        <li>
                            <a href="https://www.nationalautismcenter.org/" target="_blank" rel="noopener noreferrer">
                                The National Autism Center
                            </a>
                            - This site offers evidence-based information and resources on autism and ABA therapy, including guidelines for best practices and research reports.
                        </li>
                        <li>
                            <a href="https://asatonline.org/" target="_blank" rel="noopener noreferrer" >
                                Association for Science in Autism Treatment (ASAT)
                            </a>
                            - ASAT provides scientifically validated information about autism treatment, including ABA therapy. The site also offers resources for parents and professionals to help them navigate treatment options.
                        </li>
                        <li>
                            <a href="https://theautismhelper.com/" target="_blank" rel="noopener noreferrer">
                                The Autism Helper
                            </a>
                            - The Autism Helper offers a variety of resources, including blogs, podcasts, and downloadable materials for parents, teachers, and therapists working with individuals with autism.
                        </li>
                        <li>
                            <a href="https://www.bacb.com/" target="_blank" rel="noopener noreferrer">
                                Behavior Analyst Certification Board (BACB)
                            </a>
                            - BACB provides information about the certification process for behavior analysts and resources related to ABA therapy. It's particularly useful for those pursuing a career in ABA.
                        </li>
                        <li>
                            <a href="https://www.rethinkbh.com/" target="_blank" rel="noopener noreferrer">
                                Rethink Behavioral Health
                            </a>
                            - This platform offers tools and resources for ABA professionals, including training videos, treatment plans, and data collection tools.
                        </li>
                        <li>
                            <a href="https://www.autism-society.org/" target="_blank" rel="noopener noreferrer" >
                                Autism Society
                            </a>
                            - The Autism Society provides comprehensive information about autism, advocacy efforts, and a directory of local resources, including information on ABA therapy.
                        </li>
                        <li>
                            <a href="https://www.iaba.com/" target="_blank" rel="noopener noreferrer">
                                Institute for Applied Behavioral Analysis (IABA)
                            </a>
                            - IABA offers resources and training for professionals in the field of ABA, focusing on providing positive behavioral support.
                        </li>
                        <li>
                            <a href="https://www.nimh.nih.gov/health/topics/autism-spectrum-disorders-asd" target="_blank" rel="noopener noreferrer">
                                The National Institute of Mental Health (NIMH) - Autism Spectrum Disorder
                            </a>
                            - The NIMH provides detailed information on autism spectrum disorders, including symptoms, causes, and treatment options like ABA therapy.
                        </li>
                    </ul>
                </div>
                ) : null}
                <button className={`podcasts-button ${podcasts ? 'active' : ''}`} onClick={() => setPodcasts(!podcasts)}>Podcasts {podcasts ? <ChevronUp /> : <ChevronDown />}</button>
                {podcasts ? (
                    <div className="podcasts-container">
                    <hr className="divider" />
                    {podCasts.map((podcast) => (
                        <iframe 
                            src={podcast.url} 
                            width="100%" 
                            height="152" 
                            frameBorder="0" 
                            allowFullScreen 
                            allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy"
                            title={podcast.title}
                        ></iframe>
                    ))}
                </div>
                ) : null}

            </div>
        </div>
    );
};

export default Resources;