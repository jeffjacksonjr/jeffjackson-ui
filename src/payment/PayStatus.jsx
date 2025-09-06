import { useLocation, useNavigate } from 'react-router-dom';

export default function PayStatus() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate('/payment');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-xl mx-auto bg-gray-900 rounded-lg p-8 text-center">
        {state.success ? (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <div className="bg-gray-800 p-4 rounded-lg mb-4 text-left">
              <p><span className="text-purple-400">Type:</span> {state.type === 'booking' ? 'Booking' : 'Enquiry'}</p>
              <p><span className="text-purple-400">ID:</span> {state.id}</p>
              <p><span className="text-purple-400">Amount:</span> ${state.amount}</p>
              <p><span className="text-purple-400">Status:</span> Confirmed</p>
            </div>
            <p className="text-gray-400 mb-6">
              A confirmation has been sent to your email. For any questions, please contact us.
            </p>
          </>
        ) : (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="mb-6 text-gray-300">{state.message || 'Please try again later.'}</p>
          </>
        )}
        
        <button
          onClick={() => navigate('/payment')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Back to Payment Portal
        </button>
      </div>
    </div>
  );
}