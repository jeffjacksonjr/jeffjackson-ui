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
import { useSelector, useDispatch  } from "react-redux";
import { getConfig } from '../config/activeConfig';
import axios from 'axios';
import { PencilIcon } from "@heroicons/react/24/outline";
import TableLoader from "../utils/TableLoader";
import { setSelectedTab } from '../redux/adminDashboardSlice';

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
  const config = getConfig();

  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Append the PDF blob with the required filename format
      formData.append(
        "file", 
        pdfData.blob, 
        `${booking.uniqueId}.pdf` // Ensure filename is uniqueId.pdf
      );
      
      // Append other required fields
      formData.append("clientEmail", email);
      formData.append("uniqueId", booking.uniqueId);
      formData.append("type","admin");

      // Make the API call with axios including the token
      const response = await axios.post(
        `${config.healthCheck}/api/public/sendAgreement`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data && response.data.status === "Success") {
        toast.success("Agreement sent successfully!");
        setTimeout(() => onClose(), 2000);
      } else {
        throw new Error(response.data?.message || "Failed to send agreement");
      }
    } catch (error) {
      console.error("Error sending agreement:", error);
      toast.error(error.message || "Failed to send agreement. Please try again.");
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
              disabled={isSending}
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
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700"
            disabled={isSending}
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
  const [nonRefundableDeposit, setNonRefundableDeposit] = useState(true);

  // Calculate remaining balance correctly: totalAmount - totalAmountReceived
  const totalAmountReceived = parseInt(booking.totalAmountReceived?.replace(/\D/g, "")) || 0;
  // const depositAmount = parseInt(booking.depositReceived?.replace(/\D/g, "")) || 0;
  const remainingBalance = agreementAmount
    ? agreementAmount - totalAmountReceived
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
  try {
    let dateObj;
    
    if (typeof date === 'string') {
      // Handle MM-DD-YYYY format specifically
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(date)) {
        const [month, day, year] = date.split('-');
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } 
      // Handle YYYY-MM-DD format
      else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(date)) {
        const [year, month, day] = date.split('-');
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      // Fallback to native parsing
      else {
        dateObj = new Date(date);
      }
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return "Invalid Date";
    }
    
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }
    
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "Invalid Date";
  }
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
      // doc.text(`Event Start Time: ${booking.eventTime}`, rightCol, yPos);
      doc.text(`Event Duration: ${eventEndTime}`, rightCol, yPos);
      yPos += 12;

      // doc.text(`Event Duration: ${eventEndTime}`, leftCol, yPos);
      doc.text(`Type of Event: ${booking.eventType}`, leftCol, yPos);
      yPos += 12;

      // Address spans full width
      const addressText = `Event Location: ${booking.address}`;
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
      addSectionBackground(yPos, 25, COLORS.GRAY_800);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("FINANCIAL DETAILS", margin, yPos + 5);

      yPos += 15;
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

      if (nonRefundableDeposit) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 0, 0); // Red color for emphasis
        yPos += addWrappedText(
          doc,
          "NOTE: Deposits are NON-REFUNDABLE",
          margin + 5,
          yPos,
          pageWidth - 2 * margin - 10,
          10
        );
        doc.setTextColor(0, 0, 0); // Reset to black
      }

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
                    value={booking.totalAmount || agreementAmount}
                    onChange={handleAmountChange}
                    className="w-full text-purple-400 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 cursor-not-allowed"
                    readOnly
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

              {/* Non-refundable Deposit Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="nonRefundableDeposit"
                  checked={nonRefundableDeposit}
                  onChange={(e) => setNonRefundableDeposit(e.target.checked)}
                  className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="nonRefundableDeposit" className="ml-2 block text-sm text-gray-300">
                  Deposits are non-refundable
                </label>
              </div>

              {/* Event End Time Field */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Duration
                </label>
                <input
                  type="text"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  placeholder="Enter event duration i.e. 09:00PM - 11:00 PM"
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
  const [viewAgreement, setViewAgreement] = useState(false);
  const [editAmountModal, setEditAmountModal] = useState({
  isOpen: false,
  bookingId: null,
  fieldToEdit: null, // 'deposit', 'total', or 'status'
  depositReceived: "",
  totalAmount: "",
  status: ""
});
  const [enquiryPagination, setEnquiryPagination] = useState({
  currentPage: 0,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false
});

const [bookingPagination, setBookingPagination] = useState({
  currentPage: 0,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false
});

const [editBookingModal, setEditBookingModal] = useState({
  isOpen: false,
  bookingId: null,
  fieldToEdit: null, // 'totalAmount' or 'status'
  totalAmount: "",
  status: ""
});

const [isLoading, setIsLoading] = useState(true);
  
  const config = getConfig();
  const api = axios.create({
  baseURL: config.healthCheck,
  headers: {
    'Authorization': `Bearer ${token}`
},
  withCredentials: true // Important for CORS with credentials
  }
);

const handleUpdateBooking = async (e) => {
  e.preventDefault();
  
  try {
    let payload = {
      uniqueId: editBookingModal.bookingId,
      type: "booking"
    };

    if (editBookingModal.fieldToEdit === "totalAmount") {
      payload.totalAmount = editBookingModal.totalAmount;
    } else if (editBookingModal.fieldToEdit === "totalAmountReceived") {
      payload.totalAmountReceived = editBookingModal.totalAmountReceived;
    } else if (editBookingModal.fieldToEdit === "status") {
      payload.status = editBookingModal.status;
      
      // Show additional toast for completed status
      if (editBookingModal.status === "COMPLETED") {
        toast.success("Status updated to COMPLETED. Feedback email sent to client.", {
          duration: 5000
        });
      }
    }

    const response = await api.patch(`${config.bookingEndpoint}`, payload);

    if (response.data.status === "Fail") {
      toast.error(response.data.message || "Booking update failed");
      return;
    }

    // Update the local state if the API call was successful
    setBookings(
      bookings.map((booking) => {
        if (booking.uniqueId === editBookingModal.bookingId) {
          const updatedBooking = { ...booking };
          
          if (editBookingModal.fieldToEdit === "totalAmount") {
            const newTotalAmount = parseInt(editBookingModal.totalAmount) || 0;
            const currentTotalAmountReceived = parseInt(booking.totalAmountReceived.replace(/\D/g, "") || "0") || 0;
            
            updatedBooking.totalAmount = `$${newTotalAmount}`;
            updatedBooking.remainingAmount = `$${newTotalAmount - currentTotalAmountReceived}`;
            
          } else if (editBookingModal.fieldToEdit === "totalAmountReceived") {
            const newTotalAmountReceived = parseInt(editBookingModal.totalAmountReceived) || 0;
            const currentTotalAmount = parseInt(booking.totalAmount.replace(/\D/g, "") || "0") || 0;
            
            updatedBooking.totalAmountReceived = `$${newTotalAmountReceived}`;
            updatedBooking.remainingAmount = `$${currentTotalAmount - newTotalAmountReceived}`;
            
          } else if (editBookingModal.fieldToEdit === "status") {
            updatedBooking.status = editBookingModal.status;
          }

          return updatedBooking;
        }
        return booking;
      })
    );

    toast.success("Booking updated successfully");
    
    // Close the modal
    setEditBookingModal({
      isOpen: false,
      bookingId: null,
      fieldToEdit: null,
      totalAmount: "",
      totalAmountReceived: "",
      status: ""
    });

  } catch (error) {
    console.error("Error updating booking:", error);
    toast.error(
      error.response?.data?.message || 
      "Failed to update booking. Please try again."
    );
  }
};


const handleUpdateAmount = async (e) => {
  e.preventDefault();
  
  try {
    let payload = {
      uniqueId: editAmountModal.bookingId,
      type: "enquiry"
    };

    if (editAmountModal.fieldToEdit === "deposit") {
      payload.depositReceived = editAmountModal.depositReceived;
    } else if (editAmountModal.fieldToEdit === "total") {
      payload.totalAmount = editAmountModal.totalAmount;
    } else if (editAmountModal.fieldToEdit === "totalAmountReceived") {
      payload.totalAmountReceived = editAmountModal.totalAmountReceived;
    } else if (editAmountModal.fieldToEdit === "status") {
      payload.status = editAmountModal.status;
      
      // Show additional toast for finalized status
      if (editAmountModal.status === "FINALIZED") {
        toast.success("Status updated to FINALIZED. Feedback email sent to client.", {
          duration: 5000
        });
      }
    }

    const response = await api.patch(`${config.enquiryEndpoint}`, payload);

    if (response.data.status === "Fail") {
      toast.error(response.data.message || "Update failed");
      return;
    }

    // Update the local state if the API call was successful
    setEnquiries(
      enquiries.map((enquiry) => {
        if (enquiry.uniqueId === editAmountModal.bookingId) {
          const updatedEnquiry = { ...enquiry };
          
          if (editAmountModal.fieldToEdit === "deposit") {
            updatedEnquiry.depositReceived = editAmountModal.depositReceived;
          } else if (editAmountModal.fieldToEdit === "total") {
            updatedEnquiry.totalAmount = editAmountModal.totalAmount;
          } else if (editAmountModal.fieldToEdit === "totalAmountReceived") {
            updatedEnquiry.totalAmountReceived = editAmountModal.totalAmountReceived;
          } else if (editAmountModal.fieldToEdit === "status") {
            updatedEnquiry.status = editAmountModal.status;
          }

          // Recalculate remaining amount if deposit, total, or totalAmountReceived was updated
          if (editAmountModal.fieldToEdit === "deposit" || 
              editAmountModal.fieldToEdit === "total" ||
              editAmountModal.fieldToEdit === "totalAmountReceived") {
            const total = parseInt(updatedEnquiry.totalAmount || "0");
            const received = parseInt(updatedEnquiry.totalAmountReceived || "0");
            updatedEnquiry.remainingAmount = (total - received).toString();
          }

          return updatedEnquiry;
        }
        return enquiry;
      })
    );

    toast.success("Update successful");
    
    // Close the modal
    setEditAmountModal({
      isOpen: false,
      bookingId: null,
      fieldToEdit: null,
      totalAmount: "",
      depositReceived: "",
      totalAmountReceived: "",
      status: ""
    });

  } catch (error) {
    console.error("Error updating enquiry:", error);
    toast.error(
      error.response?.data?.message || 
      "Failed to update. Please try again."
    );
  }
};

  const dispatch = useDispatch();
  const selectedTab = useSelector((state) => state.adminDashboard.selectedTab);
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

  const formatBookingDate = (dateString) => {
  // Handle both "MM-DD-YYYY" and ISO format
  if (dateString.includes('-')) {
    const [month, day, year] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

  useEffect(() => {
    fetchBlockedDates();
    fetchBookings();
    fetchEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBlockedDates = async () => {
  try {
    setIsLoading(true);
    const response = await api.get('/api/blockSchedule');
    setBlockedDates(response.data);
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    toast.error(
      error.response?.data?.message || 
      "Failed to fetch blocked dates. Please try again."
    );
  }finally{
    setIsLoading(false);
  }
};

  const fetchBookings = async (page = 0) => {
  try {
    const response = await api.get(`${config.bookingEndpoint}?page=${page}`);
    const { content, meta } = response.data;
    
    // Transform the data to match your UI structure
    const transformedBookings = content.map(booking => ({
      id: booking.uniqueId,
      uniqueId: booking.uniqueId,
      clientName: booking.clientName,
      email: booking.email,
      phone: booking.phone,
      eventType: booking.eventType,
      type: "booking",
      eventDate: booking.eventDate,
      eventTime: booking.eventTime,
      address: booking.address,
      message: booking.message || "-",
      status: booking.status,
      depositReceived: `$${booking.depositReceived || "0"}`,
      totalAmount: `$${booking.totalAmount || "0"}`,
      totalAmountReceived : `$${booking.totalAmountReceived || "0"}`,
      remainingAmount: `$${booking.remainingAmount || "0"}`,
      paypalTransactionId: booking.paypalTransactionId || "-",
      agreementUrl: booking.agreementUrl,
      createdAt: booking.createdAt
    }));

    setBookings(transformedBookings);
    setBookingPagination({
      currentPage: meta.currentPage,
      pageSize: meta.pageSize,
      totalItems: meta.totalItems,
      totalPages: meta.totalPages,
      hasNext: meta.hasNext,
      hasPrevious: meta.hasPrevious
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    toast.error(
      error.response?.data?.message || 
      "Failed to fetch bookings. Please try again."
    );
  }
};

  const fetchEnquiries = async (page = 0) => {
  try {
    const response = await api.get(`${config.enquiryEndpoint}?page=${page}`);
    const { content, meta } = response.data;
    
    setEnquiries(content);
    setEnquiryPagination({
      currentPage: meta.currentPage,
      pageSize: meta.pageSize,
      totalItems: meta.totalItems,
      totalPages: meta.totalPages,
      hasNext: meta.hasNext,
      hasPrevious: meta.hasPrevious
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    toast.error(
      error.response?.data?.message || 
      "Failed to fetch enquiries. Please try again."
    );
  }
};

  const handleBlockDate = async (e) => {
  e.preventDefault();
  
  if (!newBlock.date || !newBlock.time) {
    toast.error("Date and Time are required");
    return;
  }

  try {
    const dateObj = new Date(newBlock.date);
    const formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}-${dateObj.getFullYear()}`;

    const payload = {
      date: formattedDate,
      time: newBlock.time,
      reason: newBlock.reason || "",
      type: "user"
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
  const enquiry = enquiries.find((e) => e.uniqueId === id); // Changed from e.id to e.uniqueId

  if (action === "approve") {
    setAgreementModal({
      isOpen: true,
      booking: {
        ...enquiry,
        id: enquiry.uniqueId, // Ensure the booking has an id property
        totalAmount: enquiry.totalAmount ? `$${enquiry.totalAmount}` : "$0",
        depositReceived: enquiry.depositReceived ? `$${enquiry.depositReceived}` : "$0",
        street: enquiry.address, // Map address to street for the agreement modal
        city: "", // Add these if available in your data
        state: "",
        apt: ""
      }
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

  const sendAgreement = async (payload) => {
    console.log("Sending agreement with payload:", payload);
    // Here you would typically call an API to generate and send the PDF
    // For now, we'll just log it and close the modal
    setAgreementModal({ isOpen: false, booking: null });
    // After sending, you might want to refresh the bookings list
    await fetchBookings();
  };

const handleSearch = async (e) => {
  e.preventDefault();
  
  try {
    let response;
    let requestData;
    
    if (searchMethod === "id") {
      // Search by ID only
      if (!searchId) {
        toast.error("Please enter a Unique ID");
        return;
      }
      
      requestData = { uniqueId: searchId };
    } else {
      // Search by email and booking ID
      if (!searchEmail || !searchBookingId) {
        toast.error("Please enter both Email and Unique ID");
        return;
      }
      
      requestData = {
        email: searchEmail,
        uniqueId: searchBookingId
      };
    }

    // Make POST request with the data in the body
    response = await api.post(config.viewAgreementEndpoint, requestData);

    if (response.data.status === "Fail") {
      toast.error(response.data.message || "No agreement found");
      setViewAgreement(false);
      setSearchResults(null);
    } else {
      setViewAgreement(true);
      setSearchResults(response.data);
      toast.success("Agreement details retrieved successfully");
    }
  } catch (error) {
    console.error("Error searching for agreement:", error);
    toast.error(
      error.response?.data?.message || 
      "Failed to retrieve agreement. Please try again."
    );
    setSearchResults(null);
  }
};


  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-8">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400 bg-[length:200%_200%] animate-gradient-flow">
          Admin
        </span>{" "}
        Dashboard
      </h1>

      <Tab.Group selectedIndex={selectedTab} onChange={(index) => dispatch(setSelectedTab(index))}>
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
    
    {/* Pagination Controls - Top */}
    <div className="flex justify-between items-center mb-4">
      <div className="text-sm text-gray-400">
        Showing page {bookingPagination.currentPage + 1} of{" "}
        {bookingPagination.totalPages}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => fetchBookings(bookingPagination.currentPage - 1)}
          disabled={!bookingPagination.hasPrevious}
          className={`px-3 py-1 rounded-lg ${
            bookingPagination.hasPrevious
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-700 cursor-not-allowed"
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => fetchBookings(bookingPagination.currentPage + 1)}
          disabled={!bookingPagination.hasNext}
          className={`px-3 py-1 rounded-lg ${
            bookingPagination.hasNext
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-700 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>

    <div className="overflow-x-auto">
      {isLoading ? (
        <TableLoader columns={14} rows={10} />
      ) : bookings.length === 0 ? (
        <div className="text-center py-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-200">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">There are currently no bookings in the system.</p>
        </div>
      ) : (<table className="min-w-full divide-y divide-gray-700">
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
              Deposit Received
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Total Amount Received
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Remaining Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            PayPal Transaction ID
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
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-4 py-3 whitespace-nowrap">
                {booking.uniqueId}
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
                {formatBookingDate(booking.eventDate)} at {booking.eventTime}
              </td>
              <td className="px-4 py-3 whitespace-normal">
                {booking.address}
              </td>
              <td className="px-4 py-3 whitespace-normal max-w-xs break-words">
                {booking.message}
              </td>
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
    setEditBookingModal({
      isOpen: true,
      bookingId: booking.uniqueId,
      fieldToEdit: "totalAmount",
      totalAmount: booking.totalAmount.replace(/\D/g, ""),
      status: booking.status
    })
  }
  className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-3 py-1 rounded-full text-xs"
>
  Edit
</button>
  </div>
</td>

              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300 mr-2">
                    {booking.totalAmountReceived}
                  </span>
                  <button
                    onClick={() =>
                      setEditBookingModal({
                        isOpen: true,
                        bookingId: booking.uniqueId,
                        fieldToEdit: "totalAmountReceived",
                        totalAmountReceived: booking.totalAmountReceived.replace(/\D/g, ""),
                        status: booking.status
                      })
                    }
                    className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-3 py-1 rounded-full text-xs"
                  >
                    Edit
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    parseInt(booking.remainingAmount.replace(/\D/g, "")) > 0
                      ? "bg-yellow-900 text-yellow-300"
                      : "bg-green-900 text-green-300"
                  }`}
                >
                  {booking.remainingAmount}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
              {booking.paypalTransactionId || "-"}
            </td>
              <td className="px-4 py-3 whitespace-nowrap">
  <div className="flex items-center">
    <span className={`px-2 py-1 text-xs rounded-full ${
      booking.status === "CONFIRMED"
        ? "bg-green-900 text-green-300"
        : booking.status === "PENDING"
        ? "bg-yellow-900 text-yellow-300"
        : booking.status === "CANCELLED" || booking.status === "NO_SHOW"
        ? "bg-red-900 text-red-300"
        : booking.status === "COMPLETED"
        ? "bg-blue-900 text-blue-300"
        : "bg-purple-900 text-purple-300"
    }`}>
      {booking.status.replace("_", " ")}
    </span>
    <button
  onClick={() =>
    setEditBookingModal({
      isOpen: true,
      bookingId: booking.uniqueId,
      fieldToEdit: "status",
      status: booking.status,
      totalAmount: booking.totalAmount.replace(/\D/g, "")
    })
  }
  className="ml-2 text-purple-400 hover:text-purple-300"
  title="Edit Status"
>
  <PencilIcon className="h-4 w-4" />
</button>
  </div>
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
      </table>)}
    </div>

    {/* Pagination Controls - Bottom */}
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-gray-400">
        Showing {bookings.length} of {bookingPagination.totalItems} bookings
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => fetchBookings(bookingPagination.currentPage - 1)}
          disabled={!bookingPagination.hasPrevious}
          className={`px-3 py-1 rounded-lg ${
            bookingPagination.hasPrevious
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-700 cursor-not-allowed"
          }`}
        >
          Previous
        </button>
        <div className="flex space-x-1">
          {Array.from(
            { length: Math.min(5, bookingPagination.totalPages) },
            (_, i) => {
              let pageNum;
              if (bookingPagination.totalPages <= 5) {
                pageNum = i;
              } else if (bookingPagination.currentPage <= 2) {
                pageNum = i;
              } else if (
                bookingPagination.currentPage >=
                bookingPagination.totalPages - 3
              ) {
                pageNum = bookingPagination.totalPages - 5 + i;
              } else {
                pageNum = bookingPagination.currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => fetchBookings(pageNum)}
                  className={`px-3 py-1 rounded-lg ${
                    bookingPagination.currentPage === pageNum
                      ? "bg-purple-800"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            }
          )}
        </div>
        <button
          onClick={() => fetchBookings(bookingPagination.currentPage + 1)}
          disabled={!bookingPagination.hasNext}
          className={`px-3 py-1 rounded-lg ${
            bookingPagination.hasNext
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-700 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  </div>
</Tab.Panel>

          {/* Enquiries Tab */}
          <Tab.Panel>
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Pending Enquiries</h2>

              {/* Pagination Controls - Top */}
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400">
                  Showing page {enquiryPagination.currentPage + 1} of{" "}
                  {enquiryPagination.totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      fetchEnquiries(enquiryPagination.currentPage - 1)
                    }
                    disabled={!enquiryPagination.hasPrevious}
                    className={`px-3 py-1 rounded-lg ${
                      enquiryPagination.hasPrevious
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-700 cursor-not-allowed"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      fetchEnquiries(enquiryPagination.currentPage + 1)
                    }
                    disabled={!enquiryPagination.hasNext}
                    className={`px-3 py-1 rounded-lg ${
                      enquiryPagination.hasNext
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-700 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
      {isLoading ? (
        <TableLoader columns={14} rows={10} />
      ) : enquiries.length === 0 ? (
        <div className="text-center py-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-200">No enquiries found</h3>
          <p className="mt-1 text-sm text-gray-500">There are currently no pending enquiries.</p>
        </div>
      ) : (
                <table className="min-w-full divide-y divide-gray-700">
  <thead>
    <tr>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
        Enquiry ID
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
        Total Amount
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
        Ask for Deposit
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
        Total Amount Received
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
      <tr key={enquiry.uniqueId}>
        {/* Basic Info Columns */}
        <td className="px-4 py-3 whitespace-nowrap">
          {enquiry.uniqueId}
        </td>
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
          {formatBookingDate(enquiry.eventDate)} at {enquiry.eventTime}
        </td>
        <td className="px-4 py-3 whitespace-normal">
          {enquiry.address}
        </td>
        <td className="px-4 py-3 whitespace-normal max-w-xs break-words">
          {enquiry.message || "-"}
        </td>

        {/* Total Amount Column with Edit */}
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300 mr-2">
              ${enquiry.totalAmount}
            </span>
            <button
              onClick={() =>
                setEditAmountModal({
                  isOpen: true,
                  bookingId: enquiry.uniqueId,
                  fieldToEdit: "total",
                  depositReceived: enquiry.depositReceived,
                  totalAmount: enquiry.totalAmount,
                })
              }
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-3 py-1 rounded-full text-xs"
            >
              Edit
            </button>
          </div>
        </td>

        {/* Deposit Column with Edit */}
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300 mr-2">
              ${enquiry.depositReceived}
            </span>
            <button
              onClick={() =>
                setEditAmountModal({
                  isOpen: true,
                  bookingId: enquiry.uniqueId,
                  fieldToEdit: "deposit",
                  depositReceived: enquiry.depositReceived,
                  totalAmount: enquiry.totalAmount,
                })
              }
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-3 py-1 rounded-full text-xs"
            >
              Edit
            </button>
          </div>
        </td>

        <td className="px-4 py-3 whitespace-nowrap">
  <div className="flex items-center">
    <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300 mr-2">
      ${enquiry.totalAmountReceived || "0"}
    </span>
    <button
      onClick={() =>
        setEditAmountModal({
          isOpen: true,
          bookingId: enquiry.uniqueId,
          fieldToEdit: "totalAmountReceived",
          totalAmountReceived: enquiry.totalAmountReceived || "0",
          totalAmount: enquiry.totalAmount || "0",
          depositReceived: enquiry.depositReceived || "0"
        })
      }
      className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-3 py-1 rounded-full text-xs"
    >
      Edit
    </button>
  </div>
</td>

        {/* Remaining Amount (Read-only) */}
        <td className="px-4 py-3 whitespace-nowrap">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              enquiry.remainingAmount > 0
                ? "bg-yellow-900 text-yellow-300"
                : "bg-green-900 text-green-300"
            }`}
          >
            ${enquiry.remainingAmount}
          </span>
        </td>

        {/* Status Display */}
        <td className="px-4 py-3 whitespace-nowrap">
  <span
    className={`px-2 py-1 text-xs rounded-full ${
      enquiry.status === "FINALIZED"
        ? "bg-green-900 text-green-300"
        : enquiry.status === "ON_HOLD"
        ? "bg-yellow-900 text-yellow-300"
        : enquiry.status === "IN_PROGRESS" || enquiry.status === "PENDING_DEPOSIT"
        ? "bg-blue-900 text-blue-300"
        : "bg-gray-700 text-gray-300" // OPENED
    }`}
  >
    {enquiry.status.replace("_", " ")}
  </span>
</td>

        {/* Actions Column */}
        <td className="px-4 py-3 whitespace-nowrap space-x-2">
          <button
            onClick={() =>
              handleEnquiryAction(enquiry.uniqueId, "approve")
            }
            className="text-green-400 hover:text-green-300"
            title="Approve"
            disabled={enquiry.status === "APPROVED"}
          >
            <CheckCircleIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() =>
              handleEnquiryAction(enquiry.uniqueId, "deny")
            }
            className="text-red-400 hover:text-red-300"
            title="Deny"
            disabled={enquiry.status === "REJECTED"}
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() =>
              setEditAmountModal({
                isOpen: true,
                bookingId: enquiry.uniqueId,
                fieldToEdit: "status",
                status: enquiry.status,
              })
            }
            className="text-purple-400 hover:text-purple-300"
            title="Edit Status"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
                </table>)}
              </div>

              {/* Pagination Controls - Bottom */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                  Showing {enquiries.length} of {enquiryPagination.totalItems}{" "}
                  enquiries
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      fetchEnquiries(enquiryPagination.currentPage - 1)
                    }
                    disabled={!enquiryPagination.hasPrevious}
                    className={`px-3 py-1 rounded-lg ${
                      enquiryPagination.hasPrevious
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-700 cursor-not-allowed"
                    }`}
                  >
                    Previous
                  </button>
                  <div className="flex space-x-1">
                    {Array.from(
                      { length: Math.min(5, enquiryPagination.totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (enquiryPagination.totalPages <= 5) {
                          pageNum = i;
                        } else if (enquiryPagination.currentPage <= 2) {
                          pageNum = i;
                        } else if (
                          enquiryPagination.currentPage >=
                          enquiryPagination.totalPages - 3
                        ) {
                          pageNum = enquiryPagination.totalPages - 5 + i;
                        } else {
                          pageNum = enquiryPagination.currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => fetchEnquiries(pageNum)}
                            className={`px-3 py-1 rounded-lg ${
                              enquiryPagination.currentPage === pageNum
                                ? "bg-purple-800"
                                : "bg-purple-600 hover:bg-purple-700"
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      }
                    )}
                  </div>
                  <button
                    onClick={() =>
                      fetchEnquiries(enquiryPagination.currentPage + 1)
                    }
                    disabled={!enquiryPagination.hasNext}
                    className={`px-3 py-1 rounded-lg ${
                      enquiryPagination.hasNext
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-700 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </Tab.Panel>

          {/* Block Dates Tab */}
<Tab.Panel>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Block Schedule Form (left side) */}
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
            onClick={(e) => e.target.showPicker()}
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
            <option value="8:00 AM">08:00 AM</option>
            <option value="9:00 AM">09:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="12:00 PM">12:00 PM</option>
            <option value="1:00 PM">01:00 PM</option>
            <option value="2:00 PM">02:00 PM</option>
            <option value="3:00 PM">03:00 PM</option>
            <option value="4:00 PM">04:00 PM</option>
            <option value="5:00 PM">05:00 PM</option>
            <option value="6:00 PM">06:00 PM</option>
            <option value="7:00 PM">07:00 PM</option>
            <option value="8:00 PM">08:00 PM</option>
            <option value="9:00 PM">09:00 PM</option>
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

    {/* Blocked Schedule List (right side) */}
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2 text-purple-400" />
        Blocked Schedule
      </h2>
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="w-full overflow-x-auto">
            <div className="animate-pulse space-y-4 min-w-max">
              {/* Header row */}
              <div className="flex gap-4">
                <div className="h-5 bg-gradient-to-r from-purple-900 to-purple-800 rounded w-32"></div>
                <div className="h-5 bg-gradient-to-r from-purple-900 to-purple-800 rounded w-24"></div>
                <div className="h-5 bg-gradient-to-r from-purple-900 to-purple-800 rounded w-48"></div>
                <div className="h-5 bg-gradient-to-r from-purple-900 to-purple-800 rounded w-24"></div>
                <div className="h-5 bg-gradient-to-r from-purple-900 to-purple-800 rounded w-20"></div>
              </div>

              {/* Data rows */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`h-4 rounded w-32 ${i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}`}></div>
                  <div className={`h-4 rounded w-24 ${i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}`}></div>
                  <div className={`h-4 rounded w-48 ${i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}`}></div>
                  <div className={`h-4 rounded w-24 ${i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}`}></div>
                  <div className={`h-4 rounded w-20 ${i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}`}></div>
                </div>
              ))}
            </div>
          </div>
        ) : blockedDates.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            No blocked dates found
          </p>
        ) : (
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
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        block.type === "SYSTEM"
                          ? "bg-blue-900 text-blue-300"
                          : "bg-purple-900 text-purple-300"
                      }`}
                    >
                      {block.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => confirmDeleteBlockedDate(block.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
                      onClick={() => setSearchMethod("email")}
                      className={`px-4 py-2 rounded-lg ${
                        searchMethod === "email"
                          ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      Email & Unique ID
                    </button>
                    <button
                      onClick={() => setSearchMethod("id")}
                      className={`px-4 py-2 rounded-lg ${
                        searchMethod === "id"
                          ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      Unique ID
                    </button>
                  </div>

                  <form onSubmit={handleSearch} className="space-y-6">
                    {searchMethod === "id" ? (
                      <div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Unique ID *
                          </label>
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
                            <label className="block text-sm font-medium mb-1">
                              Email Address *
                            </label>
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
                            <label className="block text-sm font-medium mb-1">
                              Unique ID *
                            </label>
                            <input
                              type="text"
                              value={searchBookingId}
                              onChange={(e) =>
                                setSearchBookingId(e.target.value)
                              }
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
              {viewAgreement && (
  <div className="bg-gray-900 rounded-lg p-6">
    <h3 className="mt-5 text-lg font-bold mb-4">
      Agreement Details
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <p className="text-sm text-gray-400">Reference ID</p>
        <p className="font-medium">{searchResults.uniqueId}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">Client Name</p>
        <p className="font-medium">{searchResults.clientName}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">Email</p>
        <p className="font-medium">{searchResults.clientEmail}</p>
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
        <p className="text-sm text-gray-400">Event Date & Time</p>
        <p className="font-medium">{searchResults.eventDateTime}</p>
      </div>
      <div className="md:col-span-2">
        <p className="text-sm text-gray-400">Address</p>
        <p className="font-medium">{searchResults.address}</p>
      </div>
    </div>

    <div className="flex justify-center">
      {searchResults.agreementUrl ? (
        <a
          href={searchResults.agreementUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          View PDF Agreement
        </a>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <DocumentTextIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-300">No agreement document</p>
          <p className="text-sm text-gray-400 mt-1">
            The agreement will reflect once it is generated and sent to the client.
          </p>
        </div>
      )}
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
{/* Denial Meeting Schedule Dialog */}
{denyDialog.isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-bold mb-4">
        Schedule Discussion for Enquiry
      </h3>

      <div className="mb-4 p-4 bg-gray-700 rounded-lg">
        <h4 className="font-medium mb-2">Client Details:</h4>
        <p>Name: {denyDialog.enquiry.clientName}</p>
        <p>Email: {denyDialog.enquiry.email}</p>
        <p>Phone: {denyDialog.enquiry.phone}</p>
      </div>

      <form onSubmit={async (e) => {
        e.preventDefault();
        try {
          const payload = {
            enquiryId: denyDialog.enquiry.uniqueId,
            clientEmail: denyDialog.enquiry.email,
            proposedDate: denyDialog.date,
            proposedTime: denyDialog.time,
            message: denyDialog.message
          };

          // The token will be automatically included via axios interceptors
          const response = await api.post(config.sendDenialEmailEndpoint, payload);
          
          if (response.data.status === "Success") {
            toast.success(response.data.message || "Discussion request sent successfully");
            await fetchEnquiries(); // Refresh the enquiries list
          } else {
            toast.error(response.data.message || "Failed to send discussion request");
          }

          setDenyDialog({
            isOpen: false,
            enquiry: null,
            date: "",
            time: "",
            message: "",
          });
        } catch (error) {
          console.error("Error sending discussion request:", error);
          toast.error(error.response?.data?.message || "Failed to send discussion request");
        }
      }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Proposed Date *</label>
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
          <label className="block text-sm font-medium mb-1">Proposed Time *</label>
          <input
            type="text"
            value={denyDialog.time}
            onChange={(e) =>
              setDenyDialog({ ...denyDialog, time: e.target.value })
            }
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            required
            placeholder="Example: 10:00 AM"
          />
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
            placeholder="Example: We'd like to discuss your requirements in more detail as we believe there might be better solutions available for your needs."
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
            Send Discussion Request
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
        {editAmountModal.fieldToEdit === "deposit" && "Edit Ask for Deposit"}
        {editAmountModal.fieldToEdit === "total" && "Edit Enquiry Total Amount"}
        {editAmountModal.fieldToEdit === "status" && "Update Enquiry Status"}
        {editAmountModal.fieldToEdit === "totalAmountReceived" && "Edit Total Amount Received"}
      </h3>
      <form onSubmit={handleUpdateAmount} className="space-y-4">
        {editAmountModal.fieldToEdit === "deposit" && (
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
        )}

        {editAmountModal.fieldToEdit === "total" && (
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

{editAmountModal.fieldToEdit === "status" && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Status
    </label>
    <select
      value={editAmountModal.status}
      onChange={(e) =>
        setEditAmountModal({
          ...editAmountModal,
          status: e.target.value,
        })
      }
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
      required
    >
      <option value="">Select status</option>
      <option value="OPENED">Opened</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="PENDING_DEPOSIT">Pending Deposit</option>
      <option value="ON_HOLD">On Hold</option>
      <option value="FINALIZED">Finalized</option>
    </select>
    
    {/* Add this warning message */}
    {editAmountModal.status === "FINALIZED" && (
      <div className="mt-2 p-2 bg-yellow-900 text-yellow-100 rounded text-sm">
        Warning: A feedback request email will be sent to the client. Review carefully before confirming.
      </div>
    )}
    {editAmountModal.status === "PENDING_DEPOSIT" && (
      <div className="mt-2 p-2 bg-purple-900 text-white-100 rounded text-sm">
        Info: Update status to "Pending Deposit" when awaiting client deposit payment.
      </div>
    )}
    {editAmountModal.status === "IN_PROGRESS" && (
      <div className="mt-2 p-2 bg-purple-900 text-white-100 rounded text-sm">
        Info: Update status to "In Progress" when the booking is actively being worked on. Generally after deposit is received.
      </div>
    )}
    {editAmountModal.status === "ON_HOLD" && (
      <div className="mt-2 p-2 bg-purple-900 text-white-100 rounded text-sm">
        Info: Update status to "On Hold" if the booking is temporarily paused or awaiting further information.
      </div>
    )}
  </div>
)}


{editAmountModal.fieldToEdit === "totalAmountReceived" && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Total Amount Received ($)
    </label>
    <input
      type="number"
      value={editAmountModal.totalAmountReceived}
      onChange={(e) =>
        setEditAmountModal({
          ...editAmountModal,
          totalAmountReceived: e.target.value,
        })
      }
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
      required
    />
  </div>
)}


        {/* {(editAmountModal.fieldToEdit === "deposit" || 
          editAmountModal.fieldToEdit === "total") && (
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
        )} */}

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
                status: ""
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

{/* Booking Update Modal */}
{editBookingModal.isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-bold mb-4">
        {editBookingModal.fieldToEdit === "totalAmount" && "Edit Booking Total Amount"}
        {editBookingModal.fieldToEdit === "status" && "Update Booking Status"}
        {editBookingModal.fieldToEdit === "totalAmountReceived" && "Update Total Amount Received"}
      </h3>
      <form onSubmit={handleUpdateBooking} className="space-y-4">
        {editBookingModal.fieldToEdit === "totalAmount" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Amount ($)
            </label>
            <input
              type="number"
              value={editBookingModal.totalAmount}
              onChange={(e) =>
                setEditBookingModal({
                  ...editBookingModal,
                  totalAmount: e.target.value,
                })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              required
            />
          </div>
        )}

        {editBookingModal.fieldToEdit === "totalAmountReceived" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Amount Received ($)
            </label>
            <input
              type="number"
              value={editBookingModal.totalAmountReceived}
              onChange={(e) =>
                setEditBookingModal({
                  ...editBookingModal,
                  totalAmountReceived: e.target.value,
                })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              required
            />
          </div>
        )}

        {editBookingModal.fieldToEdit === "status" && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Status
    </label>
    <select
      value={editBookingModal.status}
      onChange={(e) =>
        setEditBookingModal({
          ...editBookingModal,
          status: e.target.value,
        })
      }
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
      required
    >
      <option value="PENDING">PENDING</option>
      <option value="CONFIRMED">CONFIRMED</option>
      <option value="CANCELLED">CANCELLED</option>
      <option value="COMPLETED">COMPLETED</option>
      <option value="NO_SHOW">NO SHOW</option>
      <option value="REFUNDED">REFUNDED</option>
    </select>
    
    {/* Add this warning message */}
    {editBookingModal.status === "COMPLETED" && (
      <div className="mt-2 p-2 bg-yellow-900 text-yellow-100 rounded text-sm">
        Warning: A feedback request email will be sent to the client. Review carefully before confirming.
      </div>
    )}

    {editBookingModal.status === "CANCELLED" && (
      <div className="mt-2 p-2 bg-red-900 text-white-100 rounded text-sm">
        Warning: A email will be sent to the client. Review carefully before confirming.
      </div>
    )}

    {editBookingModal.status === "CONFIRMED" && (
      <div className="mt-2 p-2 bg-green-900 text-white-100 rounded text-sm">
        Warning: A confirmation email will be sent to the client. Review carefully before confirming.
      </div>
    )}
    {editBookingModal.status === "NO_SHOW" && (
      <div className="mt-2 p-2 bg-purple-900 text-white-100 rounded text-sm">
        Info: No email will be sent to the client. This is for record-keeping purposes only.
      </div>
    )}
    {editBookingModal.status === "REFUNDED" && (
      <div className="mt-2 p-2 bg-purple-900 text-white-100 rounded text-sm">
        Info: No email will be sent to the client. This is for record-keeping purposes only.
      </div>
    )}

  </div>
)}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() =>
              setEditBookingModal({
                isOpen: false,
                bookingId: null,
                fieldToEdit: null,
                totalAmount: "",
                status: ""
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
