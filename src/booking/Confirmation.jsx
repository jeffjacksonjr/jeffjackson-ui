import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Confirmation() {
  const { state } = useLocation();
  const booking = state?.booking;
  const navigate = useNavigate();

  // Show error toast if no booking data
  useEffect(() => {
    if (!booking) {
      navigate('/'); // Redirect to home if no booking data
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-purple-400 text-3xl font-bold mb-6">Booking Confirmed!</h1>
        
        {booking ? (
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Booking Details</h2>
              <p>Booking ID: <span className="text-purple-400">{booking.uniqueId}</span></p>
              <p>Event: {booking.eventType}</p>
              <p>
                Date: {new Date(booking.eventDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p>Time: {booking.eventTime}</p>
              <p className="font-bold mt-2">
                Amount Paid: <span className="text-purple-400">${booking.amount} USD</span>
              </p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Client Details</h2>
              <p>{booking.clientName}</p>
              <p>{booking.email}</p>
              <p>{booking.phone}</p>
              <p>{booking.street}, {booking.city}, {booking.state}</p>
            </div>
            
            <div className="text-sm text-gray-400">
              <p className="mb-4">
                Your booking has been confirmed. A confirmation has been sent to your email.
                <br />
                For questions, contact us at <span className="text-purple-400">djjeffjackson@gmail.com</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-400">No booking information found. Please check your email for confirmation.</p>
          </div>
        )}
      </div>
    </div>
  );
}