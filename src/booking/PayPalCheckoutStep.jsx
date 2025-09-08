// PayPalCheckoutStep.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PayPalPaymentModal from './PayPalPaymentModal';
import toast from 'react-hot-toast';
import { getConfig } from "../config/activeConfig";

export default function PayPalCheckoutStep({ date, time, clientDetails, onBack, currentPrice }) {
  const [loading, setLoading] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const checkBookingAvailability = async () => {
    const config = getConfig();
    const formattedDate = formatDate(date);
    
    try {
      const availabilityResponse = await fetch(config.healthCheck + "/api/public/blockSchedule/check-availability", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: formattedDate,
        time: time
      }),
    });

    const availabilityData = await availabilityResponse.json();
    
    if (!availabilityResponse.ok || availabilityData.status === 'error') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      setShowMessage(true);
      setMessage(availabilityData.message || "This time slot is not available. Please choose a different time.");
      toast.error("Slot not available!!" || 'Failed to check availability');
      return false;
    }

      const response = await fetch(config.submitBookingEndpoint + "/check-availability", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventDate: formattedDate,
          eventTime: time,
          email: clientDetails.email
        }),
      });

      const data = await response.json();
      
      if (data.status === 'error') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        setShowMessage(true);
        setMessage(data.message + ". Please check your email for existing booking details.");
        toast.error("Booking already exist!!" || 'Failed to create booking');
        return;
      }

      return true; // Booking is available
    } catch (error) {
      toast.error(error.message);
      return false; // Booking is not available or error occurred
    }
  };

  const handlePayNowClick = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Checking booking availability...');
    
    try {
      const isAvailable = await checkBookingAvailability();
      
      if (isAvailable) {
        toast.dismiss(loadingToast);
        setShowPayPalModal(true);
      } else {
        toast.dismiss(loadingToast);
        // Error toast is already shown in checkBookingAvailability
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to check booking availability');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async (transactionId) => {
    setIsSubmitting(true);
    setLoading(true);
    const paymentToast = toast.loading('Processing your booking...');
    
    try {
      const config = getConfig();
      
      // Create booking with PayPal transaction ID
      const bookingResponse = await fetch(config.submitBookingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: clientDetails.name,
          email: clientDetails.email,
          phone: '+1' + clientDetails.phone,
          eventType: clientDetails.eventType,
          eventDate: formatDate(date),
          eventTime: time,
          street: clientDetails.street,
          apt: clientDetails.apt,
          city: clientDetails.city,
          state: clientDetails.state,
          message: clientDetails.message,
          amount: currentPrice,
          paypalTransactionId: transactionId,
          paymentMethod: 'paypal',
          status: 'PENDING' // Set status to PENDING for admin verification
        }),
      });

      const bookingData = await bookingResponse.json();
      
      if (!bookingResponse.ok || bookingData.status === 'error') {
        throw new Error(bookingData.message || 'Failed to create booking');
      }

      toast.dismiss(paymentToast);
      toast.success('Thank You!! Booking created successfully!');
      
      // Navigate to confirmation page only on success
      navigate('/confirmation', { state: { booking: bookingData } });
    } catch (error) {
      toast.dismiss(paymentToast);
      toast.error(`Booking failed: ${error.message}`);
      // Don't navigate to confirmation page on error
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-white">Processing your booking...</p>
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        disabled={loading}
        className="flex items-center text-purple-400 mb-4 disabled:opacity-50"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to details
      </button>

      <h2 className="text-2xl font-bold mb-6">Complete Your Booking</h2>

      {showMessage && 
        (<div className="text-red-500 rounded-lg mb-6">
          <p>{message} </p>
          </div>)}

      {/* Booking details display */}
      <div className="mb-8">
        <h3 className="font-bold mb-2 text-purple-400">Booking Details</h3>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p>Event DJ - <span className="text-purple-400">{clientDetails.eventType}</span></p>
          <p className='text-purple-400'>
            {new Date(date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            at {time}
          </p>
          <p>Client's place</p>
          <p>DJ Jeff Jackson Jr</p>
          <p className="font-bold mt-2">Total:  <span className="text-purple-400">${currentPrice}*</span></p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-bold mb-2">Client Details</h3>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p>Name: <span className='text-purple-400'>{clientDetails.name}</span></p>
          <p>Email: <span className='text-purple-400'>{clientDetails.email}</span></p>
          <p>Mobile: <span className='text-purple-400'>{clientDetails.phone}</span></p>
          <p>
            Address: <span className='text-purple-400'>{clientDetails.street}
            {clientDetails.apt && `, ${clientDetails.apt}`}
            {clientDetails.city && `, ${clientDetails.city}`}
            {clientDetails.state && `, ${clientDetails.state}`}</span>
          </p>
        </div>
      </div>

      <div className="mb-8 text-sm text-gray-400">
        <p className="mb-4">
          <strong className='text-purple-400'>Payment required</strong>
          <br />
          * This amount serves as your booking deposit to secure your date and time. After payment, I'll contact you within 24 hours to discuss your event details - any additional requirements may affect the final balance, which we'll settle closer to your event date.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-4">Payment Method</h3>
        <button
          onClick={handlePayNowClick}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 rounded-lg font-medium mb-2 disabled:opacity-50"
        >
          {loading ? 'Checking Availability...' : `Pay $${currentPrice}`}
        </button>
        <p className="text-sm text-gray-400 text-center">
          Click above to check availability and complete payment
        </p>
      </div>

      {/* PayPal Modal */}
      <PayPalPaymentModal
        isOpen={showPayPalModal}
        onClose={() => !isSubmitting && setShowPayPalModal(false)}
        amount={currentPrice}
        onPaymentSubmit={handlePayPalPayment}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}