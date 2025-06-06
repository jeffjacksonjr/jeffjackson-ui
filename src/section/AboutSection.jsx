export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-black text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          About <span className="text-purple-400">DJ Jeff Jackson</span>
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <div className="relative group">
              <img 
                src="/dj-profile.jpg" 
                alt="DJ Jeff Jackson" 
                className="w-full rounded-lg shadow-2xl transform group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-20 rounded-lg transition duration-500"></div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <h3 className="text-2xl font-semibold mb-4">The Sound of the Night</h3>
            <p className="mb-6 text-gray-300">
              With over 10 years of experience in the music industry, DJ Jeff Jackson has mastered the art of reading crowds and creating electrifying atmospheres. From intimate club settings to massive festival stages, his versatile style blends house, techno, and electronic beats that keep dance floors packed all night long.
            </p>
            <p className="mb-6 text-gray-300">
              Known for his seamless transitions and ability to craft unique musical journeys, DJ Jeff Jackson has shared the stage with top artists and performed at premier venues worldwide.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-purple-400 font-bold">500+</h4>
                <p className="text-gray-300">Events Played</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-purple-400 font-bold">50+</h4>
                <p className="text-gray-300">Countries</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-purple-400 font-bold">1M+</h4>
                <p className="text-gray-300">Streams</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-purple-400 font-bold">100%</h4>
                <p className="text-gray-300">Energy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}