import React from 'react'
import { Link } from 'react-router-dom'
import './PageNotFound.css'
import Spline from '@splinetool/react-spline';


export const PageNotFound = () => {
  return (
    <div className='pageNotFoundWrapper'>

    
      <Spline
        scene="https://prod.spline.design/etWtNwFga6fGOrD0/scene.splinecode" 
        className='404Error'
      />
    
      
      <section className='button-container'>
        <Link to='/'><button className='homeButton'>Home</button></Link>
      </section>
    </div>
  )
}
