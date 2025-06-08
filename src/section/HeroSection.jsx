import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // Add this line

export default function HeroSection() {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Jeff Jackson';
  const [isAnimating, setIsAnimating] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let currentIndex = 0;
    const typingSpeed = 150;

    const typeWriter = () => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeWriter, typingSpeed);
      } else {
        setIsAnimating(false);
      }
    };

    const startDelay = setTimeout(typeWriter, 500);
    return () => clearTimeout(startDelay);
  }, []);

  return (
    <section id="home" className="relative h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-purple-900 opacity-50"></div>
      
      <div className="container mx-auto px-6 z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-purple-400">DJ</span>{' '}
          <span className="relative">
            {displayText}
            {isAnimating && (
              <span className="absolute -right-3 top-0 h-full w-1 bg-purple-400 animate-pulse"></span>
            )}
          </span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Spinning the hottest tracks and creating unforgettable experiences
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => navigate('/book-now')} 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-medium transition duration-300 transform hover:scale-105"
          >
            Book Now
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 flex justify-center items-end space-x-1">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="bg-purple-400 w-2 animate-pulse" 
            style={{
              height: `${Math.random() * 100}%`,
              animationDuration: `${0.5 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          ></div>
        ))}
      </div>
    </section>
  );
}

HeroSection.propTypes = {
  navigate: PropTypes.func
};