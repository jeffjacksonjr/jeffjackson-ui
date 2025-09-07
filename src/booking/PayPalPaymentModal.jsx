// PayPalPaymentModal.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import QrCode from "../images/PaymentQRCode.jpeg";

export default function PayPalPaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  onPaymentSubmit,
  isSubmitting = false
}) {
  const [transactionId, setTransactionId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!transactionId || transactionId.length !== 17) {
      toast.error('Please enter a valid 17-character transaction ID');
      return;
    }

    onPaymentSubmit(transactionId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">Pay with PayPal</h2>
        
        <div className="mb-4 text-center">
          <p className="mb-2 text-lg font-semibold">Please scan the QR code and pay <strong>${amount}</strong></p>
          <img 
            src={QrCode}
            alt="PayPal QR Code" 
            className="w-64 h-64 mx-auto mb-4 border-2 border-purple-500 rounded-lg"
          />
          <p className="text-sm text-gray-400 mb-4">
            After completing your payment, please enter the 17-character transaction ID below
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Transaction ID (17 characters)</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value.slice(0, 17))}
              placeholder="Enter 17-character transaction ID"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              required
              maxLength={17}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-2 rounded-lg disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Submit Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}