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
import ProtectedRoute from "../redux/ProtectedRoute";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { getConfig } from '../config/activeConfig';
import axios from 'axios';

// Constants for colors and dimensions
const COLORS = {
  PURPLE: [147, 51, 234],
  DARK_GRAY: [17, 24, 39],
  LIGHT_GRAY: [248, 250, 252],
  GRAY_700: [55, 65, 81],
  GRAY_800: [31, 41, 55],
  GRAY_900: [17, 24, 39],
};

const DIMENSIONS = {
  MARGIN: 20,
  HEADER_HEIGHT: 40,
};

const loadJsPDF = () => {
  return new Promise((resolve, reject) => {
    if (window.jsPDF) {
      resolve(window.jsPDF);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
      resolve(window.jspdf.jsPDF);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

function PdfPreviewSend({ pdfData, onClose, booking }) {
  const [email, setEmail] = useState(booking.email || "");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendEmail = async () => {
    if (!email) {
      alert("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfData.blob, pdfData.fileName);
      formData.append("email", email);
      formData.append(
        "subject",
        `DJ Service Agreement for ${booking.clientName}`
      );
      formData.append(
        "body",
        "Please find attached your DJ Service Agreement."
      );

      const response = await fetch("/api/send-agreement", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Email sent successfully!");
        setTimeout(() => onClose(), 2000);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setMessage("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Review and Send Agreement</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            &times;
          </button>
        </div>

        <div className="pdf-preview-container mb-4">
          <iframe
            src={pdfData.url}
            title="PDF Preview"
            className="w-full h-[500px] border border-gray-600 rounded-lg"
          />
        </div>

        <div className="email-section bg-gray-900 p-4 rounded-lg">
          <label className="block text-sm font-medium mb-2">Send to:</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              placeholder="recipient@example.com"
              disabled
            />

            <button
              onClick={handleSendEmail}
              disabled={isSending}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
          {message && (
            <div
              className={`mt-2 p-2 rounded ${
                message.includes("success")
                  ? "bg-green-900 text-green-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function AgreementModal({ booking, onClose, onSend }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [agreementAmount, setAgreementAmount] = useState(
    parseInt(booking.totalAmount?.replace(/\D/g, "")) || 0
  );
  const [ownerName, setOwnerName] = useState("Jeff Jackson Jr");
  const [eventEndTime, setEventEndTime] = useState("");
  const [pdfData, setPdfData] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Calculate remaining balance safely
  const depositAmount =
    parseInt(booking.depositReceived?.replace(/\D/g, "")) || 0;
  const remainingBalance = agreementAmount
    ? agreementAmount - depositAmount
    : 0;

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers or empty string
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setAgreementAmount(value === "" ? "" : parseInt(value, 10));
    }
  };

  // Helper function to format dates consistently
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to add wrapped text and return height used
  const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 10) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line, i) => {
      doc.text(line, x, y + i * lineHeight);
    });
    return lines.length * lineHeight;
  };

  const handleGeneratePDF = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF();

      const margin = DIMENSIONS.MARGIN;
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
        doc.rect(
          margin - 5,
          startY - 5,
          pageWidth - 2 * margin + 10,
          height,
          "F"
        );
      };

      // Add background color effect (light gray)
      doc.setFillColor(...COLORS.LIGHT_GRAY);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Header with purple background
      doc.setFillColor(...COLORS.PURPLE);
      doc.rect(0, 0, pageWidth, DIMENSIONS.HEADER_HEIGHT, "F");

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Jeff Jackson DJ Service Agreement", pageWidth / 2, 25, {
        align: "center",
      });

      yPos = 55;
      doc.setTextColor(0, 0, 0); // Reset to black

      // Client Details Section
checkPageBreak(90);
addSectionBackground(yPos, 90, COLORS.GRAY_800);

doc.setFontSize(14);
doc.setFont("helvetica", "bold");
doc.setTextColor(255, 255, 255);
doc.text("CLIENT DETAILS", margin, yPos + 5);

yPos += 20;
doc.setFontSize(10);
doc.setFont("helvetica", "normal");

// Two column layout for client details
const leftCol = margin + 5;
const rightCol = pageWidth / 2 + 10;

// Add ID field (either booking ID or enquiry ID)
doc.text(`ID: ${booking.id}`, leftCol, yPos);
yPos += 12;  // Move down for the next field

doc.text(`Client Name: ${booking.clientName}`, leftCol, yPos);
doc.text(`Phone: ${booking.phone}`, rightCol, yPos);
yPos += 12;

doc.text(`Event Date: ${formatDate(booking.eventDate)}`, leftCol, yPos);
doc.text(`Event Start Time: ${booking.eventTime}`, rightCol, yPos);
yPos += 12;

doc.text(`Event End Time: ${eventEndTime}`, leftCol, yPos);
doc.text(`Type of Event: ${booking.eventType}`, rightCol, yPos);
yPos += 12;

      // Address spans full width
      const addressText = `Event Location: ${booking.street}${
        booking.apt ? `, ${booking.apt}` : ""
      }, ${booking.city}, ${booking.state}`;
      yPos += addWrappedText(
        doc,
        addressText,
        leftCol,
        yPos,
        pageWidth - 2 * margin - 10,
        8
      );
      yPos += 20;

      // Special Instructions Section
      if (specialInstructions) {
        const sectionHeight =
          30 +
          addWrappedText(
            doc,
            specialInstructions,
            margin + 5,
            yPos + 20,
            pageWidth - 2 * margin - 10,
            8
          );

        checkPageBreak(sectionHeight);
        addSectionBackground(yPos, sectionHeight, COLORS.GRAY_900);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("SPECIAL INSTRUCTIONS", margin, yPos + 5);
        yPos += 20;

        doc.setFont("helvetica", "normal");
        yPos += addWrappedText(
          doc,
          specialInstructions,
          margin + 5,
          yPos,
          pageWidth - 2 * margin - 10,
          8
        );
        yPos += 20;
      }

      // Service Agreement Section
      checkPageBreak(60);
      addSectionBackground(yPos, 50, COLORS.GRAY_700);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text(
        "Jeff Jackson Jr services agrees to provide music and entertainment at the above time",
        margin + 5,
        yPos + 10
      );
      doc.text("and location as needed for the event.", margin + 5, yPos + 22);

      doc.setFont("helvetica", "bold");
      const overtimeText =
        "(Overtime will be charged at a rate of $200 per additional hour. Overtime will only be provided if the DJ is available.)";

      yPos += addWrappedText(
        doc,
        overtimeText,
        margin + 5,
        yPos + 34,
        pageWidth - 2 * margin - 10,
        10
      );
      yPos += 40;

      // Financial Details Section
      addSectionBackground(yPos, 45, COLORS.GRAY_800);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("FINANCIAL DETAILS", margin, yPos + 5);

      yPos += 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Three column layout for financial details
      const col1 = margin + 5;
      const col2 = margin + 70;
      const col3 = margin + 135;

      doc.text(`Agreement Total: $${agreementAmount}`, col1, yPos);
      doc.text(`Deposit: ${booking.depositReceived}`, col2, yPos);
      doc.text(`Balance: $${remainingBalance}`, col3, yPos);

      yPos += 35;

      // Terms and Conditions Section
      const terms = [
        "• Remaining balance must be paid in full on or before the start of event.",
        "• Date and Time of event are reserved as agreed upon within the details of this contract.",
        "• Any changes must be made at least 24 hours prior to event.",
        "• In the unlikely event of an emergency, Jeff Jackson Jr will attempt to arrange a",
        "  replacement DJ/Host to fulfill this contract agreement.",
        "• In the event of cancellation, the event can be re-booked within 30 days without fees.",
        "• If the venue requires insurance, the price will be reimbursed by the Client.",
      ];

      const termsHeight = 30 + terms.length * 10;
      checkPageBreak(termsHeight);
      addSectionBackground(yPos, termsHeight, COLORS.GRAY_900);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("TERMS AND CONDITIONS", margin, yPos + 5);

      yPos += 20;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      terms.forEach((term) => {
        const termLines = doc.splitTextToSize(
          term,
          pageWidth - 2 * margin - 10
        );
        termLines.forEach((line) => {
          if (yPos > maxContentHeight - 10) {
            doc.addPage();
            yPos = 20;
            // Re-add background for continuation
            doc.setFillColor(...COLORS.LIGHT_GRAY);
            doc.rect(0, 0, pageWidth, pageHeight, "F");
            doc.setTextColor(255, 255, 255);
          }
          doc.text(line, margin + 5, yPos);
          yPos += 10;
        });
      });

      yPos += 15;

      // Signatures Section
      checkPageBreak(80);
      addSectionBackground(yPos, 75, COLORS.GRAY_700);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("ACCEPTANCE OF AGREEMENT", margin, yPos + 5);

      yPos += 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "By signing below, the client acknowledges they have read, understood, and agree",
        margin + 5,
        yPos
      );
      doc.text(
        "to all the terms of this contract agreement.",
        margin + 5,
        yPos + 12
      );

      yPos += 30;

      // Signature fields
      doc.text(`Client Name: ${booking.clientName}`, margin + 5, yPos);
      doc.text(`Owner Name: ${ownerName}`, margin + 100, yPos);
      yPos += 15;

      // Signature lines with better styling
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin + 5, yPos, margin + 85, yPos);
      doc.line(margin + 100, yPos, margin + 170, yPos);

      yPos += 10;
      doc.setFontSize(8);
      doc.text("Client Signature", margin + 5, yPos);
      doc.text("Owner Signature", margin + 100, yPos);
      yPos += 15;

      doc.setFontSize(10);
      doc.text(`Date: ${formatDate(new Date())}`, margin + 5, yPos);

      // Footer note - ensure it fits
      yPos += 20;
      if (yPos > maxContentHeight - 15) {
        doc.addPage();
        yPos = 20;
        // Re-add background for new page
        doc.setFillColor(...COLORS.LIGHT_GRAY);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
      }

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(0, 0, 0);
      doc.text(
        "*Note: Contract will be VOID if deposit is not received within 7 days of receipt.",
        margin + 5,
        yPos
      );

      // Generate PDF blob and URL for preview
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setPdfData({
        url: pdfUrl,
        blob: pdfBlob,
        fileName: `DJ_Agreement_${booking.clientName.replace(/\s+/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }.pdf`,
      });

      setShowPdfPreview(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-400" />
              Send Agreement
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleGeneratePDF}>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Owner Name Field */}
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

                {/* Agreement Amount Field */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Agreement Amount Total ($)
                  </label>
                  <input
                    type="text" // Using text type to better handle empty state
                    value={agreementAmount}
                    onChange={handleAmountChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                {/* Deposit Received (readonly) */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Deposit
                  </label>
                  <input
                    type="text"
                    value={booking.depositReceived || booking.amount}
                    readOnly
                    className="w-full text-purple-400 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 cursor-not-allowed"
                  />
                </div>

                {/* Remaining Balance (readonly) */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Remaining Balance
                  </label>
                  <input
                    type="text"
                    value={`$${remainingBalance}`}
                    readOnly
                    className="w-full text-purple-400 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Special Instructions Field */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Special Instructions/Requests
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 min-h-[100px]"
                  placeholder="Enter any special instructions or requests for the agreement..."
                />
              </div>

              {/* Event End Time Field */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event End Time
                </label>
                <input
                  type="text"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="Enter time i.e. 11:00 PM"
                  required
                />
              </div>
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

      {showPdfPreview && pdfData && (
        <PdfPreviewSend
          pdfData={pdfData}
          onClose={() => {
            setShowPdfPreview(false);
            onClose();
          }}
          booking={booking}
        />
      )}
    </>
  );
}

function AdminDashboardContent() {
  const { token } = useSelector((state) => state.auth);
  const [searchMethod, setSearchMethod] = useState('email');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchBookingId, setSearchBookingId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [editAmountModal, setEditAmountModal] = useState({
    isOpen: false,
    bookingId: null,
    fieldToEdit: null, // 'deposit' or 'total'
    depositReceived: "",
    totalAmount: "",
  });
  
  const config = getConfig();
  const api = axios.create({
  baseURL: config.healthCheck,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    withCredentials: true, // Important for CORS with credentials
  }
});

  // Add this function to handle amount updates
  const handleUpdateAmount = async (e) => {
    e.preventDefault();

    setEnquiries(
      enquiries.map((enquiry) => {
        if (enquiry.id === editAmountModal.bookingId) {
          const newDeposit =
            editAmountModal.fieldToEdit === "deposit"
              ? `$${editAmountModal.depositReceived}`
              : enquiry.depositReceived;

          const newTotal =
            editAmountModal.fieldToEdit === "total"
              ? `$${editAmountModal.totalAmount}`
              : enquiry.totalAmount;

          return {
            ...enquiry,
            depositReceived: newDeposit,
            totalAmount: newTotal,
            remainingAmount: `$${
              parseInt(newTotal.replace(/\D/g, "")) -
              parseInt(newDeposit.replace(/\D/g, ""))
            }`,
          };
        }
        return enquiry;
      })
    );

    setEditAmountModal({
      isOpen: false,
      bookingId: null,
      fieldToEdit: null,
      totalAmount: "",
      depositReceived: "",
    });
  };

  const [selectedTab, setSelectedTab] = useState(0);
  const [blockedDates, setBlockedDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBlockedDates = async () => {
  try {
    const response = await api.get('/api/blockSchedule');
    setBlockedDates(response.data);
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    toast.error(
      error.response?.data?.message || 
      "Failed to fetch blocked dates. Please try again."
    );
  }
};

  const fetchBookings = async () => {
    setBookings([
      {
        id: "BK123456",
        clientName: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 555-123-4567",
        eventType: "Wedding Reception",
        type: "booking",
        eventDate: "2023-06-12",
        eventTime: "6:00 PM",
        street: "123 Main Street",
        apt: "Apt 4B",
        city: "New York",
        state: "NY",
        message: "Need DJ for our wedding reception from 6PM to midnight",
        status: "Paid",
        depositReceived: "$500",
        totalAmount: "$500",
        remainingAmount: "$0",
      },
      {
        id: "BK789012",
        clientName: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1 555-987-6543",
        eventType: "Corporate Event",
        type: "booking",
        eventDate: "2023-06-18",
        eventTime: "8:00 PM",
        street: "456 Business Ave",
        apt: "",
        city: "Brooklyn",
        state: "NY",
        message: "Annual company party with 100+ guests",
        status: "Pending",
        depositReceived: "$750",
        totalAmount: "$1500",
        remainingAmount: "$750",
      },
    ]);
  };

  const fetchEnquiries = async () => {
    setEnquiries([
      {
        id: "EQ123456",
        clientName: "Sarah Williams",
        email: "sarah.w@example.com",
        phone: "+1 555-789-0123",
        eventType: "Anniversary",
        type: "enquiry",
        eventDate: "2023-07-12",
        eventTime: "5:00 PM",
        street: "321 Memory Blvd",
        apt: "Penthouse",
        city: "Manhattan",
        state: "NY",
        message: "25th anniversary celebration with dinner and dancing",
        status: "Approved",
        depositReceived: "$500",
        totalAmount: "$1000",
        remainingAmount: "$500",
      },
      {
        id: "EQ789012",
        clientName: "Alex Johnson",
        email: "alex.j@example.com",
        phone: "+1 555-456-7890",
        eventType: "Birthday Party",
        type: "enquiry",
        eventDate: "2023-07-05",
        eventTime: "7:00 PM",
        street: "789 Celebration Lane",
        apt: "",
        city: "Queens",
        state: "NY",
        message: "Looking for DJ for my 30th birthday party",
        status: "Pending",
        depositReceived: "$1100",
        totalAmount: "$1200",
        remainingAmount: "$100",
      }
    ]);
  };

  const handleBlockDate = async (e) => {
  e.preventDefault();
  
  // Validate payload
  if (!newBlock.date || !newBlock.time) {
    toast.error("Date and Time are required");
    return;
  }

  try {
    const payload = {
      date: newBlock.date,
      time: newBlock.time,
      reason: newBlock.reason || "",
      type: "user" // Default type is user
    };

    await api.post('/api/blockSchedule', payload);
    
    toast.success("Date blocked successfully");
    setNewBlock({ date: "", time: "", reason: "" });
    await fetchBlockedDates();
  } catch (error) {
    console.error("Error blocking date:", error);
    toast.error(
      error.response?.data?.message || 
      "Failed to block date. Please try again."
    );
  }
};

  const confirmDeleteBlockedDate = (id) => {
    setDeleteConfirmation({
      isOpen: true,
      id: id,
    });
  };

  const deleteBlockedDate = async () => {
  try {
    await api.delete(`/api/blockSchedule/${deleteConfirmation.id}`);
    toast.success("Blocked date deleted successfully");
    await fetchBlockedDates();
    setDeleteConfirmation({
      isOpen: false,
      id: null,
    });
  } catch (error) {
    console.error("Error deleting blocked date:", error);
    toast.error(
      error.response?.data?.message || 
      "Failed to delete blocked date. Please try again."
    );
  }
};

  const handleEnquiryAction = (id, action) => {
  const enquiry = enquiries.find((e) => e.id === id);

  if (action === "approve") {
    setAgreementModal({
      isOpen: true,
      booking: enquiry, // We're reusing the same modal, so we'll pass the enquiry as booking
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

  const handleSearch = (e) => {
  e.preventDefault();
  
  // Mock data - in a real app you would fetch this from your API
  const mockAgreement = {
    id: 'BK123456',
    name: 'Adam Rose',
    email: 'adam@example.com',
    phone: '+1 555-789-0456',
    address: '456 Melody Lane, Apt 4B, Brooklyn, NY 11201',
    eventType: 'Corporate Party',
    type: "booking",
    eventDate: '2023-07-18',
    eventTime: '5:00 PM',
    pdfUrl: "https://conasems-ava-prod.s3.sa-east-1.amazonaws.com/aulas/ava/dummy-1641923583.pdf" // Replace with your mock PDF URL
  };

  // Simple validation - in a real app you would check against your database
  if ((searchMethod === 'email' && 
       searchEmail === 'adam@example.com' && 
       searchBookingId === 'BK123456') ||
      (searchMethod === 'id' && searchId === 'BK123456')) {
    setSearchResults(mockAgreement);
  } else {
    alert('No agreement found with those details');
    setSearchResults(null);
  }
};

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-8">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400 bg-[length:200%_200%] animate-gradient-flow">Admin</span> Dashboard
      </h1>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-lg bg-gray-900 p-1 mb-6">
          {["Bookings", "Enquiries", "Block Schedule", "Agreements"].map(
            (tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `w-full py-2.5 text-sm font-medium rounded-md transition-all ${
                    selected
                      ? "bg-gradient-to-r from-purple-600 to-fuchsia-600"
                      : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                {tab}
              </Tab>
            )
          )}
        </Tab.List>

        <Tab.Panels>
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
                      {/* Changed order of these columns */}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Deposit Received
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Remaining Amount
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
                        {/* Changed order of these columns to match header */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                            {booking.depositReceived}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300 mr-2">
                              {booking.totalAmount}
                            </span>
                            <button
                              onClick={() =>
                                setEditAmountModal({
                                  isOpen: true,
                                  bookingId: booking.id,
                                  fieldToEdit: "total",
                                  depositReceived:
                                    booking.depositReceived.replace(/\D/g, ""),
                                  totalAmount: booking.totalAmount.replace(
                                    /\D/g,
                                    ""
                                  ),
                                })
                              }
                              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-5 py-2 rounded-full font-medium transition duration-300 transform hover:scale-105 text-xs"
                            >Edit</button>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              parseInt(
                                booking.remainingAmount.replace(/\D/g, "")
                              ) > 0
                                ? "bg-yellow-900 text-yellow-300"
                                : "bg-green-900 text-green-300"
                            }`}
                          >
                            {booking.remainingAmount}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() =>
                              setAgreementModal({
                                isOpen: true,
                                booking: {
                                  ...booking,
                                  amount: booking.depositReceived,
                                },
                              })
                            }
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
                      {/* Renamed these columns */}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Ask for Deposit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Remaining Amount
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
                        {/* These columns now match the renamed headers */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300 mr-2">
                              {enquiry.totalAmount}
                            </span>
                            <button
                              onClick={() =>
                                setEditAmountModal({
                                  isOpen: true,
                                  bookingId: enquiry.id,
                                  fieldToEdit: "total",
                                  depositReceived:
                                    enquiry.depositReceived.replace(/\D/g, ""),
                                  totalAmount: enquiry.totalAmount.replace(
                                    /\D/g,
                                    ""
                                  ),
                                })
                              }
                              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-5 py-2 rounded-full font-medium transition duration-300 transform hover:scale-105 text-xs"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300 mr-2">
                              {enquiry.depositReceived}
                            </span>
                            <button
                              onClick={() =>
                                setEditAmountModal({
                                  isOpen: true,
                                  bookingId: enquiry.id,
                                  fieldToEdit: "deposit",
                                  depositReceived:
                                    enquiry.depositReceived.replace(/\D/g, ""),
                                  totalAmount: enquiry.totalAmount.replace(
                                    /\D/g,
                                    ""
                                  ),
                                })
                              }
                              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-5 py-2 rounded-full font-medium transition duration-300 transform hover:scale-105 text-xs"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              parseInt(
                                enquiry.remainingAmount.replace(/\D/g, "")
                              ) > 0
                                ? "bg-yellow-900 text-yellow-300"
                                : "bg-green-900 text-green-300"
                            }`}
                          >
                            {enquiry.remainingAmount}
                          </span>
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
            <option value="09:00 AM">09:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="12:00 PM">12:00 PM</option>
            <option value="01:00 PM">01:00 PM</option>
            <option value="02:00 PM">02:00 PM</option>
            <option value="03:00 PM">03:00 PM</option>
            <option value="04:00 PM">04:00 PM</option>
            <option value="05:00 PM">05:00 PM</option>
            <option value="06:00 PM">06:00 PM</option>
            <option value="07:00 PM">07:00 PM</option>
            <option value="08:00 PM">08:00 PM</option>
            <option value="09:00 PM">09:00 PM</option>
            <option value="10:00 PM">10:00 PM</option>
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
          className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-4 py-2 rounded-lg"
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
      {blockedDates.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No blocked dates found</p>
      ) : (
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
                  Type
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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      block.type === "SYSTEM" 
                        ? "bg-blue-900 text-blue-300" 
                        : "bg-purple-900 text-purple-300"
                    }`}>
                      {block.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {block.type === "user" && (
                      <button
                        onClick={() => confirmDeleteBlockedDate(block.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
</Tab.Panel>
          
          {/* Agreements Tab */}
<Tab.Panel>
  <div className="bg-gray-900 rounded-lg p-6">
    
    
    {/* Search Form */}
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
    <h2 className="text-xl font-bold mb-6">View Agreements</h2>
    <p className="text-gray-300 mb-4 text-lg">Search by:</p>
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => setSearchMethod('email')}
        className={`px-4 py-2 rounded-lg ${searchMethod === 'email' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white' : 'bg-gray-700 text-gray-300'}`}
      >
        Email & Unique ID
      </button>
      <button
        onClick={() => setSearchMethod('id')}
        className={`px-4 py-2 rounded-lg ${searchMethod === 'id' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white' : 'bg-gray-700 text-gray-300'}`}
      >
        Unique ID
      </button>
    </div>

    <form onSubmit={handleSearch} className="space-y-6">
      {searchMethod === 'id' ? (
        <div>
          <div>
            <label className="block text-sm font-medium mb-1">Unique ID *</label>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3"
              placeholder="BK123456"
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
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3"
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unique ID *</label>
              <input
                type="text"
                value={searchBookingId}
                onChange={(e) => setSearchBookingId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3"
                placeholder="BK123456"
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
          View Agreement
        </button>
      </center>
    </form>
  </div>
</div>

    {/* Search Results */}
    {searchResults && (
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="mt-5 text-lg font-bold mb-4">Agreement Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-400">Booking ID</p>
            <p className="font-medium">{searchResults.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Client Name</p>
            <p className="font-medium">{searchResults.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="font-medium">{searchResults.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Phone</p>
            <p className="font-medium">{searchResults.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Event Type</p>
            <p className="font-medium">{searchResults.eventType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Event Date</p>
            <p className="font-medium">{searchResults.eventDate} at {searchResults.eventTime}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-400">Address</p>
            <p className="font-medium">{searchResults.address}</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <a
            href={searchResults.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            View PDF Agreement
          </a>
        </div>
      </div>
    )}
  </div>
</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this blocked schedule?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() =>
                  setDeleteConfirmation({ isOpen: false, id: null })
                }
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
            <p className="mb-6">
              Are you sure you want to approve this enquiry?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() =>
                  setApprovalConfirmation({ isOpen: false, id: null })
                }
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
            <h3 className="text-lg font-bold mb-4">
              Schedule Meeting for Denial
            </h3>

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
                  onChange={(e) =>
                    setDenyDialog({ ...denyDialog, date: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time *</label>
                <select
                  value={denyDialog.time}
                  onChange={(e) =>
                    setDenyDialog({ ...denyDialog, time: e.target.value })
                  }
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
                <label className="block text-sm font-medium mb-1">
                  Message *
                </label>
                <textarea
                  value={denyDialog.message}
                  onChange={(e) =>
                    setDenyDialog({ ...denyDialog, message: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  required
                  placeholder="Enter your message to the client"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() =>
                    setDenyDialog({
                      isOpen: false,
                      enquiry: null,
                      date: "",
                      time: "",
                      message: "",
                    })
                  }
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

      {/* Edit Amount Modal */}
      {editAmountModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              Edit{" "}
              {editAmountModal.fieldToEdit === "deposit"
                ? "Ask for Deposit"
                : "Total Amount"}
            </h3>
            <form onSubmit={handleUpdateAmount} className="space-y-4">
              {editAmountModal.fieldToEdit === "deposit" ? (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ask for Deposit ($)
                  </label>
                  <input
                    type="number"
                    value={editAmountModal.depositReceived}
                    onChange={(e) =>
                      setEditAmountModal({
                        ...editAmountModal,
                        depositReceived: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total Amount ($)
                  </label>
                  <input
                    type="number"
                    value={editAmountModal.totalAmount}
                    onChange={(e) =>
                      setEditAmountModal({
                        ...editAmountModal,
                        totalAmount: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Remaining Amount
                </label>
                <input
                  type="text"
                  value={`$${
                    parseInt(editAmountModal.totalAmount || 0) -
                    parseInt(editAmountModal.depositReceived || 0)
                  }`}
                  readOnly
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 cursor-not-allowed"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() =>
                    setEditAmountModal({
                      isOpen: false,
                      bookingId: null,
                      fieldToEdit: null,
                      totalAmount: "",
                      depositReceived: "",
                    })
                  }
                  className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
