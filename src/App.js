import { Route, Routes } from 'react-router-dom';
import Navbar from "./navbar/Navbar";
import Footer from "./section/Footer";
import Home from './home/Home';
import BookingWizard from './booking/BookingWizard'
import LoginPage from './login/LoginPage'
import AdminDashboard from './login/AdminDashboard';
import PaymentLookup from './payment/PaymentLookup';
import ScrollToTop from './utils/ScrollToTop';

function App() {
  return (
    <>
    <Navbar/>
    <ScrollToTop/>
    <Routes>
      <Route path= "*" element={<Home/>}/>
      <Route path= "/" element={<Home/>}/>
      <Route path="/book-now" element={<BookingWizard/>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<AdminDashboard/>} />
      <Route path="/payment" element={<PaymentLookup/>} />
    </Routes>
    <Footer/>
    </>
  );
}

export default App;
