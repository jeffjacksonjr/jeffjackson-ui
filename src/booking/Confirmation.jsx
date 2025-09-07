import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Confirmation() {
  const { state } = useLocation();
  const booking = state?.booking;
  const navigate = useNavigate();
  const printRef = useRef();

  // Show error toast if no booking data
  useEffect(() => {
    if (!booking) {
      navigate('/'); // Redirect to home if no booking data
    }
  }, [booking, navigate]);

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-purple-400 text-3xl font-bold">Booking Received!</h1>
          {booking && (
            <button 
              onClick={handlePrint}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Print
            </button>
          )}
        </div>
        
        {booking ? (
          <div ref={printRef} className="bg-gray-800 p-6 rounded-lg print:bg-white print:text-black">
            {/* <div className="text-center mb-8 print:mb-6">
              <h2 className="text-2xl font-bold text-purple-400 print:text-black">Booking Confirmation</h2>
              <p className="text-sm text-gray-400 print:text-gray-600">Thank you for your booking!</p>
            </div> */}
            
            <div className="mb-6 print:mb-4">
              <h2 className="text-xl font-bold mb-2 border-b border-gray-700 print:border-gray-300 pb-1">Booking Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Booking ID:</p>
                  <p className="text-purple-400 print:text-gray-800">{booking.uniqueId}</p>
                </div>
                <div>
                  <p className="font-semibold">Event Type:</p>
                  <p>{booking.eventType}</p>
                </div>
                <div>
                  <p className="font-semibold">Date:</p>
                  <p>{new Date(booking.eventDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}</p>
                </div>
                <div>
                  <p className="font-semibold">Time:</p>
                  <p>{booking.eventTime}</p>
                </div>
                <div>
                  <p className="font-semibold">PayPal Transaction ID:</p>
                  <p className="text-purple-400 print:text-gray-800">{booking.paypalTransactionId || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Amount Paid:</p>
                  <p className="text-purple-400 print:text-gray-800 font-bold">${booking.amount} USD</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6 print:mb-4">
              <h2 className="text-xl font-bold mb-2 border-b border-gray-700 print:border-gray-300 pb-1">Client Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Name:</p>
                  <p>{booking.clientName}</p>
                </div>
                <div>
                  <p className="font-semibold">Email:</p>
                  <p>{booking.email}</p>
                </div>
                <div>
                  <p className="font-semibold">Phone:</p>
                  <p>{booking.phone}</p>
                </div>
                <div>
                  <p className="font-semibold">Address:</p>
                  <p>{booking.street}, {booking.city}, {booking.state}</p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-400 print:text-gray-600 print:text-xs border-t border-gray-700 print:border-gray-300 pt-4 mt-6">
              <p className="mb-4">
                Your booking is provisionally reserved pending payment confirmation. A final booking confirmation will be emailed to you upon successful verification of your payment.
                <br/><br/>
                If your payment cannot be verified, an official request for proof of payment will be sent to you. Your booking will not be fully confirmed until this booking is verified and approved.
                <br /><br/>
                For questions, contact us at <span className="text-purple-400 print:text-gray-800 font-semibold">djjeffjackson@gmail.com</span>.
              </p>
              <p className="text-center italic mt-8">Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-400">No booking information found. Please check your email for confirmation.</p>
          </div>
        )}
      </div>
      
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-section, #print-section * {
              visibility: visible;
            }
            #print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              background: white;
              color: black;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}