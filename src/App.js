import { Route, Routes } from 'react-router-dom';
import Navbar from "./navbar/Navbar";
import Footer from "./section/Footer";
import Home from './home/Home';
import BookingWizard from './booking/BookingWizard'
import LoginPage from './login/LoginPage'
import AdminDashboard from './login/AdminDashboard';

function App() {
  return (
    <>
    <Navbar/>
    <Routes>
      <Route path= "*" element={<Home/>}/>
      <Route path= "/" element={<Home/>}/>
      <Route path="/book-now" element={<BookingWizard/>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<AdminDashboard/>} />
    </Routes>
    <Footer/>
    </>
  );
}

export default App;
