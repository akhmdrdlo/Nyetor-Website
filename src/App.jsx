import { useState, useRef } from 'react';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import BookingForm from './components/BookingForm';
import Invoice from './components/Invoice';
import './index.css';

// Lib
// Note: html2pdf is loaded in global scope if installed via script tag, but via npm we import it?
// Usually html2pdf.js via npm doesn't have good ESM support.
// We might need to use the window.html2pdf if imported, or require.
// Let's try simple import. If fails, we fallback to specific import.
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

  const handleBookingSubmit = async (data) => {
    // 1. Prepare Invoice Data
    const invData = {
      ...data, // name, phone, duration, helmet, total
      bike: selectedBike,
      date: `Bandung, ${new Date().toLocaleDateString('id-ID')}`,
      orderNo: `INV-${Date.now().toString().slice(-6)}`
    };
    setInvoiceData(invData);

    // 2. Wait for render (Next Tick)
    setTimeout(() => {
      if (invoiceRef.current) {
        const opt = {
          margin: 0,
          filename: `Invoice_Nyetor_${data.name.replace(/\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(invoiceRef.current).set(opt).save().then(() => {
          setView('success');
          // Mock hidden submission
          console.log("Submitting to hidden iframe/API... (Pending IDs)");
        });
      }
    }, 500);
  };

  return (
    <div className="min-h-screen pb-20">

      {/* Hero Section */}
      {view === 'hero' && <Hero onStart={handleStart} />}

      {/* Catalog Section */}
      {(view === 'hero' || view === 'catalog') && (
        <div id="catalog-section" className={view === 'hero' ? 'hidden' : 'block'}>
          <div className="container">
            <Catalog onSelectBike={handleSelectBike} />
          </div>
        </div>
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

      {/* Success View */}
      {view === 'success' && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-4xl font-bold text-[#00f3ff] mb-4">Booking Berhasil!</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            Invoice anda telah didownload otomatis. <br />
            Silahkan klik tombol di bawah untuk melengkapi data jaminan dan kontak darurat.
          </p>

          <a
            href={invoiceData?.googleFormUrl}
            target="_blank"
            rel="noreferrer"
            className="btn py-4 px-8 text-lg mb-4 w-full max-w-xs animate-pulse"
          >
            LENGKAPI DATA (UPLOAD KTP)
          </a>

          <a
            href={`https://wa.me/6287818747396?text=Halo%20Admin,%20saya%20sudah%20download%20invoice%20atas%20nama%20${invoiceData?.name}.%20Mohon%20dibantu.`}
            target="_blank"
            className="text-gray-500 hover:text-white mb-8 text-sm underline"
            rel="noreferrer"
          >
            Konfirmasi Manual via WhatsApp
          </a>

          <button onClick={() => window.location.reload()} className="text-gray-600 hover:text-gray-400 text-xs">
            Kembali ke Beranda
          </button>
        </div>
      )}

      {/* Hidden Invoice Container */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <Invoice ref={invoiceRef} data={invoiceData} />
      </div>

    </div>
  );
}

export default App;
