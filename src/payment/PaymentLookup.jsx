import { useState } from 'react';
import axios from 'axios';
import { loadRazorpay } from '../utils/razorpay';
import toast from 'react-hot-toast';
import { getConfig } from "../config/activeConfig";

export default function PaymentLookup() {
  const [searchMethod, setSearchMethod] = useState('email');
  const [searchId, setSearchId] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchBookingId, setSearchBookingId] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const config = getConfig();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      if (searchMethod === 'id' && searchId) {
        // Check if it's a booking or enquiry
        if (searchId.startsWith('BK')) {
          response = await axios.get(`${config.healthCheck}/api/public/bookings/payment/${searchId}`);
        } else if (searchId.startsWith('EQ')) {
          response = await axios.get(`${config.healthCheck}/api/public/enquiries/payment/${searchId}`);
        } else {
          throw new Error('Invalid ID format - must start with BK or EQ');
        }
        
        // Fetch payment history
        const historyResponse = await axios.get(`${config.healthCheck}/api/public/orders/uniqueId${searchId}`);
        setPaymentHistory(historyResponse.data);
      } else if (searchMethod === 'email' && searchEmail && searchBookingId) {
        if (searchBookingId.startsWith('BK')) {
          response = await axios.get(`${config.healthCheck}/api/public/bookings/payment/${searchBookingId}?email=${searchEmail}`);
        } else if (searchBookingId.startsWith('EQ')) {
          response = await axios.get(`${config.healthCheck}/api/public/enquiries/payment/${searchBookingId}?email=${searchEmail}`);
        } else {
          throw new Error('Invalid Booking ID format - must start with BK or EQ');
        }
        
        // Fetch payment history
        const historyResponse = await axios.get(`${config.healthCheck}/api/public/orders/${searchBookingId}`);
        setPaymentHistory(historyResponse.data);
      } else {
        throw new Error('Please provide all required fields');
      }
      
      setSearchResults(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setSearchResults(null);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (amount, isDeposit = false) => {
    try {
      setLoading(true);
      
      // Load Razorpay script
      await loadRazorpay();
      
      // Get the ID safely
      const recordId = searchResults.id || searchResults.uniqueId;
      if (!recordId) {
        throw new Error('No record ID found');
      }
      
      // Determine endpoints based on type
      const isBooking = recordId.startsWith('BK');
      const orderEndpoint = isBooking
        ? `${config.healthCheck}/api/public/bookings/payment/${recordId}/order`
        : `${config.healthCheck}/api/public/enquiries/payment/${recordId}/order`;
      
      const callbackEndpoint = isBooking
        ? paymentHistory.length > 0 
          ? `${config.healthCheck}/api/public/bookings/payment/additional/callback`
          : `${config.healthCheck}/api/public/bookings/payment/callback`
        : `${config.healthCheck}/api/public/enquiries/payment/callback`;

      // Create payment order
      const orderResponse = await axios.post(
        orderEndpoint,
        { amount, isDeposit }
      );

      const orderData = orderResponse.data;

      // Open Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100,
        currency: "USD",
        name: "DJ Jeff Jackson Jr",
        description: `${isDeposit ? 'Deposit' : 'Payment'} for ${searchResults.eventType}`,
        image: "/dj-profile2.png",
        order_id: orderData.razorpayOrderId,
        handler: async function(response) {
          try {
            const verificationToastId = toast.loading('Verifying payment...');
            
            await axios.post(
              callbackEndpoint,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                isDeposit
              }
            );

            toast.dismiss(verificationToastId);
            toast.success('Payment successful!');
            
            // Refresh the data
            handleSearch({ preventDefault: () => {} });
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
          name: searchResults.clientName || searchResults.name,
          email: searchResults.email,
          contact: searchResults.phone
        },
        notes: {
          address: searchResults.address || `${searchResults.street}, ${searchResults.city}, ${searchResults.state}`,
          booking_type: searchResults.eventType,
          payment_type: isDeposit ? 'deposit' : 'balance'
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

  const resetSearch = () => {
    setSearchResults(null);
    setSearchId('');
    setSearchEmail('');
    setSearchBookingId('');
    setPaymentHistory([]);
  };

  // Helper function to get display name
  const getDisplayName = (result) => {
    return result.clientName || result.name || 'N/A';
  };

  // Helper function to get display address
  const getDisplayAddress = (result) => {
    if (result.address) return result.address;
    if (result.street && result.city && result.state) {
      return `${result.street}, ${result.city}, ${result.state}`;
    }
    return 'N/A';
  };

  // Helper function to get deposit amount
  const getDepositAmount = (result) => {
    if (result.type === 'enquiry') {
      return result.depositAmountAsk || result.depositReceived || '0';
    }
    return result.depositReceived || '0';
  };

  // Helper function to check if deposit is paid
  const isDepositPaid = (result) => {
    const depositAmount = parseFloat(result.depositReceived || '0');
    return depositAmount > 0;
  };

  // Get record ID safely
  const getRecordId = () => {
    return searchResults?.id || searchResults?.uniqueId;
  };

  // Check if remaining amount is payable
  const hasRemainingAmount = () => {
    const remaining = parseFloat(searchResults?.remainingAmount || '0');
    return remaining > 0;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-8">
        <a href='/payment'><span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400 bg-[length:200%_200%] animate-gradient-flow">Payment</span> Portal</a>
      </h1>

      {!searchResults ? (
        <div className="max-w-xl mx-auto relative p-[2px] rounded-lg bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 animate-rotate-colors">
          <style jsx global>{`
            @keyframes rotate-colors {
              0% {
                background-position: 0% 50%;
              }
              100% {
                background-position: 100% 50%;
              }
            }
            .animate-rotate-colors {
              background-size: 200% 200%;
              animation: rotate-colors 3s linear infinite;
            }
          `}</style>
          
          <div className="bg-gray-900 rounded-lg p-6">
            <p className="text-gray-300 mb-4 text-lg">Search by:</p>
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setSearchMethod('email')}
                className={`px-4 py-2 rounded-lg ${searchMethod === 'email' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                Email & Unique ID
              </button>
              <button
                onClick={() => setSearchMethod('id')}
                className={`px-4 py-2 rounded-lg ${searchMethod === 'id' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                Unique ID
              </button>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              {searchMethod === 'id' ? (
                <div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unique Event ID *</label>
                    <input
                      type="text"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                      placeholder="BK123456/EQ123456"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Booking ID *</label>
                      <input
                        type="text"
                        value={searchBookingId}
                        onChange={(e) => setSearchBookingId(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                        placeholder="BK123456/EQ123456"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              <center>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search Booking'}
                </button>
              </center>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <button
            onClick={resetSearch}
            className="flex items-center text-purple-400 mb-6"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>

          {/* Client Details Table */}
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Client & Booking Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Unique ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Deposit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Remaining Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">{getRecordId()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{getDisplayName(searchResults)}</td>
                    <td className="px-4 py-3 whitespace-normal max-w-xs">{getDisplayAddress(searchResults)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{searchResults.eventType}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {searchResults.eventDate} at {searchResults.eventTime}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">${searchResults.totalAmount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {/* DEPOSIT COLUMN - FIXED LOGIC */}
                      {searchResults.type === 'enquiry' ? (
                        searchResults.askForDeposit ? (
                          // Enquiry with askForDeposit = true: Show payment button
                          <button
                            onClick={() => handlePayment(parseFloat(getDepositAmount(searchResults)), true)}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                          >
                            Pay ${getDepositAmount(searchResults)} Deposit
                          </button>
                        ) : (
                          // Enquiry with askForDeposit = false: Show paid status
                          `$${getDepositAmount(searchResults)} (Paid)`
                        )
                      ) : (
                        // Booking: Always show deposit status
                        isDepositPaid(searchResults) ? (
                          `$${getDepositAmount(searchResults)} (Paid)`
                        ) : (
                          'No Deposit'
                        )
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      ${searchResults.remainingAmount || '0'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {/* ACTION COLUMN - FIXED LOGIC */}
                      {hasRemainingAmount() && (
                        <button
                          onClick={() => handlePayment(parseFloat(searchResults.remainingAmount))}
                          disabled={loading}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                          Pay ${searchResults.remainingAmount}
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History Table */}
          {paymentHistory.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Payment History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Transaction No.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {paymentHistory.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {payment.transactionDate ? new Date(payment.transactionDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{payment.orderId || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{payment.transactionNo || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            payment.paymentStatus?.includes('Success') ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                          }`}>
                            {payment.paymentStatus || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">${payment.amount || '0'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {payment.paymentMode === 'deposit' ? 'Deposit' : 'Balance'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}