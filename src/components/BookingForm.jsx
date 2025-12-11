import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, Briefcase, Calendar, AlertCircle } from 'lucide-react';

export default function BookingForm({ selectedBike, onCancel, onSubmit }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        duration: '24',
        helmet: false,
        pekerjaan: '',
        instansi: '',
        startDate: '', // YYYY-MM-DD
        startTime: '', // HH:mm
        titikAntar: '',
        titikJemput: ''
    });

    const [isSuccess, setIsSuccess] = useState(false);
    const [finalGoogleUrl, setFinalGoogleUrl] = useState('');
    const [endDateInfo, setEndDateInfo] = useState({ date: '', time: '' });
    const [totalPrice, setTotalPrice] = useState(0);

    // Dynamic Pricing & End Date Calculation Logic
    useEffect(() => {
        if (!selectedBike) return;

        // 1. Calculate Price
        let price = selectedBike.prices[formData.duration];
        if (!price) {
            const durations = Object.keys(selectedBike.prices).map(Number).sort((a, b) => a - b);
            const closest = durations.find(d => d >= Number(formData.duration)) || durations[durations.length - 1];
            price = selectedBike.prices[closest];
        }
        if (formData.helmet) price += 10000;
        setTotalPrice(price);

        // 2. Calculate End Date/Time
        if (formData.startDate && formData.startTime) {
            const start = new Date(`${formData.startDate}T${formData.startTime}`);
            const durationHours = parseInt(formData.duration);

            if (!isNaN(start.getTime()) && !isNaN(durationHours)) {
                const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

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

    }, [selectedBike, formData.duration, formData.helmet, formData.startDate, formData.startTime]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const finalTotal = totalPrice;

        // 1. Trigger Invoice Download
        onSubmit({
            ...formData,
            bike: selectedBike,
            total: finalTotal,
            endDateInfo
        });

        // 2. Prepare Google Form URL
        const formBaseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfmIf2V8F693IHThJsJLvkV9pZH8HGYEIjxHLPXn58aWgSIZQ/viewform";
        const params = new URLSearchParams();

        // --- BASIC INFO ---
        params.append('entry.1136619666', formData.name);
        params.append('entry.186146540', formData.phone);
        params.append('entry.50981428', selectedBike.name);
        params.append('entry.94114208', formData.duration + " Jam");

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

        // --- LOG & ALERT (User Experience) ---
        console.log("✅ Data sent to Google Form Params.");
        console.log("⚠ User needs to manually fill: [Upload Jaminan] & [Kontak Darurat]");

        const warmMessage = `Halo Kak ${formData.name || 'Ganteng/Cantik'}! ✨\n\nTerima kasih sudah booking unit di Nyetor.id! Invoice kakak sedang didownload otomatis.\n\nLangkah Terakhir:\nKami akan mengarahkan kakak ke Google Form. Mohon lengkapi bagian ini ya:\n1. 📸 Upload Foto Jaminan (KTP/KTM)\n2. 📞 Isi 2 Kontak Darurat\n\nJika semua sudah, langsung klik SUBMIT ya. Hati-hati di jalan! 🛵💨`;

        // Small delay to ensure invoice download triggers first, then show alert
        setTimeout(() => {
            alert(warmMessage);
            window.open(finalUrl, '_blank');
        }, 1000);
    };

    if (!selectedBike) return null;

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Durasi</label>
                            <select
                                className="input-field"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            >
                                {Object.keys(selectedBike.prices).map(h => (
                                    <option key={h} value={h}>{h} Jam</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-1">Selesai (Otomatis)</label>
                            <div className="bg-gray-200 text-gray-600 px-3 py-3 rounded-lg font-mono text-sm border border-gray-300">
                                {endDateInfo.date} • {endDateInfo.time}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: LOCATION */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-[#004aad] mb-3 uppercase flex items-center gap-2">
                        <MapPin size={16} /> Lokasi
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Titik Antar (Awal)</label>
                            <input
                                required
                                type="text"
                                className={`input-field ${formData.duration === '3' ? 'bg-gray-200 cursor-not-allowed text-gray-400' : ''}`}
                                placeholder={formData.duration === '3' ? 'Ambil Sendiri di Garasi (3 Jam)' : 'Alamat lengkap / Shareloc...'}
                                value={formData.duration === '3' ? 'AMBIL SENDIRI DI GARASI' : formData.titikAntar}
                                onChange={e => {
                                    if (formData.duration !== '3') {
                                        setFormData({ ...formData, titikAntar: e.target.value });
                                    }
                                }}
                                disabled={formData.duration === '3'}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs font-bold uppercase mb-1">Titik Jemput (Akhir)</label>
                            <input
                                required type="text" className="input-field" placeholder="Alamat lengkap..."
                                value={formData.titikJemput} onChange={e => setFormData({ ...formData, titikJemput: e.target.value })}
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
                            <strong>Butuh Helm?</strong> Silahkan pesan terpisah di kategori <strong>"Aksesoris"</strong>. <br />
                            Harga sewa motor saat ini <strong>BELUM</strong> termasuk tambahan helm (kecuali bawaan standar).
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

                {/* WAITING FOR 3 HOURS NOTIF */}
                {formData.duration === '3' && (
                    <div className="flex gap-3 bg-red-50 p-3 rounded-lg border border-red-100 text-red-700 text-xs items-center shadow-sm">
                        <AlertTriangle size={16} className="shrink-0" />
                        <span className="font-bold">Sewa 3 Jam TIDAK BISA DIANTAR (Wajib Ambil Sendiri).</span>
                    </div>
                )}

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
