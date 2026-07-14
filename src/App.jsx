import { useState, useRef, useEffect } from 'react';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import BookingForm from './components/BookingForm';
import Invoice from './components/Invoice';
import BookingSuccess from './components/BookingSuccess';
import About from './components/About';
import Services from './components/Services';
import TermsFAQ from './components/TermsFAQ';
import CoverageArea from './components/CoverageArea';
import Location from './components/Location';
import Footer from './components/Footer';
import InstagramBadge from './components/InstagramBadge';
import PromoManager from './components/PromoManager';
import AdminPanel from './components/AdminPanel';
import './index.css';

// Lib
import html2pdf from 'html2pdf.js';
import { supabase } from './supabaseClient';

function App() {
  const [view, setView] = useState('hero'); // hero, catalog, booking, success, invoice_viewer
  const [selectedBike, setSelectedBike] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [customCatalog, setCustomCatalog] = useState(null);
  const [shippingZones, setShippingZones] = useState([]);
  const [luarKotaData, setLuarKotaData] = useState([]);
  const [fleet, setFleet] = useState([]);
  const invoiceRef = useRef();

  // Load custom pricing, shipping zones, out-of-town, and fleet data from Supabase dynamically
  useEffect(() => {
    if (!supabase) return;

    const fetchPricing = async () => {
      try {
        const { data, error } = await supabase.from('nyetor_pricing').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          const newCatalog = {
            unit_bebek: [],
            super_ekonomis: [],
            ekonomis: [],
            silver: [],
            gold: [],
            accessories: [],
            warlok: [],
            unit_tambahan: [],
            seasonal: []
          };
          data.forEach(row => {
            const category = row.category;
            if (newCatalog[category]) {
              newCatalog[category].push({
                id: row.id,
                name: row.name,
                image: row.image,
                prices: row.prices,
                features: row.features || [],
                isAdditional: row.is_additional || false
              });
            }
          });
          setCustomCatalog(newCatalog);
        }
      } catch (e) {
        console.error("Failed to fetch custom pricing from Supabase:", e);
      }
    };

    const fetchShippingAndLuarKota = async () => {
      try {
        // Fetch Shipping Zones
        const { data: szData, error: szErr } = await supabase
          .from('nyetor_shipping_zones')
          .select('*')
          .order('display_order', { ascending: true });
        if (!szErr && szData) {
          setShippingZones(szData);
        }

        // Fetch Luar Kota
        const { data: lkData, error: lkErr } = await supabase
          .from('nyetor_luar_kota')
          .select('*')
          .order('display_order', { ascending: true });
        if (!lkErr && lkData) {
          setLuarKotaData(lkData);
        }
      } catch (e) {
        console.error("Failed to fetch shipping/luar kota data:", e);
      }
    };

    const fetchFleet = async () => {
      try {
        const { data, error } = await supabase.from('nyetor_fleet').select('*');
        if (!error && data) {
          setFleet(data);
        }
      } catch (e) {
        console.error("Failed to fetch fleet from Supabase:", e);
      }
    };

    fetchPricing();
    fetchShippingAndLuarKota();
    fetchFleet();

    // Subscribe to realtime updates
    const pricingChannel = supabase
      .channel('pricing-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nyetor_pricing' }, fetchPricing)
      .subscribe();

    const shippingChannel = supabase
      .channel('shipping-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nyetor_shipping_zones' }, fetchShippingAndLuarKota)
      .subscribe();

    const luarKotaChannel = supabase
      .channel('luarkota-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nyetor_luar_kota' }, fetchShippingAndLuarKota)
      .subscribe();

    const fleetChannel = supabase
      .channel('fleet-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nyetor_fleet' }, fetchFleet)
      .subscribe();

    return () => {
      supabase.removeChannel(pricingChannel);
      supabase.removeChannel(shippingChannel);
      supabase.removeChannel(luarKotaChannel);
      supabase.removeChannel(fleetChannel);
    };
  }, []);

  // URL Parser for Persistence
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedInvoice = params.get('invoice_data');
    if (encodedInvoice) {
      try {
        const decoded = JSON.parse(atob(encodedInvoice));
        setInvoiceData(decoded);
        setView('success'); // Re-hydrate Success View
      } catch (e) {
        console.error("Failed to parse invoice data from URL", e);
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

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
    // If not ref (e.g. viewer mode might use a different ref strategy, but here we reuse the hidden one if possible or a visible one)
    // Actually for 'invoice_viewer' we show the invoice visibly, so we can target THAT ref if we want, or just reuse the hidden one logic if data is set.
    // Let's reuse the hidden one since 'invoiceData' is set.
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

    // Generate Shareable Link
    const shareLink = `${window.location.origin}?invoice_data=${btoa(JSON.stringify(invData))}`;
    const dataWithLink = { ...invData, shareLink };

    setInvoiceData(dataWithLink);

    // 2. Wait for render (Next Tick) -> AUTO DOWNLOAD + REDIRECT
    setTimeout(() => {
      // 3. Move to Success View
      setView('success');
      // 4. Trigger Auto Download
      downloadInvoice(dataWithLink);
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
              <Catalog onSelectBike={handleSelectBike} customCatalog={customCatalog} fleet={fleet} />
            </div>
          </div>

          <CoverageArea shippingZones={shippingZones} luarKotaData={luarKotaData} />

          <Location />

          <Footer onAdminClick={() => setView('admin')} />
        </>
      )}

      {/* Admin Panel Overlay */}
      {view === 'admin' && (
        <AdminPanel onClose={() => setView('catalog')} />
      )}

      {/* Booking Form Overlay */}
      {view === 'booking' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <BookingForm
            selectedBike={selectedBike}
            onCancel={() => setView('catalog')}
            onSubmit={handleBookingSubmit}
            shippingZones={shippingZones}
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

      {/* Invoice Viewer (Public Link Mode) */}
      {view === 'invoice_viewer' && invoiceData && (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
          {/* Visible Invoice for Viewing */}
          <div className="bg-white shadow-2xl rounded-xl overflow-hidden max-w-2xl w-full mb-8 scale-75 md:scale-90 origin-top">
            <Invoice data={invoiceData} />
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex flex-col gap-3 items-center z-50">
            <button
              onClick={() => downloadInvoice(invoiceData)}
              className="btn w-full max-w-md py-3 text-lg font-bold shadow-lg"
            >
              DOWNLOAD PDF
            </button>
            <a href="/" className="text-gray-500 text-sm font-medium hover:text-[#004aad]">
              Kembali ke Home
            </a>
          </div>
        </div>
      )}

      {/* Hidden Invoice Container (For PDF Generation) */}
      {/* Used by both Booking Success and Invoice Viewer download */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <Invoice ref={invoiceRef} data={invoiceData} />
      </div>

      {/* Global Components */}
      {view !== 'admin' && <InstagramBadge />}
      <PromoManager />

    </div>
  );
}

export default App;
