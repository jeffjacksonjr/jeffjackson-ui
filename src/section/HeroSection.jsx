import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function HeroSection() {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Jeff Jackson';
  const [isAnimating, setIsAnimating] = useState(true);
  const [gradientActive, setGradientActive] = useState(false);
  const navigate = useNavigate();
  const gradientRef = useRef(null);

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
        // Start gradient animation after typing completes
        setGradientActive(true);
      }
    };

    const startDelay = setTimeout(typeWriter, 500);
    return () => clearTimeout(startDelay);
  }, []);

  return (
    <section id="home" className="relative h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Gradient Background */}
      <div 
        ref={gradientRef}
        className={`absolute inset-0 transition-opacity duration-1000 ${gradientActive ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: gradientActive 
            ? 'linear-gradient(135deg, rgba(75, 0, 130, 0.9), rgba(147, 112, 219, 0.9), rgba(75, 0, 130, 0.9))'
            : 'transparent',
          backgroundSize: gradientActive ? '400% 400%' : '100% 100%',
          animation: gradientActive ? 'gradientFlow 20s ease infinite' : 'none'
        }}
      ></div>
      
      <div className="container mx-auto px-6 z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span 
            className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400 bg-[length:200%_200%] animate-gradient-flow"
            style={{
              animation: gradientActive ? 'gradientFlow 3s ease infinite' : 'none'
            }}
          >
            DJ
          </span>{' '}
          <span className="relative">
            {displayText}
            {isAnimating && (
              <span className="absolute -right-3 top-0 h-full w-1 bg-purple-300 animate-pulse"></span>
            )}
          </span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Spinning the hottest tracks and creating unforgettable experiences
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={() => navigate('#contact')} 
            className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
          >
            Enquire Now
          </button>
          {/* <span className="text-purple-400 hidden sm:block">|</span>
          <button 
            onClick={() => navigate('/book-now')} 
            className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
          >
            Book Now
          </button> */}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 flex justify-center items-end space-x-1 z-10">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="bg-gradient-to-t from-purple-500 to-transparent w-2 animate-pulse" 
            style={{
              height: `${Math.random() * 100}%`,
              animationDuration: `${0.5 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Add CSS for the gradient animation */}
      <style jsx>{`
        @keyframes gradientFlow {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>
    </section>
  );
}

HeroSection.propTypes = {
  navigate: PropTypes.func
};