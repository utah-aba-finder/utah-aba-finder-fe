import React from 'react';
import './Resources.css';
import behaviorImage from '../Assets/behavior-image.png'
import socialImage from '../Assets/social-image.png'
import detailImage from '../Assets/detail-image.png'

const resourceBannerVideo = require('../Assets/resource-banner.mp4');

const Resources = () => {
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
                <div className="resources-content-container">
                    <h1>Printable Information for Providers</h1>
                    <hr className="divider" />
                    <p className="resources-content-description">Click below to download/print the document to handout</p>
                    <div className="provider-info-container">
                        <a 
                            href={require('../Assets/provider_handout.pdf')}
                            download="provider_handout.pdf"
                            className="provider-info-link"
                        >
                            <object
                                data={require('../Assets/provider_handout.pdf')}
                                type="application/pdf"
                                width="100%"
                                height="500px"
                                className="pdf-preview"
                                // style={{ width: '100%', height: '50vh' }}
                            >
                                <p>Your browser does not support PDF preview. Click here to download.</p>
                            </object>
                        </a>
                    </div>
                </div>
                {/* <h1>Useful Forms</h1>
                <hr className="divider" />
                <p className="resources-content-description">Click the image to download/print the worksheets</p>
                <div className="resource-links-container">
                    <div className="resource-image-container">
                        <h3>Behavior Tracking Worksheet</h3>
                        <a href="https://docs.google.com/document/d/1k9adZvc0qy_hpwxb-odU-OtGWjBiD4BifIObdskplwQ/edit?usp=sharing" target="_blank" rel="noopener noreferrer">
                            <img src={behaviorImage} alt="Behavior Tracking Sheet" />
                        </a>
                    </div>

                    <div className="resource-image-container">
                        <h3>Detailed Goal Setting Worksheet</h3>
                        <a href="https://docs.google.com/document/d/1Bg_EzRx8ozIHrDDpkkcv6cHZTtONIxhTgYPNzqIf-Co/edit?usp=sharing" target="_blank" rel="noopener noreferrer">
                            <img src={detailImage} alt="Detailed Goal Setting Worksheet" />
                        </a>
                    </div>

                    <div className="resource-image-container">
                        <h3>Social Stories and Scripts Worksheet</h3>
                        <a href="https://docs.google.com/document/d/1UrYopDLjw0OXp-58D6HeYbGtGd1CSQ7Eo_j9HZUWi4Y/edit?usp=sharing" target="_blank" rel="noopener noreferrer">
                            <img src={socialImage} alt="Social Stories and Scripts Worksheet" />
                        </a>
                    </div>
                </div> */}

                <h1>Useful Websites</h1>
                <hr className="divider" />
                <div className="useful-websites-container">
                    <ul>
                        <li>
                            <a href="https://www.autismspeaks.org/" target="_blank" rel="noopener noreferrer">
                                Autism Speaks
                            </a>
                            - Autism Speaks offers a wealth of information about autism spectrum disorder (ASD), treatment options including ABA therapy, and resources for families, educators, and professionals.
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
                            - BACB provides information about the certification process for behavior analysts and resources related to ABA therapy. It’s particularly useful for those pursuing a career in ABA.
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


            </div>
        </div>
    );
};

export default Resources;