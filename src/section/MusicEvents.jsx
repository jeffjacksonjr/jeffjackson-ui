export default function MusicEvents() {
  // const mixes = [
  //   {
  //     title: "Summer Vibes 2023",
  //     genre: "House/Techno",
  //     date: "June 2025",
  //     link: "#",
  //     image: "/mix-cover1.jpg"
  //   },
  //   {
  //     title: "Night Drive",
  //     genre: "Deep House",
  //     date: "April 2023",
  //     link: "#",
  //     image: "/mix-cover2.jpg"
  //   },
  //   {
  //     title: "Club Essentials",
  //     genre: "Tech House",
  //     date: "February 2023",
  //     link: "#",
  //     image: "/mix-cover3.jpg"
  //   }
  // ];

  const events = [
    // {
    //   venue: "Electric Paradise",
    //   location: "Miami, USA",
    //   date: "July 15, 2025",
    //   ticketLink: "#"
    // },
    // {
    //   venue: "Neon Nights Club",
    //   location: "Florida, USA",
    //   date: "August 5, 2025",
    //   ticketLink: "#"
    // },
    // {
    //   venue: "Bass Drop Festival",
    //   location: "Texas, USA",
    //   date: "September 2, 2026",
    //   ticketLink: "#"
    // }
  ];

  return (
    <>
    {/* <section id="music" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Music & <span className="text-purple-400">Events</span>
        </h2>
        
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-8 text-center">Latest Mixes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mixes.map((mix, index) => (
              <div key={index} className="bg-black rounded-lg overflow-hidden hover:shadow-purple-500/30 shadow-xl transition duration-500 group">
                <div className="relative overflow-hidden h-48">
                  <img 
                    src={mix.image} 
                    alt={mix.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <div>
                      <h4 className="text-xl font-bold">{mix.title}</h4>
                      <p className="text-purple-300">{mix.genre}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-400 mb-4">{mix.date}</p>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-full transition duration-300">
                    Listen Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

        </section> */}

        <section id="events" className="py-20 bg-black h-screen text-white">
      <div className="container mx-auto px-6">
        
        <div>
          <h3 className="text-2xl font-semibold mb-8 text-center max-h-screen" id="#events">Client <span className="text-purple-400">Reviews</span></h3>
          <div className="max-w-3xl mx-auto">
            {events.map((event, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-6 mb-4 last:mb-0 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h4 className="text-xl font-bold">{event.venue}</h4>
                  <p className="text-purple-300">{event.location}</p>
                </div>
                <div className="text-center mb-4 md:mb-0">
                  <p className="text-white">{event.date}</p>
                </div>
                <a 
                  href={event.ticketLink} 
                  className="bg-transparent border-2 border-purple-500 hover:bg-purple-500 text-white px-6 py-2 rounded-full font-medium transition duration-300 whitespace-nowrap"
                >
                  Get Tickets
                </a>
              </div>
            ))}
            {events.length === 0 && 
            <div className="bg-gray-900 rounded-lg p-6 mb-4 last:mb-0 flex flex-col md:flex-row justify-center items-center">
                <div className="mb-4 md:mb-0">
                  <center className="text-xl font-bold">No reviews to show</center>
                  {/* <p className="text-purple-300">{event.location}</p> */}
                </div> </div> }
          </div>
        </div>
        </div>
      
    </section>
        </>
  );
}