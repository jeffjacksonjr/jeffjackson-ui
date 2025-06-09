import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { CalendarIcon, ClockIcon, XCircleIcon, CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [blockedDates, setBlockedDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [newBlock, setNewBlock] = useState({
    date: '',
    time: '',
    reason: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    // Replace with actual API calls
    fetchBlockedDates();
    fetchBookings();
    fetchEnquiries();
    fetchAgreements();
  }, []);

  const fetchBlockedDates = async () => {
    // Mock data - replace with API call
    setBlockedDates([
      { id: 1, date: '2023-06-10', time: '2:00 PM', reason: 'Personal' },
      { id: 2, date: '2023-06-15', time: '4:00 PM', reason: 'Maintenance' }
    ]);
  };

  const fetchBookings = async () => {
    // Mock data - replace with API call
    setBookings([
      { id: 1, client: 'John Doe', date: '2023-06-12', time: '6:00 PM', status: 'Paid', amount: '$500' },
      { id: 2, client: 'Jane Smith', date: '2023-06-18', time: '8:00 PM', status: 'Pending', amount: '$500' }
    ]);
  };

  const fetchEnquiries = async () => {
    // Mock data - replace with API call
    setEnquiries([
      { id: 1, client: 'Alex Johnson', date: '2023-07-05', time: '7:00 PM', status: 'Pending' },
      { id: 2, client: 'Sarah Williams', date: '2023-07-12', time: '5:00 PM', status: 'Approved' }
    ]);
  };

  const fetchAgreements = async () => {
    // Mock data - replace with API call
    setAgreements([
      { id: 1, client: 'Mike Brown', dateSent: '2023-06-01', status: 'Signed', fileUrl: '#' },
      { id: 2, client: 'Emily Davis', dateSent: '2023-06-05', status: 'Pending' }
    ]);
  };

  const handleBlockDate = async (e) => {
    e.preventDefault();
    // API call to block date would go here
    console.log('Blocking date:', newBlock);
    // Reset form
    setNewBlock({ date: '', time: '', reason: '' });
    // Refresh data
    await fetchBlockedDates();
  };

  const deleteBlockedDate = async (id) => {
    // API call to delete would go here
    console.log('Deleting blocked date with id:', id);
    await fetchBlockedDates();
  };

  const handleEnquiryAction = async (id, action) => {
    if (action === 'approve') {
      // Logic to show agreement form would go here
      console.log('Approving enquiry:', id);
    } else {
      // Logic to show meeting scheduling form would go here
      console.log('Denying enquiry:', id);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-8">
        <span className="text-purple-400">Admin</span> Dashboard
      </h1>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-lg bg-gray-900 p-1 mb-6">
          {['Block Dates', 'Bookings', 'Enquiries', 'Agreements'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium rounded-md transition-all ${
                  selected ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* Block Dates Tab */}
          <Tab.Panel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-purple-400" />
                  Block New Date
                </h2>
                <form onSubmit={handleBlockDate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date *</label>
                    <input
                      type="date"
                      value={newBlock.date}
                      onChange={(e) => setNewBlock({...newBlock, date: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time *</label>
                    <select
                      value={newBlock.time}
                      onChange={(e) => setNewBlock({...newBlock, time: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                      required
                    >
                      <option value="">Select time</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                      <option value="6:00 PM">6:00 PM</option>
                      <option value="8:00 PM">8:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reason</label>
                    <input
                      type="text"
                      value={newBlock.reason}
                      onChange={(e) => setNewBlock({...newBlock, reason: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                      placeholder="Optional reason for blocking"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Block Date
                  </button>
                </form>
              </div>

              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-purple-400" />
                  Blocked Dates
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reason</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {blockedDates.map((block) => (
                        <tr key={block.id}>
                          <td className="px-4 py-3 whitespace-nowrap">{block.date}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{block.time}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{block.reason || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => deleteBlockedDate(block.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Tab.Panel>

          {/* Bookings Tab */}
          <Tab.Panel>
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Current Bookings</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-4 py-3 whitespace-nowrap">{booking.client}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{booking.date}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{booking.time}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            booking.status === 'Paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{booking.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>

          {/* Enquiries Tab */}
          <Tab.Panel>
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Pending Enquiries</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {enquiries.map((enquiry) => (
                      <tr key={enquiry.id}>
                        <td className="px-4 py-3 whitespace-nowrap">{enquiry.client}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{enquiry.date}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{enquiry.time}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            enquiry.status === 'Approved' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {enquiry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap space-x-2">
                          <button
                            onClick={() => handleEnquiryAction(enquiry.id, 'approve')}
                            className="text-green-400 hover:text-green-300"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEnquiryAction(enquiry.id, 'deny')}
                            className="text-red-400 hover:text-red-300"
                            title="Deny"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>

          {/* Agreements Tab */}
          <Tab.Panel>
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Agreement Tracking</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date Sent</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {agreements.map((agreement) => (
                      <tr key={agreement.id}>
                        <td className="px-4 py-3 whitespace-nowrap">{agreement.client}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{agreement.dateSent}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            agreement.status === 'Signed' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                          }`}>
                            {agreement.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {agreement.fileUrl ? (
                            <a
                              href={agreement.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 flex items-center"
                            >
                              <DocumentTextIcon className="h-4 w-4 mr-1" />
                              View
                            </a>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}