import Navbar from "./navbar/Navbar";
import AboutSection from "./section/AboutSection";
import ContactForm from "./section/ContactForm";
import Footer from "./section/Footer";
import Gallery from "./section/Gallery";
import HeroSection from "./section/HeroSection";
import MusicEvents from "./section/MusicEvents";


function App() {
  return (
    <>
    <Navbar/>
    <HeroSection />
    <AboutSection/>
    <MusicEvents/>
    <Gallery/>
    <ContactForm/>
    <Footer/>
    </>
  );
}

export default App;
