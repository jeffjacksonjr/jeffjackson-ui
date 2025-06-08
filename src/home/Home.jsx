import React from 'react'
import ContactForm from '../section/ContactForm'
import AboutSection from "../section/AboutSection";
import Gallery from '../section/Gallery'
import HeroSection from '../section/HeroSection'  
import MusicEvents from '../section/MusicEvents'

function Home() {
  return (
    <>
      <HeroSection/>
      <AboutSection/>
      <MusicEvents/>
      <Gallery/>
      <ContactForm/>
    </>
  )
}

export default Home