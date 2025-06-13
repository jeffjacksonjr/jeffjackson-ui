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
  const mockClientData = {
    id: 'BK123456',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 555-789-0123',
    address: '123 Melody Lane, Apt 4B, Brooklyn, NY 11201',
    eventType: 'Wedding Reception',
    eventDate: '2023-07-15',
    eventTime: '6:00 PM',
    totalAmount: 1200,
    paidAmount: 600,
    paymentHistory: [
      {
        orderId: 'ORD-78901',
        transactionNo: 'TXN-78901234',
        status: 'Success',
        amount: 600,
        date: '2023-06-10 21:43:37'
      }
    ]
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Simulate API call with mock data
    setTimeout(() => {
      setSearchResults(mockClientData);
    }, 500);
  };

  const handlePayment = () => {
    // Simulate payment processing
    alert(`Payment of $${mockClientData.totalAmount - mockClientData.paidAmount} would be processed here`);
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
        <span className="text-purple-400">Payment</span> Portal
      </h1>

      {!searchResults ? (
        <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setSearchMethod('email')}
              className={`px-4 py-2 rounded-lg ${searchMethod === 'email' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            >
              Search by Email/Booking ID
            </button>
            <button
              onClick={() => setSearchMethod('id')}
              className={`px-4 py-2 rounded-lg ${searchMethod === 'id' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            >
              Search by Unique ID
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            {searchMethod === 'id' ? (
              <div>
                {/* <h2 className="text-xl font-bold mb-4">Search by Unique Event ID</h2> */}
                <div>
                  <label className="block text-sm font-medium mb-1">Unique Event ID *</label>
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                    placeholder="BK123456/EV123456"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                {/* <h2 className="text-xl font-bold mb-4">Search by Email or Booking ID</h2> */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Booking ID</label>
                    <input
                      type="text"
                      value={searchBookingId}
                      onChange={(e) => setSearchBookingId(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                      placeholder="BK123456/EV123456"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Search Booking
            </button>
          </form>
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
                      ${searchResults.totalAmount - searchResults.paidAmount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {(searchResults.totalAmount - searchResults.paidAmount) > 0 && (
                        <button
                          onClick={handlePayment}
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
        </div>
      )}
    </div>
  );
}