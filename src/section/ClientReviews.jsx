import { useState, useEffect } from 'react';
import { getConfig } from '../config/activeConfig';

export default function ClientReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const config = getConfig();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${config.healthCheck}/api/public/reviews`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        // Don't set any mock data, will show "No reviews" message
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [config.healthCheck]); // Added config.healthCheck as dependency

  // Sort by rank (lower rank = higher priority) and take top 3
  const topReviews = reviews
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3);

  return (
    <section id="reviews" className="py-20 bg-black text-white h-screen">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Client <span className="text-purple-400">Reviews</span>
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : null}

        <div className="max-w-4xl mx-auto">
          {topReviews.length > 0 ? (
            topReviews.map((review) => (
              <div 
                key={review.reviewId} 
                className="bg-gray-800 rounded-lg p-4 mb-6 last:mb-0 hover:shadow-purple-500/20 shadow-lg transition duration-300"
              >
                <div className="flex items-start mb-4">
                  <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">
                    {review.clientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{review.clientName}</h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 pl-16">{review.clientFeedback}</p>
              </div>
            ))
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-xl text-gray-400">
                {isLoading ? '' : 'No reviews to show yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}