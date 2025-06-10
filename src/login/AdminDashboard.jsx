import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import {
  CalendarIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [blockedDates, setBlockedDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [newBlock, setNewBlock] = useState({
    date: "",
    time: "",
    reason: "",
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null,
  });
  const [approvalConfirmation, setApprovalConfirmation] = useState({
    isOpen: false,
    id: null,
  });
  const [denyDialog, setDenyDialog] = useState({
    isOpen: false,
    enquiry: null,
    date: "",
    time: "",
    message: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchBlockedDates();
    fetchBookings();
    fetchEnquiries();
    fetchAgreements();
  }, []);

  const fetchBlockedDates = async () => {
    setBlockedDates([
      { id: 1, date: "2023-06-10", time: "2:00 PM", reason: "Personal" },
      { id: 2, date: "2023-06-15", time: "4:00 PM", reason: "Maintenance" },
    ]);
  };

  const fetchBookings = async () => {
    setBookings([
      {
        id: 1,
        clientName: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 555-123-4567",
        eventType: "Wedding Reception",
        eventDate: "2023-06-12",
        eventTime: "6:00 PM",
        street: "123 Main Street",
        apt: "Apt 4B",
        city: "New York",
        state: "NY",
        message: "Need DJ for our wedding reception from 6PM to midnight",
        status: "Paid",
        amount: "$500",
      },
      {
        id: 2,
        clientName: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1 555-987-6543",
        eventType: "Corporate Event",
        eventDate: "2023-06-18",
        eventTime: "8:00 PM",
        street: "456 Business Ave",
        apt: "",
        city: "Brooklyn",
        state: "NY",
        message: "Annual company party with 100+ guests",
        status: "Pending",
        amount: "$750",
      },
    ]);
  };

  const fetchEnquiries = async () => {
    setEnquiries([
      {
        id: 1,
        clientName: "Alex Johnson",
        email: "alex.j@example.com",
        phone: "+1 555-456-7890",
        eventType: "Birthday Party",
        eventDate: "2023-07-05",
        eventTime: "7:00 PM",
        street: "789 Celebration Lane",
        apt: "",
        city: "Queens",
        state: "NY",
        message: "Looking for DJ for my 30th birthday party",
        status: "Pending",
      },
      {
        id: 2,
        clientName: "Sarah Williams",
        email: "sarah.w@example.com",
        phone: "+1 555-789-0123",
        eventType: "Anniversary",
        eventDate: "2023-07-12",
        eventTime: "5:00 PM",
        street: "321 Memory Blvd",
        apt: "Penthouse",
        city: "Manhattan",
        state: "NY",
        message: "25th anniversary celebration with dinner and dancing",
        status: "Approved",
      },
    ]);
  };

  const fetchAgreements = async () => {
    setAgreements([
      {
        id: 1,
        client: "Mike Brown",
        dateSent: "2023-06-01",
        status: "Signed",
        fileUrl: "#",
      },
      {
        id: 2,
        client: "Emily Davis",
        dateSent: "2023-06-05",
        status: "Pending",
      },
    ]);
  };

  const handleBlockDate = async (e) => {
    e.preventDefault();
    console.log("Blocking date:", newBlock);
    setNewBlock({ date: "", time: "", reason: "" });
    await fetchBlockedDates();
  };

  const confirmDeleteBlockedDate = (id) => {
    setDeleteConfirmation({
      isOpen: true,
      id: id,
    });
  };

  const deleteBlockedDate = async () => {
    console.log("Deleting blocked date with id:", deleteConfirmation.id);
    await fetchBlockedDates();
    setDeleteConfirmation({
      isOpen: false,
      id: null,
    });
  };

  const handleEnquiryAction = (id, action) => {
    const enquiry = enquiries.find(e => e.id === id);
    
    if (action === "approve") {
      setApprovalConfirmation({
        isOpen: true,
        id: id,
      });
    } else {
      setDenyDialog({
        isOpen: true,
        enquiry: enquiry,
        date: "",
        time: "",
        message: "",
      });
    }
  };

  const approveEnquiry = async () => {
    console.log("Approving enquiry:", approvalConfirmation.id);
    await fetchEnquiries();
    setApprovalConfirmation({
      isOpen: false,
      id: null,
    });
  };

  const sendDenial = async (e) => {
    e.preventDefault();
    console.log("Sending denial for enquiry:", denyDialog.enquiry.id, {
      date: denyDialog.date,
      time: denyDialog.time,
      message: denyDialog.message,
    });
    await fetchEnquiries();
    setDenyDialog({
      isOpen: false,
      enquiry: null,
      date: "",
      time: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-8">
        <span className="text-purple-400">Admin</span> Dashboard
      </h1>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-lg bg-gray-900 p-1 mb-6">
          {["Block Schedule", "Bookings", "Enquiries", "Agreements"].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium rounded-md transition-all ${
                  selected
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
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
                  Block Schedule
                </h2>
                <form onSubmit={handleBlockDate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newBlock.date}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, date: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Time *
                    </label>
                    <select
                      value={newBlock.time}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, time: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                      required
                    >
                      <option value="">Select time</option>
                      <option value="12:00 PM">08:00 AM</option>
                      <option value="12:00 PM">10:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                      <option value="12:00 PM">5:00 PM</option>
                      <option value="6:00 PM">6:00 PM</option>
                      <option value="6:00 PM">7:00 PM</option>
                      <option value="8:00 PM">8:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={newBlock.reason}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, reason: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                      placeholder="Optional reason for blocking"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Block Schedule
                  </button>
                </form>
              </div>

              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-purple-400" />
                  Blocked Schedule
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {blockedDates.map((block) => (
                        <tr key={block.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {block.date}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {block.time}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {block.reason || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => confirmDeleteBlockedDate(block.id)}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Event Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Payment Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-4 py-3 whitespace-normal">
                          {booking.clientName}
                        </td>
                        <td className="px-4 py-3 whitespace-normal">
                          {booking.email}
                        </td>
                        <td className="px-4 py-3 whitespace-normal">
                          {booking.phone}
                        </td>
                        <td className="px-4 py-3 whitespace-normal">
                          {booking.eventType}
                        </td>
                        <td className="px-4 py-3 whitespace-normal">
                          {new Date(booking.eventDate).toLocaleDateString()} at{" "}
                          {booking.eventTime}
                        </td>
                        <td className="px-4 py-3 whitespace-normal">
                          {booking.street}
                          {booking.apt ? `, ${booking.apt}` : ""},{" "}
                          {booking.city}, {booking.state}
                        </td>
                        <td className="px-4 py-3 whitespace-normal max-w-xs break-words">
                          {booking.message || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              booking.status === "Paid"
                                ? "bg-green-900 text-green-300"
                                : "bg-yellow-900 text-yellow-300"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Event Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {enquiries.map((enquiry) => (
                      <tr key={enquiry.id}>
                        <td className="px-4 py-3 whitespace-normal">
                          {enquiry.clientName}
                        </td>
                        <td className="px-4 py-3 whitespace-normal">
                          {enquiry.email}
                        </td>
                        <td className="px-4 py-3 whitespace-normal">
                          {enquiry.phone}
                        </td>
                        <td className="px-4 py-3 whitespace-normal">
                          {enquiry.eventType}
                        </td>
                        <td className="px-4 py-3 whitespace-normal">
                          {new Date(enquiry.eventDate).toLocaleDateString()} at{" "}
                          {enquiry.eventTime}
                        </td>
                        <td className="px-4 py-3 whitespace-normal">
                          {enquiry.street}
                          {enquiry.apt ? `, ${enquiry.apt}` : ""},{" "}
                          {enquiry.city}, {enquiry.state}
                        </td>
                        <td className="px-4 py-3 whitespace-normal max-w-xs break-words">
                          {enquiry.message || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              enquiry.status === "Approved"
                                ? "bg-green-900 text-green-300"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {enquiry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap space-x-2">
                          <button
                            onClick={() =>
                              handleEnquiryAction(enquiry.id, "approve")
                            }
                            className="text-green-400 hover:text-green-300"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleEnquiryAction(enquiry.id, "deny")
                            }
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date Sent
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {agreements.map((agreement) => (
                      <tr key={agreement.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {agreement.client}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {agreement.dateSent}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              agreement.status === "Signed"
                                ? "bg-green-900 text-green-300"
                                : "bg-yellow-900 text-yellow-300"
                            }`}
                          >
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this blocked schedule?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmation({ isOpen: false, id: null })}
                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700"
              >
                No
              </button>
              <button
                onClick={deleteBlockedDate}
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Dialog */}
      {approvalConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Approval</h3>
            <p className="mb-6">Are you sure you want to approve this enquiry?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setApprovalConfirmation({ isOpen: false, id: null })}
                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700"
              >
                No
              </button>
              <button
                onClick={approveEnquiry}
                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
              >
                Yes, Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Denial Meeting Schedule Dialog */}
      {denyDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Schedule Meeting for Denial</h3>
            
            <div className="mb-4 p-4 bg-gray-700 rounded-lg">
              <h4 className="font-medium mb-2">Client Details:</h4>
              <p>Name: {denyDialog.enquiry.clientName}</p>
              <p>Email: {denyDialog.enquiry.email}</p>
              <p>Phone: {denyDialog.enquiry.phone}</p>
            </div>

            <form onSubmit={sendDenial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  value={denyDialog.date}
                  onChange={(e) => setDenyDialog({ ...denyDialog, date: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Time *</label>
                <select
                  value={denyDialog.time}
                  onChange={(e) => setDenyDialog({ ...denyDialog, time: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  required
                >
                  <option value="">Select time</option>
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message *</label>
                <textarea
                  value={denyDialog.message}
                  onChange={(e) => setDenyDialog({ ...denyDialog, message: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  required
                  placeholder="Enter your message to the client"
                  rows="3"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setDenyDialog({ isOpen: false, enquiry: null, date: "", time: "", message: "" })}
                  className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}