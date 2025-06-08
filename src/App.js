import { Route, Routes } from 'react-router-dom';
import Navbar from "./navbar/Navbar";
import Footer from "./section/Footer";
import Home from './home/Home';
import BookingWizard from './booking/BookingWizard'

function App() {
  return (
    <>
    <Navbar/>
    <Routes>
      <Route path= "*" element={<Home/>}/>
      <Route path= "/" element={<Home/>}/>
      <Route path="/book-now" element={<BookingWizard/>} />
    </Routes>
    <Footer/>
    </>
  );
}

export default App;
