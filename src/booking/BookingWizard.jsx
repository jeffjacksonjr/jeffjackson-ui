import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScrollToTop from '../utils/ScrollToTop'
import { loadRazorpay } from '../utils/razorpay';
import toast from 'react-hot-toast';
import { getConfig } from "../config/activeConfig";

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [clientDetails, setClientDetails] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    street: '',
    apt: '',
    city: '',
    state: '',
    message: ''
  });

  const eventPrices = {
    'Wedding': 500,
    'Birthday': 350,
    'Sport': 350,
    'Holiday Party': 350,
    'Private': 350,
    'NightLife': 400,
    'Cruise Party': 350
  };

  const currentPrice = clientDetails.eventType ? eventPrices[clientDetails.eventType] : 0;
  
  // Weekday vs weekend availability
  const weekdayTimes = ['5:00 PM', '7:00 PM', '9:00 PM'];
  const weekendTimes = ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'];
  
  const navigate = useNavigate();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(4);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientDetails(prev => ({ ...prev, [name]: value }));
  };

  const isWeekend = (date) => {
    if (!date) return false;
    const day = date.getDay(); 
    return day === 0 || day === 6;
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="max-w-3xl mx-auto p-6">
        {step === 1 && (
          <DateSelectionStep onSelectDate={handleDateSelect} />
        )}
        
        {step === 2 && (
          <>
          <ScrollToTop/>
          <TimeSelectionStep 
            date={selectedDate} 
            times={isWeekend(selectedDate) ? weekendTimes : weekdayTimes}
            onSelectTime={handleTimeSelect}
            onBack={() => setStep(1)}
          />
          </>
        )}
        
        {step === 3 && (
          <>
          <ScrollToTop/>
          <ClientDetailsStep
            date={selectedDate}
            time={selectedTime}
            clientDetails={clientDetails}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            currentPrice={currentPrice}
          />
          </>
        )}
        
        {step === 4 && (
          <>
          <ScrollToTop/>
          <CheckoutStep
            date={selectedDate}
            time={selectedTime}
            clientDetails={clientDetails}
            onBack={() => setStep(3)}
            onConfirm={() => navigate('/confirmation')}
            currentPrice={currentPrice}
          />
          </>
        )}
      </div>
    </div>
  );
}

// Date Selection Component
function DateSelectionStep({ onSelectDate }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [loadDate, setLoadDate] = useState(30);
  
  // Generate next 30 days for selection (as local dates without time)
  const availableDates = Array.from({ length: loadDate }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Select a Date</h2>
      <div className="grid grid-cols-3 gap-4">
        {availableDates.map((date) => {
          const dateKey = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          return (
            <button
              key={dateKey}
              onClick={() => {
                setSelectedDate(date);
                onSelectDate(date);
              }}
              className={`p-4 rounded-lg border ${
                selectedDate && selectedDate.getTime() === date.getTime()
                  ? 'border-purple-500 bg-purple-900' 
                  : 'border-gray-700 hover:border-purple-400'
              }`}
            >
              <div className="text-sm">{dayName}</div>
              <div className="font-medium">{monthDay}</div>
            </button>
          );
        })}
      </div>
      
      <div className="flex justify-center mt-6">
        <button 
          onClick={() => setLoadDate(loadDate + 30)} 
          className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-8 py-3 rounded-full font-medium transition duration-300 transform hover:scale-105"
        >
          See more
        </button>
      </div>
    </div>
  );
}

// Time Selection Component
function TimeSelectionStep({ date, times, onSelectTime, onBack }) {
  const [selectedTime, setSelectedTime] = useState(null);
  
  // Check if the selected date is today
  const isToday = (selectedDate) => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  // Filter times for today to only show future slots
  const getAvailableTimes = () => {
    if (!isToday(new Date(date))) {
      return times; // Return all times for future dates
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return times.filter(time => {
      // Parse the time string (e.g., "2:00 PM")
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      // Compare with current time
      if (hours > currentHour) return true;
      if (hours === currentHour) return minutes > currentMinute;
      return false;
    });
  };

  const availableTimes = getAvailableTimes();

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div>
      <button 
        onClick={onBack}
        className="flex items-center text-purple-400 mb-4"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to dates
      </button>
      
      <h2 className="text-2xl font-bold mb-2">Availability for {formattedDate}</h2>
      <p className="text-gray-400 mb-6">Select a time slot</p>
      
      <div className="grid grid-cols-2 gap-4">
        {availableTimes.length > 0 ? (
          availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => {
                setSelectedTime(time);
                onSelectTime(time);
              }}
              className={`p-4 rounded-lg border ${
                selectedTime === time 
                  ? 'border-purple-500 bg-purple-900' 
                  : 'border-gray-700 hover:border-purple-400'
              }`}
            >
              {time}
            </button>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-400">
            No available time slots left for today
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">Service Details</h3>
        <p>Event DJ</p>
        {selectedTime && (
          <p>
            {new Date(date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })} at {selectedTime}
          </p>
        )}
        <p>Client's place</p>
        <p>DJ Jeff Jackson Jr</p>
        <p>2 hours</p>
      </div>
    </div>
  );
}

// Client Details Component
function ClientDetailsStep({ date, time, clientDetails, onChange, onSubmit, onBack, currentPrice }) {
  const eventPrices = {
    Wedding: 500,
    Birthday: 350,
    Sport: 350,
    "Holiday Party": 350,
    Private: 350,
    NightLife: 400,
    "Cruise Party": 350,
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-purple-400 mb-4"
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
        Back to time selection
      </button>

      <h2 className="text-2xl font-bold mb-6">Client Details</h2>
      <p className="mb-6">Tell us a bit about yourself</p>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={clientDetails.name}
                onChange={onChange}
                required
                maxLength={100}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
              />
              <div className="text-right text-sm text-gray-400">
                {clientDetails.name.length}/100
              </div>
            </div>

            <div>
              <label className="block mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={clientDetails.email}
                onChange={onChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-1">Phone Number</label>
              <div className="flex">
                <select className="bg-gray-800 border border-gray-700 rounded-l-lg px-3">
                  <option>+1</option>
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={clientDetails.phone}
                  onChange={onChange}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-r-lg px-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Event Type *</label>
              <select
                name="eventType"
                value={clientDetails.eventType || ""}
                onChange={onChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
              >
                <option value="">Select an option</option>
                <option value="Wedding">Wedding ($500)</option>
                <option value="Birthday">Birthday ($350)</option>
                <option value="Sport">Sport ($350)</option>
                <option value="Holiday Party">Holiday Party ($350)</option>
                <option value="Private">Private Party ($350)</option>
                <option value="NightLife">NightLife ($400)</option>
                <option value="Cruise Party">Cruise Party ($350)</option>
              </select>
              {clientDetails.eventType && (
                <div className="mt-2 text-right font-medium">
                  Price: <span className="text-purple-400">${eventPrices[clientDetails.eventType]}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1">Street *</label>
              <input
                type="text"
                name="street"
                value={clientDetails.street}
                onChange={onChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-1">Apt. / Floor No.</label>
              <input
                type="text"
                name="apt"
                value={clientDetails.apt}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={clientDetails.city}
                  onChange={onChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={clientDetails.state}
                  onChange={onChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Add Your Message</label>
              <textarea
                name="message"
                value={clientDetails.message}
                onChange={onChange}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 rounded-lg font-medium"
            >
              {clientDetails.eventType
                ? `Pay $${currentPrice}`
                : "Continue to Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Checkout Component
function CheckoutStep({ date, time, clientDetails, onBack, onConfirm, currentPrice }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setLoading(true);
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
      };
    
    try {
      const config = getConfig();
      // 1. First create the booking in your backend
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
          amount: currentPrice
        }),
      });

      const bookingData = await bookingResponse.json();
      
      if (bookingData.status === 'error') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        setShowMessage(true);
        setMessage(bookingData.message + ". Please keep a note of your booking Id!!");
        toast.error("Booking already exist!!" || 'Failed to create booking');
        return;
      }

      // Show success toast for booking creation
      toast.success('Booking created successfully! Proceeding to payment...');

      // 2. Create payment order
      const orderResponse = await fetch(
        `${config.submitBookingEndpoint}/${bookingData.uniqueId}/payment/order?amount=${currentPrice}`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        toast.error(orderData.message || 'Failed to create payment order');
        return;
      }

      // 3. Load Razorpay script
      await loadRazorpay();

      // 4. Open Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100, // Convert to paise
        currency: process.env.REACT_APP_CURRENCY || "USD",
        name: "DJ Jeff Jackson Jr",
        description: `Booking for ${clientDetails.eventType}`,
        image: "/dj-profile2.png",
        order_id: orderData.razorpayOrderId,
        handler: async function(response) {
          // Handle successful payment
          try {
            // Show loading toast for payment verification
            const verificationToastId = toast.loading('Verifying payment...');
            
            const callbackResponse = await fetch(
              `${config.submitBookingEndpoint}/payment/callback`, 
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                }),
              }
            );

            const callbackData = await callbackResponse.json();
            
            // Dismiss loading toast
            toast.dismiss(verificationToastId);
            
            if (!callbackResponse.ok) {
              toast.error(callbackData.message || 'Payment verification failed');
              return;
            }

            // Show success toast
            toast.success('Payment successful!');
            
            // Navigate to confirmation page
            navigate('/confirmation', { state: { booking: callbackData } });
          } catch (error) {
            toast.error(`Payment verification failed: ${error.message}`);
          }
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled');
          }
        },
        prefill: {
          name: clientDetails.name,
          email: clientDetails.email,
          contact: clientDetails.phone
        },
        notes: {
          address: `${clientDetails.street}, ${clientDetails.city}, ${clientDetails.state}`,
          booking_type: clientDetails.eventType
        },
        theme: {
          color: "#6d28d9"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      toast.error(`Payment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-purple-400 mb-4"
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
          <Link to="/payment" className="text-purple-400 underline">
            Go to Payment Portal</Link>
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

      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 rounded-lg font-medium w-full disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${currentPrice}`}
      </button>
    </div>
  );
}