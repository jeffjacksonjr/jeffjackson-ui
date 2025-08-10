import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConfig } from '../config/activeConfig';

export default function ReviewForm() {
  const { uniqueId } = useParams();
  const navigate = useNavigate();
  const config = getConfig();
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientFeedback: '',
    rating: '5',
    uniqueId: uniqueId || '',
    submitted: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [isValidId, setIsValidId] = useState(true);
  const [countdown, setCountdown] = useState(10);

  // Check if ID is valid and if review was already submitted
  useEffect(() => {
    const checkIdAndSubmission = async () => {
      if (!uniqueId) {
        setError('No reference ID provided');
        setIsValidId(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(
          `${config.healthCheck}/api/public/reviews/check-submission?uniqueId=${uniqueId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Invalid ID');
        }

        const submissionStatus = await response.json();
        setIsSubmitted(submissionStatus);
      } catch (err) {
        setError(err.message);
        setIsValidId(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkIdAndSubmission();
  }, [uniqueId, config.healthCheck]); // Added config.healthCheck to dependencies

  // Countdown timer for successful submission
  useEffect(() => {
    let timer;
    if (isSubmitted && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isSubmitted && countdown === 0) {
      navigate("/");
    }
    return () => clearTimeout(timer);
  }, [isSubmitted, countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(config.healthCheck+'/api/public/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          rating: parseInt(formData.rating),
          type: uniqueId.startsWith('BK') ? 'booking' : 'enquiry'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      setIsSubmitted(true);
      setCountdown(10); // Start countdown
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isValidId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-gray-800 p-8 rounded-lg max-w-md text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <h2 className="text-2xl font-bold mb-2">Invalid Request</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <p className="text-gray-400 text-sm">Please check your reference ID and try again.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-gray-800 p-8 rounded-lg max-w-md text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-gray-300">Your review has been submitted successfully.</p>
          <p className="text-gray-400 mt-4">
            You will be redirected to home in {countdown} second{countdown !== 1 ? 's' : ''}...
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-purple-400 hover:text-purple-300 underline"
          >
            Go Home Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Leave a Review</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900 text-red-100 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Reference ID</label>
              <input
                type="text"
                value={uniqueId || ''}
                readOnly
                className="w-full bg-gray-700 text-gray-300 p-3 rounded cursor-not-allowed"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Your Name</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
                className="w-full bg-gray-700 text-white p-3 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star.toString() })}
                    className={`text-2xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-500'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 mb-2">Your Feedback</label>
              <textarea
                value={formData.clientFeedback}
                onChange={(e) => setFormData({ ...formData, clientFeedback: e.target.value })}
                required
                rows="4"
                className="w-full bg-gray-700 text-white p-3 rounded focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded font-medium transition duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}