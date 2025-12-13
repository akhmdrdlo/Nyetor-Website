import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, Briefcase, Calendar, AlertCircle, Plus, RefreshCw, Check } from 'lucide-react';

export default function BookingForm({ selectedBike, onCancel, onSubmit }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        pekerjaan: '',
        instansi: '',
        startDate: '', // YYYY-MM-DD
        startTime: '', // HH:mm
        titikAntar: '',
        titikAntarDetail: '', // Provide detailed desc if needed
        titikJemput: '',
        deliveryMethod: 'pickup', // pickup | delivery
        selectedZonePrice: 0
    });

    // Flexible Duration Logic
    const sortedDurations = selectedBike && selectedBike.prices
        ? Object.keys(selectedBike.prices).map(Number).sort((a, b) => a - b)
        : [];
    const minDuration = sortedDurations.length > 0 ? sortedDurations[0] : 24; // Default to lowest available or 24 if empty

    const [durationChunks, setDurationChunks] = useState([minDuration]);
    const [totalDuration, setTotalDuration] = useState(minDuration);

    const [isSuccess, setIsSuccess] = useState(false);
    const [endDateInfo, setEndDateInfo] = useState({ date: '', time: '' });
    const [totalPrice, setTotalPrice] = useState(0);
    const [shakeDelivery, setShakeDelivery] = useState(false);

    // Shipping Zones Data (Sorted by Price)
    const SHIPPING_ZONES = [
        { price: 5000, label: "Zone A (Rp 5.000)", detail: "Manisi & Cipadung" },
        { price: 7000, label: "Zone B (Rp 7.000)", detail: "Panyilekan & Cimekar" },
        { price: 10000, label: "Zone C (Rp 10.000)", detail: "Cilengkrang Bawah" },
        { price: 11000, label: "Zone D (Rp 11.000)", detail: "Ujung Berung & Gedebage" },
        { price: 13000, label: "Zone E (Rp 13.000)", detail: "Cinunuk & Cilengkrang Atas" },
        { price: 15000, label: "Zone F (Rp 15.000)", detail: "Cileunyi & St. KCIC Tegalluar" },
        { price: 20000, label: "Zone G (Rp 20.000)", detail: "Pasir Impun Bawah, Gedebage Dalem, Hotel Cordella" },
        { price: 25000, label: "Zone H (Rp 25.000)", detail: "Metro, Apt. Panoramic, Pasir Impun Atas" },
        { price: 30000, label: "Zone I (Rp 30.000)", detail: "St. Kircon, Jatinangor, Rancaekek, Trm. Cicaheum, Gasibu, Gdg Sate" },
        { price: 35000, label: "Zone J (Rp 35.000)", detail: "Buah Batu" },
        { price: 40000, label: "Zone K (Rp 40.000)", detail: "St. Bandung, Baltos, Dago Bawah, Dipati Ukur, Cihampelas, Dayeuh Kolot, Moh.Toha, Nagreg" },
        { price: 50000, label: "Zone L (Rp 50.000)", detail: "St. Cimahi, Pasteur, Banjaran, Dago Atas, Trm. Leuwi Panjang, Pasir Koja" },
        { price: 60000, label: "Zone M (Rp 60.000)", detail: "St. Padalarang, Soreang, Lembang" },
    ];

    // Helper to get selected zone detail
    const selectedZoneDetail = SHIPPING_ZONES.find(z => z.price === formData.selectedZonePrice)?.detail;

    // Helper: Add Duration Chunk
    const addDuration = (hours) => {
        setDurationChunks(prev => [...prev, hours]);
    };

    // Helper: Reset Duration
    const resetDuration = () => {
        setDurationChunks([minDuration]); // Reset to minimum duration
    };

    // Helper: Set specific duration (clears sum) - for Shortcuts
    const setSpecificDuration = (chunks) => {
        setDurationChunks(chunks);
    };

    // Dynamic Pricing & End Date Calculation Logic
    useEffect(() => {
        if (!selectedBike) return;

        // 1. Calculate Total Duration
        const currentTotalDuration = durationChunks.reduce((acc, curr) => acc + curr, 0);
        setTotalDuration(currentTotalDuration);

        // Force Pickup if 3 Hours Total
        if (currentTotalDuration === 3 && formData.deliveryMethod === 'delivery') {
            setFormData(prev => ({ ...prev, deliveryMethod: 'pickup', selectedZonePrice: 0 }));
        }

        // 2. Smart Pricing Logic (Recursive / Greedy)
        const calculateSmartPrice = (hours, prices) => {
            if (hours <= 0) return 0;

            // Direct match check
            if (prices[hours]) return prices[hours];

            // If no direct match, find largest duration fitting into 'hours'
            const numericDurations = Object.keys(prices).map(Number).sort((a, b) => b - a); // Descending
            const bestFit = numericDurations.find(d => d <= hours);

            if (bestFit) {
                return prices[bestFit] + calculateSmartPrice(hours - bestFit, prices);
            }

            // Fallback (Should theoretically not happen if hours formed by defined chunks)
            // But if there's a remainder smaller than smallest chunk:
            // return proportional or just the smallest chunk price?
            // Let's assume smallest chunk price to be safe/conservative for business
            const minDuration = numericDurations[numericDurations.length - 1];
            return prices[minDuration] || 0;
        };

        let price = calculateSmartPrice(currentTotalDuration, selectedBike.prices);

        // Add Shipping (Ongkir)
        if (formData.deliveryMethod === 'delivery' && currentTotalDuration > 3) {
            price += Number(formData.selectedZonePrice || 0);
        }

        setTotalPrice(price);

        // 3. Calculate End Date/Time
        if (formData.startDate && formData.startTime) {
            const start = new Date(`${formData.startDate}T${formData.startTime}`);

            if (!isNaN(start.getTime())) {
                const end = new Date(start.getTime() + currentTotalDuration * 60 * 60 * 1000);

                // Format Date: YYYY-MM-DD
                const yyyy = end.getFullYear();
                const mm = String(end.getMonth() + 1).padStart(2, '0');
                const dd = String(end.getDate()).padStart(2, '0');

                // Format Time: HH:mm
                const hh = String(end.getHours()).padStart(2, '0');
                const min = String(end.getMinutes()).padStart(2, '0');

                setEndDateInfo({ date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` });
            }
        } else {
            setEndDateInfo({ date: '-', time: '-' });
        }

    }, [selectedBike, durationChunks, formData.startDate, formData.startTime, formData.deliveryMethod, formData.selectedZonePrice]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const finalTotal = totalPrice;

        // Get label for selected zone
        const currentZone = SHIPPING_ZONES.find(z => z.price === formData.selectedZonePrice);
        const zoneLabel = currentZone ? `${currentZone.label}` : '';


        // 2. Prepare Google Form URL
        const formBaseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfmIf2V8F693IHThJsJLvkV9pZH8HGYEIjxHLPXn58aWgSIZQ/viewform";
        const params = new URLSearchParams();

        // --- BASIC INFO ---
        params.append('entry.1136619666', formData.name);
        params.append('entry.186146540', formData.phone);
        params.append('entry.50981428', selectedBike.name);
        params.append('entry.94114208', totalDuration + " Jam");

        // --- JOB & INST ---
        params.append('entry.1453468515', formData.pekerjaan);
        params.append('entry.1978358904', formData.instansi);

        // --- DATES ---
        if (formData.startDate) {
            const [y, m, d] = formData.startDate.split('-');
            params.append('entry.499324648_year', y);
            params.append('entry.499324648_month', m);
            params.append('entry.499324648_day', d);
        }

        if (endDateInfo.date && endDateInfo.date !== '-') {
            const [y, m, d] = endDateInfo.date.split('-');
            params.append('entry.1844209177_year', y);
            params.append('entry.1844209177_month', m);
            params.append('entry.1844209177_day', d);
        }

        // --- LOCATIONS ---
        params.append('entry.33539258', formData.titikAntar);
        params.append('entry.1712319390', formData.titikJemput);

        // --- TIMES (SPLIT PARAMS) ---
        // Start Time (Jam Antar): entry.742150365
        if (formData.startTime) {
            const [h, m] = formData.startTime.split(':');
            params.append('entry.742150365_hour', h);
            params.append('entry.742150365_minute', m);
        }

        // End Time (Jam Jemput): entry.121224385
        if (endDateInfo.time && endDateInfo.time !== '-') {
            const [h, m] = endDateInfo.time.split(':');
            params.append('entry.121224385_hour', h);
            params.append('entry.121224385_minute', m);
        }

        const finalUrl = `${formBaseUrl}?${params.toString()}`;

        // 1. Trigger Invoice Download & Pass URL to Parent
        onSubmit({
            ...formData,
            bike: selectedBike,
            total: finalTotal,
            duration: totalDuration.toString(),
            shippingCost: formData.deliveryMethod === 'delivery' ? formData.selectedZonePrice : 0,
            shippingZoneLabel: formData.deliveryMethod === 'delivery' ? zoneLabel : '',
            deliveryDetail: formData.deliveryMethod === 'delivery' ? selectedZoneDetail : '',
            endDateInfo,
            googleFormUrl: finalUrl // Pass URL for manual button in Success screen
        });

        // Log for debug
        console.log("✅ Data prepared for Google Form Button.");
    };

    if (!selectedBike) return null;

    // Available duration buttons derived from bike prices
    // If bike has 3h, show +3h button. etc.
    const availableDurations = Object.keys(selectedBike.prices).map(Number).sort((a, b) => a - b);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-2xl shadow-2xl relative max-w-4xl mx-auto w-full border border-gray-100 max-h-[90vh] overflow-y-auto"
        >
            <button
                onClick={onCancel}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors z-10"
            >
                ✕
            </button>

            <h2 className="text-2xl font-black mb-1 text-[#004aad] text-center">FORMULIR BOOKING</h2>
            <p className="text-gray-500 text-sm mb-6 text-center">
                Unit: <span className="font-bold text-black">{selectedBike.name}</span>
                {/* Availability Disclaimer */}
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-[10px] text-yellow-800 flex items-start gap-2 italic">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>
                        <strong>Note:</strong> Unit yang dipilih jika mendadak tidak ready karena banyak hal (servis/laka) akan diinformasikan paling lambat H-1 dengan ditawarkan unit yang selevel dengan pilihan unit pertama.
                    </span>
                </div>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* SECTION 1: PERSONAL INFO */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-[#004aad] mb-3 uppercase flex items-center gap-2">
                        <Briefcase size={16} /> Data Diri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Nama Lengkap</label>
                            <input
                                required type="text" className="input-field" placeholder="Contoh: Asep Knalpot"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Nomor WhatsApp</label>
                            <input
                                required type="tel" className="input-field" placeholder="08xxxxxxxxxx"
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Pekerjaan</label>
                            <input
                                required type="text" className="input-field" placeholder="Mahasiswa / Karyawan"
                                value={formData.pekerjaan} onChange={e => setFormData({ ...formData, pekerjaan: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Instansi / Universitas</label>
                            <input
                                required type="text" className="input-field" placeholder="Contoh: UIN Bandung"
                                value={formData.instansi} onChange={e => setFormData({ ...formData, instansi: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: RENTAL DETAILS */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-bold text-[#004aad] mb-3 uppercase flex items-center gap-2">
                        <Calendar size={16} /> Detail Sewa
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Tanggal Mulai</label>
                            <input
                                required type="date" className="input-field"
                                value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Jam Mulai</label>
                            <input
                                required type="time" className="input-field"
                                value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Flexible Duration Builder */}
                    <div className="mb-4">
                        <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Durasi Sewa</label>

                        {/* Status Bar */}
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200 mb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="text-blue-500" size={18} />
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Durasi</div>
                                    <div className="text-lg font-black text-gray-800">{totalDuration} Jam</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={resetDuration}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"
                                title="Reset Durasi"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        {/* 1. MAIN PACKAGES (SET DURATION) */}
                        <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Pilih Paket Utama</label>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {availableDurations.map(h => {
                                const isActive = totalDuration === h;
                                return (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => setSpecificDuration([h])}
                                        className={`flex items-center justify-center gap-1 border py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${isActive
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-offset-1 ring-blue-400'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'
                                            }`}
                                    >
                                        {isActive && <Check size={12} />} {h}h
                                    </button>
                                );
                            })}
                        </div>

                        {/* 2. ADD EXTRA (ADD DURATION) */}
                        <label className="block text-gray-400 text-[10px] font-bold uppercase mb-1">Tambah Ekstra Jam</label>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {[3, 6, 12, 24].map(h => (
                                <button
                                    key={`add-${h}`}
                                    type="button"
                                    onClick={() => addDuration(h)}
                                    className="flex items-center justify-center gap-1 bg-gray-50 border border-transparent text-gray-500 hover:bg-white hover:border-blue-300 hover:text-blue-600 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                                >
                                    <Plus size={10} /> {h}h
                                </button>
                            ))}
                        </div>

                        {/* 3. LONG TERM (SHORTCUTS) */}
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <button type="button" onClick={() => setSpecificDuration(Array(7).fill(24))} className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold text-gray-500 transition-colors">
                                1 Minggu
                            </button>
                            <button type="button" onClick={() => setSpecificDuration(Array(14).fill(24))} className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold text-gray-500 transition-colors">
                                2 Minggu
                            </button>
                            <button type="button" onClick={() => setSpecificDuration(Array(30).fill(24))} className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold text-gray-500 transition-colors">
                                1 Bulan
                            </button>
                        </div>
                    </div>

                    {/* End Date Display */}
                    <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase mb-1">Selesai (Otomatis)</label>
                        <div className="bg-gray-200 text-gray-600 px-3 py-3 rounded-lg font-mono text-sm border border-gray-300">
                            {endDateInfo.date} • {endDateInfo.time}
                        </div>
                    </div>
                </div>

                {/* SECTION 3: LOCATION & DELIVERY */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-[#004aad] mb-3 uppercase flex items-center gap-2">
                        <MapPin size={16} /> Pengantaran & Lokasi
                    </h3>
                    {/* WAITING FOR 3 HOURS NOTIF */}
                    {totalDuration === 3 && (
                        <div className="flex gap-3 bg-red-50 p-3 mb-4 rounded-lg border border-red-100 text-red-700 text-xs items-center shadow-sm">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span className="font-bold">Sewa 3 Jam TIDAK BISA DIANTAR (Wajib Ambil Sendiri).</span>
                        </div>
                    )}
                    {/* Delivery Method Selection */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <label className={`cursor-pointer p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${formData.deliveryMethod === 'pickup' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                            <input
                                type="radio"
                                name="deliveryMethod"
                                value="pickup"
                                checked={formData.deliveryMethod === 'pickup'}
                                onChange={() => setFormData({ ...formData, deliveryMethod: 'pickup', selectedZonePrice: 0 })}
                                className="hidden"
                            />
                            <span className="font-bold text-sm">Ambil di Garasi</span>
                            <span className="text-[10px] uppercase tracking-wider">Gratis</span>
                        </label>

                        <motion.label
                            animate={shakeDelivery ? {
                                x: [0, -20, 20, -20, 20, 0],
                                transition: { duration: 0.4 }
                            } : {}}
                            className={`cursor-pointer p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${shakeDelivery
                                ? 'bg-red-50 border-red-500 text-red-700'
                                : formData.deliveryMethod === 'delivery'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                                }`}
                            onClick={(e) => {
                                if (totalDuration === 3) {
                                    e.preventDefault();
                                    setShakeDelivery(true);
                                    setTimeout(() => setShakeDelivery(false), 400);
                                }
                            }}
                        >
                            <input
                                type="radio"
                                name="deliveryMethod"
                                value="delivery"
                                checked={formData.deliveryMethod === 'delivery'}
                                onChange={() => setFormData({ ...formData, deliveryMethod: 'delivery' })}
                                className="hidden"
                            />
                            <span className="font-bold text-sm">Diantar / Jemput</span>
                            <span className="text-[10px] uppercase tracking-wider">+ Ongkir</span>
                        </motion.label>
                    </div>

                    <div className="grid grid-cols-1 gap-4">

                        {/* Zone Selector (Only if Delivery) */}
                        {formData.deliveryMethod === 'delivery' && (
                            <div className="animate-fade-in-down">
                                <label className="block text-gray-600 text-xs font-bold uppercase mb-1">
                                    Pilih Area Pengantaran (Harga PP)
                                </label>
                                <select
                                    required={formData.deliveryMethod === 'delivery'}
                                    className="input-field border-blue-200 bg-blue-50/30"
                                    onChange={(e) => {
                                        const price = Number(e.target.value);
                                        setFormData({ ...formData, selectedZonePrice: price });
                                    }}
                                    value={formData.selectedZonePrice || ''}
                                >
                                    <option value="" disabled>-- Pilih Area --</option>
                                    {SHIPPING_ZONES.map((zone, idx) => (
                                        <option key={idx} value={zone.price}>
                                            {zone.label} - {zone.detail.substring(0, 90)}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-500 mt-1 italic">
                                    *Harga sudah termasuk Pulang-Pergi (Antar & Jemput)
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Alamat Lengkap (Titik Antar)</label>
                            <input
                                required
                                type="text"
                                className={`input-field ${formData.deliveryMethod === 'pickup' ? 'bg-gray-200 cursor-not-allowed text-gray-400' : ''}`}
                                placeholder={formData.deliveryMethod === 'pickup' ? 'Ambil Sendiri di Garasi (Cipadung)' : 'Alamat lengkap / Shareloc...'}
                                value={formData.deliveryMethod === 'pickup' ? 'AMBIL SENDIRI DI GARASI' : formData.titikAntar}
                                onChange={e => {
                                    if (formData.deliveryMethod !== 'pickup') {
                                        setFormData({ ...formData, titikAntar: e.target.value });
                                    }
                                }}
                                disabled={formData.deliveryMethod === 'pickup'}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Titik Jemput (Pengembalian)</label>
                            <input
                                required type="text" className="input-field"
                                placeholder={formData.deliveryMethod === 'pickup' ? 'Dikembalikan ke Garasi...' : 'Alamat lengkap...'}
                                value={formData.deliveryMethod === 'pickup' ? 'KEMBALI KE GARASI' : formData.titikJemput}
                                onChange={e => {
                                    // Allow edit if they start with pickup but maybe return elsewhere? 
                                    // Actually usually pickup means return to garage too for simple logic, but let's allow flexibility or lock it?
                                    // For now let's lock it if pickup is selected to keep it simple as per "Ambil Sendiri" usually implies "Balikin Sendiri".
                                    if (formData.deliveryMethod !== 'pickup') {
                                        setFormData({ ...formData, titikJemput: e.target.value });
                                    }
                                }}
                                disabled={formData.deliveryMethod === 'pickup'}
                            />
                        </div>
                    </div>
                </div>

                {/* INFO & TOTAL */}
                <div className="bg-white p-6 rounded-xl text-center space-y-4">
                    {/* Helmet Info */}
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-800 flex items-start gap-2 text-left">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>
                            <strong>Info Helm:</strong> Unit sudah termasuk <strong>2 Helm Standar</strong>. <br />
                            Butuh helm tambahan? Silahkan pesan terpisah di kategori <strong>"Aksesoris"</strong>.
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pt-2">
                        <span className="block text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Biaya Sewa</span>
                        <div className="flex items-start justify-center text-[#004aad]">
                            <span className="text-xl font-bold mt-1">Rp</span>
                            <span className="text-6xl font-black tracking-tighter">
                                {(totalPrice / 1000)}<span className="text-2xl">.000</span>
                            </span>
                        </div>
                    </div>
                </div>


                <button type="submit" className="w-full btn py-4 text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-transform">
                    KONFIRMASI & LANJUT KE FORM
                </button>

            </form>

            {/* Simple CSS Style Injection for this component inputs */}
            <style>{`
                .input-field {
                    width: 100%;
                    background-color: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    padding: 0.75rem;
                    color: #1f2937;
                    outline: none;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }
                .input-field:focus {
                    border-color: #004aad;
                    box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1);
                }
            `}</style>
        </motion.div>
    );
}
