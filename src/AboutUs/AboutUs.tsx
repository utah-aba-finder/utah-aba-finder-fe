import React from 'react';
import { Link } from 'react-router-dom';
import LinkedinIcon from '../Assets/linkedin-icon.png';
import smileIcon from '../Assets/smile-icon.png';
import githubIcon from '../Assets/github-icon.png';
import seongPic from '../Assets/seong-pic.jpg';
import jordanPic from '../Assets/jordan-pic.jpg';
import kevinPic from '../Assets/kevin-pic.png';

import './AboutUs.css';

const bannerVideo = require('../Assets/AboutUs-banner.mp4');

const AboutUs: React.FC = () => {
    return (
        <div className="about-us-container">

            <div className="about-us-banner">
                <video className="about-us-banner-video" autoPlay muted loop playsInline>
                    <source src={bannerVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="about-us-title-container">
                    <h1 className="about-us-title">About Us</h1>
                </div>
            </div>

            <div className="about-us-content">
                <h1>About Utah ABA Locator</h1>
                <p>Utah ABA Locator is an innovative application designed to connect parents with Applied Behavior Analysis (ABA) providers tailored to their unique needs and goals. Our team of passionate full-stack developers created this platform with a deep understanding of the challenges faced by families seeking ABA services in Utah.</p>

                <h1>Our Story</h1>
                <p>One of our team members, a parent of Autistic children, experienced firsthand the frustration of navigating complex healthcare systems to find suitable ABA providers. This personal journey sparked our mission to simplify the process for families across Utah.</p>

                <h1>Our Purpose</h1>
                <p>We aim to empower parents by providing a comprehensive directory of ABA providers, searchable through various criteria. Our platform allows users to connect directly with providers via contact information or website links, bypassing the often time-consuming process of relying solely on insurance recommendations.</p>

                <h1>Why Choose Utah ABA Locator?</h1>
                <p>While Google searches can be helpful, they may not always yield the most relevant local results. Our application is specifically designed to streamline your search for ABA services in Utah, saving you valuable time and effort.</p>

                <h1>Important Note</h1>
                <p>We are not medical professionals. While we strive to provide accurate information, please consult qualified healthcare experts for personalized advice. If you encounter any inaccuracies or misleading content, we appreciate your feedback and will promptly address any issues.</p>

                <h1>Get in Touch</h1>
                <p>Have questions or concerns? We'd love to hear from you! <Link to="/contact" className="about-us-link">Click here</Link> to contact us directly.</p>
            </div>

            <div className="about-us-portfolio">

                <div className="front-end-container card">
                    <h2 className="front-end-title">Front End</h2>

                    <div className="profile-card">
                        <img src={jordanPic} alt="jordan" className="profile-icon" />
                        <div className="profile-info">
                            <h3>Jordan Williamson</h3>
                            <p> Jordan Williamson is a front-end developer with a background as a Military Working Dog Handler in the U.S. Army, holding degrees in Criminal Justice and IT, passionate about creating accessible user interfaces that help others.</p>
                            <div className="icon-container">
                                <a href="https://www.linkedin.com/in/jordan-williamson-a079b3271/" target="_blank" rel="noopener noreferrer">
                                    <img src={LinkedinIcon} alt="LinkedIn" className="linkedin-icon" />
                                </a>
                                <a href="https://github.com/jwill06" target="_blank" rel="noopener noreferrer">
                                    <img src={githubIcon} alt="GitHub" className="github-icon" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card">
                        <img src={kevinPic} alt="kevin" className="profile-icon" />
                        <div className="profile-info">
                            <h3>Kevin Nelson</h3>
                            <p>Kevin is a dedicated professional with a passion for exploring the world, having traveled across every continent, and brings a deep appreciation for diversity and adaptability to his collaborative work.</p>
                            <div className="icon-container">
                                <a href="https://www.linkedin.com/in/kevinnelson418/" target="_blank" rel="noopener noreferrer">
                                    <img src={LinkedinIcon} alt="LinkedIn" className="linkedin-icon" />
                                </a>
                                <a href="https://github.com/kevinm23nelson" target="_blank" rel="noopener noreferrer">
                                    <img src={githubIcon} alt="GitHub" className="github-icon" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card">
                        <img src={seongPic} alt="Seong" className="profile-icon" />
                        <div className="profile-info">
                            <h3>Seong Kang</h3>
                            <p>Seong is passionate about accessibility, responsive design, and creating better UI/UX, blending a background in the U.S. Army, behavioral health, and entertainment technology with skills in React, JavaScript, HTML, and CSS.</p>
                            <div className="icon-container">
                                <a href="https://www.linkedin.com/in/seong-kang/" target="_blank" rel="noopener noreferrer">
                                    <img src={LinkedinIcon} alt="LinkedIn" className="linkedin-icon" />
                                </a>
                                <a href="https://github.com/sanghoro" target="_blank" rel="noopener noreferrer">
                                    <img src={githubIcon} alt="GitHub" className="github-icon" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="divider"></div>

                <div className="back-end-container card">
                    <h2 className="back-end-title">Back End</h2>

                    <div className="profile-card">
                        <img src={smileIcon} alt="Smile" className="profile-icon" />
                        <div className="profile-info">
                            <h3>Austin Carr-Jones</h3>
                            <p>Austin is a software engineer with a background in sales, using technologies like Ruby on Rails, RSpec, PostgreSQL, SQL, and Bootstrap to build effective solutions, leveraging 14 years of experience in optimizing CRM workflows and driving growth.</p>
                            <div className="icon-container">
                                <a href="https://www.linkedin.com/in/austin-carr-jones/" target="_blank" rel="noopener noreferrer">
                                    <img src={LinkedinIcon} alt="LinkedIn" className="linkedin-icon" />
                                </a>
                                <a href="https://github.com/austincarrjones" target="_blank" rel="noopener noreferrer">
                                    <img src={githubIcon} alt="GitHub" className="github-icon" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card">
                        <img src={smileIcon} alt="Smile" className="profile-icon" />
                        <div className="profile-info">
                            <h3>Chee Lee</h3>
                            <p>Chee is a software engineer with a background in healthcare, bringing analytical skills and a unique problem-solving perspective from five years in interventional radiology, and is eager to apply these abilities to developing innovative software solutions.</p>
                            <div className="icon-container">
                                <a href="https://www.linkedin.com/in/chee-lee-rtr/" target="_blank" rel="noopener noreferrer">
                                    <img src={LinkedinIcon} alt="LinkedIn" className="linkedin-icon" />
                                </a>
                                <a href="https://github.com/cheeleertr" target="_blank" rel="noopener noreferrer">
                                    <img src={githubIcon} alt="GitHub" className="github-icon" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card">
                        <img src={smileIcon} alt="Smile" className="profile-icon" />
                        <div className="profile-info">
                            <h3>Mel Langhoff</h3>
                            <p>Mel is a backend developer specializing in Ruby on Rails, with a background in IT & SAP Project Management, skilled in cloud migration, Agile methodologies, and SaaS SDLC implementations. Fluent in Spanish, she’s passionate about bridging cultural gaps and enhancing communication and empathy.</p>
                            <div className="icon-container">
                                <a href="https://www.linkedin.com/in/melissalanghoff/" target="_blank" rel="noopener noreferrer">
                                    <img src={LinkedinIcon} alt="LinkedIn" className="linkedin-icon" />
                                </a>
                                <a href="https://github.com/mel-langhoff" target="_blank" rel="noopener noreferrer">
                                    <img src={githubIcon} alt="GitHub" className="github-icon" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AboutUs;