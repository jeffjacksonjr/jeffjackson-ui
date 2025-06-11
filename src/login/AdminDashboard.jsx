import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import {
  CalendarIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

const loadJsPDF = () => {
  return new Promise((resolve, reject) => {
    if (window.jsPDF) {
      resolve(window.jsPDF);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      resolve(window.jspdf.jsPDF);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

function AgreementModal({ booking, onClose, onSend }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [agreementAmount, setAgreementAmount] = useState(1500);
  const [ownerName, setOwnerName] = useState("Jeff Jackson Jr");
  const [eventEndTime, setEventEndTime] = useState("11:00 PM");

  // Calculate remaining balance safely
  const depositAmount = parseInt(booking.amount.replace(/\D/g, '')) || 0;
  const remainingBalance = agreementAmount - depositAmount;

  
const handleGeneratePDF = async (e) => {
  e.preventDefault();
  setIsGenerating(true);
  
  try {
    const jsPDF = await loadJsPDF();
    const doc = new jsPDF();
    
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const maxContentHeight = pageHeight - 30; // Leave space for footer
    let yPos = 20;
    
    // Helper function to check if we need a new page
    const checkPageBreak = (requiredHeight) => {
      if (yPos + requiredHeight > maxContentHeight) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };
    
    // Helper function to add section background
    const addSectionBackground = (startY, height, color) => {
      doc.setFillColor(...color);
      doc.rect(margin - 5, startY - 5, pageWidth - 2 * margin + 10, height, 'F');
    };
    
    // Add background color effect (light gray)
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Header with purple background
    doc.setFillColor(147, 51, 234); // Purple-600
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255); // White text
    doc.text('Jeff Jackson DJ Service Agreement', pageWidth / 2, 25, { align: 'center' });
    
    yPos = 55;
    doc.setTextColor(0, 0, 0); // Reset to black
    
    // Client Details Section
    checkPageBreak(90); // Check if we need space for client details
    // const clientSectionStart = yPos;
    
    addSectionBackground(yPos, 90, [31, 41, 55]); // Gray-800
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CLIENT DETAILS', margin, yPos + 5);
    
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Two column layout for client details
    const leftCol = margin + 5;
    const rightCol = pageWidth / 2 + 10;
    
    doc.text(`Client Name: ${booking.clientName}`, leftCol, yPos);
    doc.text(`Phone: ${booking.phone}`, rightCol, yPos);
    yPos += 12;
    
    doc.text(`Event Date: ${new Date(booking.eventDate).toLocaleDateString()}`, leftCol, yPos);
    doc.text(`Event Start Time: ${booking.eventTime}`, rightCol, yPos);
    yPos += 12;
    
    doc.text(`Event End Time: ${eventEndTime}`, leftCol, yPos);
    doc.text(`Type of Event: ${booking.eventType}`, rightCol, yPos);
    yPos += 12;
    
    // Address spans full width
    const addressText = `Event Location: ${booking.street}${booking.apt ? `, ${booking.apt}` : ""}, ${booking.city}, ${booking.state}`;
    const addressLines = doc.splitTextToSize(addressText, pageWidth - 2 * margin - 10);
    doc.text(addressLines, leftCol, yPos);
    yPos += addressLines.length * 8 + 20;
    
    // Special Instructions Section
    if (specialInstructions) {
      const instructionLines = doc.splitTextToSize(specialInstructions, pageWidth - 2 * margin - 10);
      const sectionHeight = 30 + (instructionLines.length * 8);
      
      checkPageBreak(sectionHeight);
      
      addSectionBackground(yPos, sectionHeight, [17, 24, 39]); // Gray-900
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('SPECIAL INSTRUCTIONS', margin, yPos + 5);
      yPos += 20;
      
      doc.setFont('helvetica', 'normal');
      doc.text(instructionLines, margin + 5, yPos);
      yPos += instructionLines.length * 8 + 20;
    }
    
    // Service Agreement Section
    checkPageBreak(60);
    
    addSectionBackground(yPos, 50, [55, 65, 81]); // Gray-700
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('Jeff Jackson Jr services agrees to provide music and entertainment at the above time', margin + 5, yPos + 10);
    doc.text('and location as needed for the event.', margin + 5, yPos + 22);
    
    doc.setFont('helvetica', 'bold');
    const overtimeText1 = '(Overtime will be charged at a rate of $200 per additional hour. Overtime will';
    const overtimeText2 = 'only be provided if the DJ is available.)';
    
    // Split the text to ensure it fits within the page width
    const overtimeLines1 = doc.splitTextToSize(overtimeText1, pageWidth - 2 * margin - 10);
    const overtimeLines2 = doc.splitTextToSize(overtimeText2, pageWidth - 2 * margin - 10);
    
    let currentY = yPos + 34;
    overtimeLines1.forEach(line => {
      doc.text(line, margin + 5, currentY);
      currentY += 10;
    });
    
    overtimeLines2.forEach(line => {
      doc.text(line, margin + 5, currentY);
      currentY += 10;
    });
    
    yPos += 65;
    
    // Financial Details Section
    checkPageBreak(50);
    
    addSectionBackground(yPos, 45, [31, 41, 55]); // Gray-800
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('FINANCIAL DETAILS', margin, yPos + 5);
    
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Three column layout for financial details
    const col1 = margin + 5;
    const col2 = margin + 70;
    const col3 = margin + 135;
    
    doc.text(`Agreement Total: $${agreementAmount}`, col1, yPos);
    doc.text(`Deposit: ${booking.amount}`, col2, yPos);
    doc.text(`Balance: $${remainingBalance}`, col3, yPos);
    
    yPos += 35;
    
    // Terms and Conditions Section
    const terms = [
      '• Remaining balance must be paid in full on or before the start of event.',
      '• Date and Time of event are reserved as agreed upon within the details of this contract.',
      '• Any changes must be made at least 24 hours prior to event.',
      '• In the unlikely event of an emergency, Jeff Jackson Jr will attempt to arrange a',
      '  replacement DJ/Host to fulfill this contract agreement.',
      '• In the event of cancellation, the event can be re-booked within 30 days without fees.',
      '• If the venue requires insurance, the price will be reimbursed by the Client.'
    ];
    
    const termsHeight = 30 + (terms.length * 10);
    checkPageBreak(termsHeight);
    
    addSectionBackground(yPos, termsHeight, [17, 24, 39]); // Gray-900
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TERMS AND CONDITIONS', margin, yPos + 5);
    
    yPos += 20;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    terms.forEach(term => {
      // Split long terms if they exceed page width
      const termLines = doc.splitTextToSize(term, pageWidth - 2 * margin - 10);
      termLines.forEach(line => {
        if (yPos > maxContentHeight - 10) {
          doc.addPage();
          yPos = 20;
          // Re-add background for continuation
          doc.setFillColor(248, 250, 252);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
          doc.setTextColor(255, 255, 255);
        }
        doc.text(line, margin + 5, yPos);
        yPos += 10;
      });
    });
    
    yPos += 15;
    
    // Signatures Section
    checkPageBreak(80);
    
    addSectionBackground(yPos, 75, [55, 65, 81]); // Gray-700
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('ACCEPTANCE OF AGREEMENT', margin, yPos + 5);
    
    yPos += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('By signing below, the client acknowledges they have read, understood, and agree', margin + 5, yPos);
    doc.text('to all the terms of this contract agreement.', margin + 5, yPos + 12);
    
    yPos += 30;
    
    // Signature fields
    doc.text(`Client Name: ${booking.clientName}`, margin + 5, yPos);
    doc.text(`Owner Name: ${ownerName}`, margin + 100, yPos);
    yPos += 15;
    
    // Signature lines with better styling
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin + 5, yPos, margin + 85, yPos);
    doc.line(margin + 100, yPos, margin + 180, yPos);
    
    yPos += 10;
    doc.setFontSize(8);
    doc.text('Client Signature', margin + 5, yPos);
    doc.text('Owner Signature', margin + 100, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin + 5, yPos);
    
    // Footer note - ensure it fits
    yPos += 20;
    if (yPos > maxContentHeight - 15) {
      doc.addPage();
      yPos = 20;
      // Re-add background for new page
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(0, 0, 0);
    doc.text('*Note: Contract will be VOID if deposit is not received within 7 days of receipt.', margin + 5, yPos);
    
    // Generate and download PDF
    doc.save(`DJ_Agreement_${booking.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    onClose();
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  } finally {
    setIsGenerating(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-400" />
            Send Agreement
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            &times;
          </button>
        </div>

        <form onSubmit={handleGeneratePDF}>
          <div className="mb-6 space-y-3">
            <h4 className="font-bold text-lg border-b border-gray-700 pb-2">
              Client Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Client Name
                </label>
                <div className="bg-gray-700 p-2 rounded border border-gray-600">
                  {booking.clientName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Client Phone
                </label>
                <div className="bg-gray-700 p-2 rounded border border-gray-600">
                  {booking.phone}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Date
                </label>
                <div className="bg-gray-700 p-2 rounded border border-gray-600">
                  {new Date(booking.eventDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Location
                </label>
                <div className="bg-gray-700 p-2 rounded border border-gray-600">
                  {booking.street}
                  {booking.apt ? `, ${booking.apt}` : ""}, {booking.city},{" "}
                  {booking.state}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Start Time
                </label>
                <div className="bg-gray-700 p-2 rounded border border-gray-600">
                  {booking.eventTime}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event End Time
                </label>
                <input
                  type="text"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Type of Event
                </label>
                <div className="bg-gray-700 p-2 rounded border border-gray-600">
                  {booking.eventType}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Special Instructions/Requests
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              rows="3"
              placeholder="Enter any special instructions or requests"
            />
          </div>

          <div className="mb-6 bg-gray-900 p-4 rounded-lg">
            <p className="mb-4">
              Jeff Jackson Jr services agrees to provide music and entertainment
              at the above time and location as needed for the event.{" "}
              <b>
                {" "}
                (Overtime will be charged at a rate of $200 per additional hour.
                Overtime will only be provided if the DJ is available.){" "}
              </b>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Agreement Amount Total ($)
                </label>
                <input
                  type="number"
                  value={agreementAmount}
                  onChange={(e) =>
                    setAgreementAmount(parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Deposit Received
                </label>
                <div className="bg-gray-700 p-2 rounded border border-gray-600">
                  {booking.amount}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Remaining Balance
                </label>
                <div className="bg-gray-700 p-2 rounded border border-gray-600">
                  ${remainingBalance}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-bold mb-2">
                Terms and Conditions of Agreement
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Remaining balance must be paid in full on or before the start
                  of event.
                </li>
                <li>
                  Date and Time of event are reserved as agreed upon within the
                  details of this contract agreement. Any changes must be made
                  at least 24 hours prior to event.
                </li>
                <li>
                  In the unlikely event of an emergency, (i.e., illness,
                  accident, act of God), it shall be the duty of Jeff Jackson Jr
                  to attempt to arrange a replacement DJ/Host to fulfill this
                  contract agreement.
                </li>
                <li>
                  In the event of cancellation, the event can be re-booked
                  within 30 days without additional fees.
                </li>
                <li>
                  If the venue requires insurance, the price of the insurance
                  will be reimbursed from the "Client" to Jeff Jackson Jr.
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-bold mb-2">Acceptance of Agreement</h4>
              <p className="mb-4">
                By signing below, the client acknowledges they have read,
                understood, and agree to all the terms of this contract
                agreement.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Client's Printed Name
                  </label>
                  <div className="bg-gray-700 p-2 rounded border border-gray-600">
                    {booking.clientName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Client's Signature
                  </label>
                  <div className="h-12 border-b border-gray-500"></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Owner's Signature
                  </label>
                  <div className="h-12 border-b border-gray-500"></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <div className="bg-gray-700 p-2 rounded border border-gray-600">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            <p className="text-sm italic">
              *Note: Contract will be VOID if deposit is not received within 7
              days of receipt of the contract. (Please sign contract and return
              one copy with the required security deposit.)
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              {isGenerating ? "Generating PDF..." : "Generate PDF Agreement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  const [agreementModal, setAgreementModal] = useState({
    isOpen: false,
    booking: null,
  });

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

  const sendAgreement = async (payload) => {
    console.log("Sending agreement with payload:", payload);
    // Here you would typically call an API to generate and send the PDF
    // For now, we'll just log it and close the modal
    setAgreementModal({ isOpen: false, booking: null });
    // After sending, you might want to refresh the bookings list
    await fetchBookings();
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
                      <option value="08:00 AM">08:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                      <option value="6:00 PM">6:00 PM</option>
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
                        Booking ID
                      </th>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {booking.id}
                        </td>
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
                            {booking.status === "Paid" ? `${booking.amount} paid` : booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => setAgreementModal({ isOpen: true, booking })}
                            className="text-purple-400 hover:text-purple-300"
                            title="Send Agreement"
                          >
                            <PaperAirplaneIcon className="h-5 w-5" />
                          </button>
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

      {/* Agreement Modal */}
      {agreementModal.isOpen && (
        <AgreementModal
          booking={agreementModal.booking}
          onClose={() => setAgreementModal({ isOpen: false, booking: null })}
          onSend={sendAgreement}
        />
      )}
    </div>
  );
}