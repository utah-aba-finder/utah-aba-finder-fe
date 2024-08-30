import React from 'react'
import { Link } from 'react-router-dom'
import './PageNotFound.css'

export const PageNotFound = () => {
  return (
    <div className='pageNotFoundWrapper'>
         <img 
          src={require('../Assets/404Image.png')} 
          alt='404 Error'
        />
      
      <section className='button-container'>
        <Link to='/'><button className='homeButton'>Home</button></Link>
      </section>
    </div>
  )
}
