import React from "react";
import { Link } from "react-router-dom";
import LinkedinIcon from "../Assets/linkedin-icon.png";
import githubIcon from "../Assets/github-icon.png";
import seongPic from "../Assets/seong-pic.jpg";
import jordanPic from "../Assets/jordan-pic.jpg";
import kevinPic from "../Assets/kevin-pic.png";
import cheePic from "../Assets/chee-pic.png";
import austinPic from "../Assets/austin-pic.png";
import intern1 from "../Assets/GarrettBowman.jpeg";
import intern2 from "../Assets/KimEwing.jpeg";

import "./AboutUs.css";

const bannerVideo = require("../Assets/AboutUs-banner.mp4");

const AboutUs: React.FC = () => {
  return (
    <div className="about-us-container">
      <div className="about-us-banner">
        <video
          className="about-us-banner-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={bannerVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="about-us-title-container">
          <h1 className="about-us-title">About Us</h1>
        </div>
      </div>

      <div className="about-us-text-content">
        <div className="about-us-content">
          <h1>About Autism Services Locator</h1>
          <p>
            Autism Services Locator is an innovative application designed to connect
            parents with Applied Behavior Analysis (ABA), Speech Therapy, Occupational Therapy, and Autism Evaluation providers tailored to
            their unique needs and goals. Our platform was created with a deep understanding of the
            challenges faced by families seeking different types of services.
          </p>

          <h1>Our Story</h1>
          <p>
            Jordan Williamson, a parent of Autistic children, experienced
            firsthand the frustration of navigating complex healthcare systems
            to find suitable providers. This personal journey sparked the
            mission to simplify the process for families starting in Utah and expanding to other states.
          </p>

          <h1>Our Purpose</h1>
          <p>
            We aim to empower parents by providing a comprehensive directory of
           providers, searchable through various criteria. Our platform
            allows users to connect directly with providers via contact
            information or website links, bypassing the often time-consuming
            process of relying solely on insurance recommendations.
          </p>

          <h1>Why Choose Autism Services Locator?</h1>
          <p>
            While Google searches can be helpful, they may not always yield the
            most relevant local results. Our application is specifically
            designed to streamline your search for different types of services, saving
            you valuable time and effort.
          </p>

          <h1>Important Note</h1>
          <p>
            We are not medical professionals. While we strive to provide
            accurate information, please consult qualified healthcare experts
            for personalized advice. If you encounter any inaccuracies or
            misleading content, we appreciate your feedback and will promptly
            address any issues.
          </p>

          <h1>Get in Touch</h1>
          <p>
            Have questions or concerns? We'd love to hear from you!{" "}
            <Link to="/contact" className="about-us-link">
              Click here
            </Link>{" "}
            to contact us directly.
          </p>
        </div>

        <div className="about-us-portfolio">
          {/* Core Team Section - Jordan Williamson */}
          <div className="team-section card">
            <div className="team-title-container">
              <h2 className="team-title">Core Development Team</h2>
              <p className="team-subtitle">Currently leading development and maintenance</p>
            </div>
            <div className="profile-cards-container">
              <div className="profile-card featured">
                <img src={jordanPic} alt="Jordan Williamson" className="profile-icon" />
                <div className="profile-info">
                  <h3>Jordan Williamson</h3>
                  <h4 className="role-title">Lead Developer & Founder</h4>
                  <p>Jordan is the driving force behind Autism Services Locator, actively developing and maintaining the platform. As a father of two ASD children and a front-end developer with a background as a Military Working Dog Handler in the U.S. Army, Jordan holds degrees in Criminal Justice and IT with a concentration in programming and software development. His personal experience navigating healthcare systems for his children inspired him to create this platform to help other families find the resources they need.</p>
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
            </div>
          </div>

          {/* Contributors Section - Original Team Members */}
          <div className="team-section card">
            <div className="team-title-container">
              <h2 className="team-title">Project Contributors</h2>
              <p className="team-subtitle">Team members who helped build the foundation</p>
            </div>
            <div className="profile-cards-container">
              <div className="profile-card">
                <img src={kevinPic} alt="Kevin Nelson" className="profile-icon" />
                <div className="profile-info">
                  <h3>Kevin Nelson</h3>
                  <h4 className="role-title">Co-Founder, Front End Developer</h4>
                  <p>Kevin Nelson is a software engineer with a background in business and legal operations, who combines his Juris Doctorate and Business Administration degrees to bridge the gap between business/law and tech.</p>
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
                <img src={seongPic} alt="Seong Kang" className="profile-icon" />
                <div className="profile-info">
                  <h3>Seong Kang</h3>
                  <h4 className="role-title">Co-Founder, Front End Developer</h4>
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

              <div className="profile-card">
                <img src={austinPic} alt="Austin Carr-Jones" className="profile-icon" />
                <div className="profile-info">
                  <h3>Austin Carr-Jones</h3>
                  <h4 className="role-title">Co-Founder, Back End Developer</h4>
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
                <img src={cheePic} alt="Chee Lee" className="profile-icon" />
                <div className="profile-info">
                  <h3>Chee Lee</h3>
                  <h4 className="role-title">Co-Founder, Back End Developer</h4>
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
                <img src={intern1} alt="Garrett Bowman" className="profile-icon" />
                <div className="profile-info">
                  <h3>Garrett Bowman</h3>
                  <h4 className="role-title">Backend Developer Intern</h4>
                  <p>Garrett contributed to the project as a backend developer intern, helping to build the foundation of the platform's server-side functionality.</p>
                </div>
              </div>

              <div className="profile-card">
                <img src={intern2} alt="Kim Ewing" className="profile-icon" />
                <div className="profile-info">
                  <h3>Kim Ewing</h3>
                  <h4 className="role-title">Frontend Developer Intern</h4>
                  <p>Kim contributed to the project as a frontend developer intern, helping to create the user interface and user experience components.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Remove the separate interns section since they're now in contributors */}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;