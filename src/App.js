import { Route, Routes } from 'react-router-dom';
import Navbar from "./navbar/Navbar";
import Footer from "./section/Footer";
import Home from './home/Home';
import BookingWizard from './booking/BookingWizard'
import LoginPage from './login/LoginPage'
import AdminDashboard from './login/AdminDashboard';
import PaymentLookup from './payment/PaymentLookup';
import ScrollToTop from './utils/ScrollToTop';
import { useEffect } from 'react';
import axios from 'axios';
import { getConfig } from './config/activeConfig';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { setChecking, setConnected, setDisconnected } from './redux/systemStatusSlice';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './redux/ProtectedRoute';
import Confirmation from './booking/Confirmation';
import AgreementUpload from './uploadAgreement/AgreementUpload';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        dispatch(setChecking());
        const config = getConfig();
        const healthPromise = axios.get(config.healthCheck);
        
        // toast.promise(healthPromise, {
        //   loading: 'Checking server status...',
        //   success: 'Server is connected!',
        //   error: 'Failed to connect to server',
        // });

        const res = await healthPromise;
        if(res.status === 200) {
          dispatch(setConnected());
        }
      } catch (error) {
        console.error("Health check failed:", error);
        dispatch(setDisconnected());
      }
    };

    checkHealth();
    // Check every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <>
      <Navbar/>
      <ScrollToTop/>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path= "*" element={<Home/>}/>
        <Route path= "/" element={<Home/>}/>
        <Route path="/book-now" element={<BookingWizard/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/upload" element={<AgreementUpload />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard/>
            </ProtectedRoute>
          } 
        />
        <Route path="/payment" element={<PaymentLookup/>} />
      </Routes>
      <Footer/>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;