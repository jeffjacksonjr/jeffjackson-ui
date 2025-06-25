import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

export default function PaymentLookup() {
  const [searchMethod, setSearchMethod] = useState('email');
  const [searchId, setSearchId] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchBookingId, setSearchBookingId] = useState('');
  const [searchResults, setSearchResults] = useState(null);
//   const navigate = useNavigate();

  // Mock data - replace with API calls
  const mockEnquiryData = {
    id: 'EQ123456',
    name: 'Adam Rose',
    email: 'adam@example.com',
    phone: '+1 555-789-0456',
    address: '456 Melody Lane, Apt 4B, Brooklyn, NY 11201',
    eventType: 'Corporate Party',
    type: "enquiry",
    eventDate: '2023-07-18',
    eventTime: '5:00 PM',
    totalAmount: 1500,
    paidAmount: 0,
    askforDeposit: true,
    depositAmountAsk: 200,
    depositAmountReceived: 0,
    paymentHistory: []
  };

  const mockBookingData = {
    id: 'BK123456',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 555-789-0123',
    address: '123 Melody Lane, Apt 4B, Brooklyn, NY 11201',
    eventType: 'Wedding Reception',
    type: "booking",
    eventDate: '2023-07-15',
    eventTime: '6:00 PM',
    totalAmount: 1200,
    paidAmount: 600,
    askforDeposit: false,
    depositAmountAsk: null,
    depositAmountReceived: 200,
    paymentHistory: [
      {
        orderId: 'ORD-78901',
        transactionNo: 'TXN-78901234',
        status: 'Success',
        amount: 200,
        date: '2023-06-10 21:43:37'
      }
    ]
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Simulate API call with mock data based on search input
    setTimeout(() => {
      // If searching by ID, check the prefix
      if (searchMethod === 'id' && searchId) {
        if (searchId.startsWith('BK')) {
          setSearchResults(mockBookingData);
        } else if (searchId.startsWith('EQ')) {
          setSearchResults(mockEnquiryData);
        }
      } 
      // If searching by email/booking ID, check the booking ID prefix
      else if (searchMethod === 'email' && searchBookingId) {
        if (searchBookingId.startsWith('BK')) {
          setSearchResults(mockBookingData);
        } else if (searchBookingId.startsWith('EQ')) {
          setSearchResults(mockEnquiryData);
        }
      }
      // Default to booking data if no prefix match
      else {
        setSearchResults(mockBookingData);
      }
    }, 500);
  };

  const handlePayment = (amount) => {
    // Simulate payment processing
    alert(`Payment of $${amount} would be processed here`);
  };

  const resetSearch = () => {
    setSearchResults(null);
    setSearchId('');
    setSearchEmail('');
    setSearchBookingId('');
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
              <label className="block text-sm font-medium mb-1">Email Address</label>
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
              <label className="block text-sm font-medium mb-1">Booking ID</label>
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
          className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Search Booking
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
                    <td className="px-4 py-3 whitespace-nowrap">{searchResults.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{searchResults.name}</td>
                    <td className="px-4 py-3 whitespace-normal max-w-xs">{searchResults.address}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{searchResults.eventType}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(searchResults.eventDate).toLocaleDateString()} at {searchResults.eventTime}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">${searchResults.totalAmount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {searchResults.askforDeposit ? (
                        searchResults.depositAmountReceived > 0 ? (
                          `$${searchResults.depositAmountReceived} (Paid)`
                        ) : (
                          <button
                            onClick={() => handlePayment(searchResults.depositAmountAsk)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Pay ${searchResults.depositAmountAsk}
                          </button>
                        )
                      ) : (
                        `$${searchResults.depositAmountReceived || 0} (Paid)`
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      ${searchResults.totalAmount - searchResults.paidAmount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {(searchResults.totalAmount - searchResults.paidAmount) > 0 && (
                        <button
                          onClick={() => handlePayment(searchResults.totalAmount - searchResults.paidAmount)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Pay ${searchResults.totalAmount - searchResults.paidAmount}
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History Table */}
          {searchResults.paymentHistory.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Payment History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Unique ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Transaction No.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Status/Mode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Transaction Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {searchResults.paymentHistory.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">{searchResults.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{payment.orderId}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{payment.transactionNo}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            payment.status.includes('Success') ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">${payment.amount}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {payment.date}
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