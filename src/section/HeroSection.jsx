export default function HeroSection() {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Background video or image would go here */}
      <div className="absolute inset-0 bg-purple-900 opacity-50"></div>
      
      <div className="container mx-auto px-6 z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-purple-400">DJ</span> Jeff Jackson
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Spinning the hottest tracks and creating unforgettable experiences
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button href="#contact" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-medium transition duration-300 transform hover:scale-105">
            Book Now
          </button>
          {/* <button className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white px-8 py-3 rounded-full font-medium transition duration-300 transform hover:scale-105">
            Latest Mix
          </button> */}
        </div>
      </div>
      
      {/* Animated equalizer bars for DJ effect */}
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