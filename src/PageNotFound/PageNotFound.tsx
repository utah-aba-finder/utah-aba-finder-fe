import React from 'react'
import { Link } from 'react-router-dom'
import './PageNotFound.css'
const videoSrc = require('../Assets/404message.mp4');

export const PageNotFound = () => {
  return (
    <div className='pageNotFoundWrapper'>
         <video 
        autoPlay 
        loop 
        muted 
        className='pageNotFoundImage'
      >
        <source 
          src={require('../Assets/404message.mp4')} 
          type="video/mp4" 
        />
      </video>
      <section className='button-container'>
        <Link to='/'><button className='homeButton'>Home</button></Link>
      </section>
    </div>
  )
}
