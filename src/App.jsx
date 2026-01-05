import { useState, useRef } from 'react';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import BookingForm from './components/BookingForm';
import Invoice from './components/Invoice';
import BookingSuccess from './components/BookingSuccess';
import About from './components/About';
import Services from './components/Services';
import TermsFAQ from './components/TermsFAQ';
import Location from './components/Location';
import Footer from './components/Footer';
import './index.css';

// Lib
import html2pdf from 'html2pdf.js';

function App() {
  const [view, setView] = useState('hero'); // hero, catalog, booking, success
  const [selectedBike, setSelectedBike] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef();

  const handleStart = () => {
    setView('catalog');
    setTimeout(() => {
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectBike = (bike) => {
    setSelectedBike(bike);
    setView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadInvoice = (data) => {
    if (invoiceRef.current && data) {
      const opt = {
        margin: 0,
        filename: `Invoice_Nyetor_${data.name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      return html2pdf().from(invoiceRef.current).set(opt).save();
    }
    return Promise.resolve();
  };

  const handleBookingSubmit = async (data) => {
    // 1. Prepare Invoice Data
    const invData = {
      ...data, // name, phone, duration, helmet, total
      bike: selectedBike,
      date: `Bandung, ${new Date().toLocaleDateString('id-ID')}`,
      orderNo: `INV-${Date.now().toString().slice(-6)}`
    };
    setInvoiceData(invData);

    // 2. Wait for render (Next Tick) -> DIRECT TO SUCCESS (No Auto Download)
    setTimeout(() => {
      // 3. Move to Success View
      setView('success');
      // Mock hidden submission
      console.log("Submitting to hidden iframe/API... (Pending IDs)");
    }, 500);
  };

  return (
    <div className="min-h-screen pb-20">

      {/* LANDING PAGE CONTENT (Hero + Catalog + Sections) */}
      {(view === 'hero' || view === 'catalog') && (
        <>
          <Hero onStart={handleStart} />

          <About />

          <Services />

          <TermsFAQ />

          <div id="catalog-section" className="block relative z-10">
            {/* Spacer to pull overlap if needed, or just container */}
            <div className="container">
              <Catalog onSelectBike={handleSelectBike} />
            </div>
          </div>

          <Location />

          <Footer />
        </>
      )}

      {/* Booking Form Overlay */}
      {view === 'booking' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <BookingForm
            selectedBike={selectedBike}
            onCancel={() => setView('catalog')}
            onSubmit={handleBookingSubmit}
          />
        </div>
      )}

      {/* Success View (New Redesigned Page) */}
      {view === 'success' && (
        <BookingSuccess
          invoiceData={invoiceData}
          googleFormUrl={invoiceData?.googleFormUrl}
          onDownloadInvoice={() => downloadInvoice(invoiceData)}
        />
      )}

      {/* Hidden Invoice Container */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <Invoice ref={invoiceRef} data={invoiceData} />
      </div>

    </div>
  );
}

export default App;
