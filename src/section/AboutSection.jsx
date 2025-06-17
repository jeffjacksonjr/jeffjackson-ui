import djProfile from '../images/dj-profile.jpeg'

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-black text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          About <span className="text-purple-400">Jeff Jackson</span>
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <div className="relative group">
              <img
                src={djProfile}
                alt="DJ Jeff Jackson"
                className="w-full rounded-lg shadow-2xl transform group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 rounded-lg transition duration-500"></div>
            </div>
          </div>

          <div className="md:w-1/2">
            <h3 className="text-2xl font-semibold mb-4">
              The Sound of the Night
            </h3>
            <p className="mb-6 text-gray-300">
              Jeff Jackson is a highly talented and experienced DJ known for his
              electrifying performances. With over 18 years of experience in the
              music industry, Jeff has become one of the most sought-after DJs
              in the scene. He started his journey in his hometown of
              Gaithersburg, MD (DMV), where he quickly gained a reputation for
              his ability to read the crowd and keep them on the dance floor.
              Over the years, Jeff has become an expert in mixing different
              genres and creating a vibe that is unmatched. His sets are a
              unique sound to whatever crowd he is DJing for, and he is always
              on the lookout for new and exciting tracks to incorporate into his
              sets.
            </p>
            <p className="mb-6 text-gray-300">
              Jeff has performed at some of the most prestigious venues and
              events, including National Portrait Gallery, Dubai and
              Afghanistan; when he was stationed with troops. He has also
              collaborated with various DJs from around the world and has worked
              on several remixes and original tracks. Despite his success, Jeff
              remains humble and always puts his audience first, ensuring that
              every performance is an unforgettable experience. Jeff is always
              pushing the boundaries With his talent, passion, and dedication to
              his craft, Jeff Jackson is undoubtedly one of the most exciting
              and talented DJs in the industry today.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-purple-400 font-bold">200+</h4>
                <p className="text-gray-300">Events Played</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-purple-400 font-bold">5+</h4>
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