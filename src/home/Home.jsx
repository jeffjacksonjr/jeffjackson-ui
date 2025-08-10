import React from 'react'
import ContactForm from '../section/ContactForm'
import AboutSection from "../section/AboutSection";
import Gallery from '../section/Gallery'
import HeroSection from '../section/HeroSection'  
import ClientReviews from '../section/ClientReviews';


function Home() {
  return (
    <>
      <HeroSection/>
      <AboutSection/>
      <ClientReviews/>
      <Gallery/>
      <ContactForm/>
    </>
  )
}

export default Home