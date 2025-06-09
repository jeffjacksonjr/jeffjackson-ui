import { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import djPerformingAtFestival from "../images/Festival.jpeg";
import clubNightPerformance from "../images/ClubNight.png";
import crowdDancing from "../images/CrowdDancing.jpeg";
import dJBoothSetup from "../images/DJBoothSetup.jpeg";
import sunSet from "../images/Sunset.png";
import backStageMoment from "../images/BackStageMoment.jpeg";


export default function Gallery() {
  const images = [
    { id: 1, src: djPerformingAtFestival, alt: 'Club night performance' },
    { id: 2, src: crowdDancing, alt: 'DJ performing at festival' },
    { id: 3, src: clubNightPerformance, alt: 'Crowd dancing' },
    { id: 4, src: dJBoothSetup, alt: 'DJ booth setup' },
    { id: 5, src: sunSet, alt: 'Sunset festival' },
    { id: 6, src: backStageMoment, alt: 'Backstage moment' },
  ];

  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const showPrevious = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[newIndex]);
    setCurrentIndex(newIndex);
  };

  const showNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[newIndex]);
    setCurrentIndex(newIndex);
  };

  return (
    <section id="gallery" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Event <span className="text-purple-400">Gallery</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div 
              key={image.id} 
              className="relative group overflow-hidden rounded-lg cursor-pointer"
              onClick={() => openLightbox(image, index)}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-64 object-cover transform group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <div className="bg-purple-600 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <button 
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white hover:text-purple-400 transition duration-300"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            
            <button 
              onClick={showPrevious}
              className="absolute left-6 text-white hover:text-purple-400 transition duration-300"
            >
              <ArrowLeftIcon className="h-8 w-8" />
            </button>
            
            <div className="max-w-4xl mx-auto">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.alt}
                className="max-h-screen max-w-full object-contain"
              />
              <p className="text-center mt-4 text-lg">{selectedImage.alt}</p>
            </div>
            
            <button 
              onClick={showNext}
              className="absolute right-6 text-white hover:text-purple-400 transition duration-300"
            >
              <ArrowRightIcon className="h-8 w-8" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}