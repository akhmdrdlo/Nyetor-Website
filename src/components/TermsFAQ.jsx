import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plane, AlertCircle, CheckCircle2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function TermsFAQ() {
    const [activeTab, setActiveTab] = useState('mahasiswa');
    const [openRule, setOpenRule] = useState(null);

    const toggleRule = (index) => {
        setOpenRule(openRule === index ? null : index);
    };

    const studentTerms = [
        "Wajib menyerahkan KTP asli selama masa sewa.",
        "Wajib menyerahkan KTM (Kartu Tanda Mahasiswa) sebagai bukti mahasiswa aktif.",
        "Bersedia difoto bersama unit sebagai testimoni.",
        "Mengisi form penyewaan dengan data yang valid.",
        "Memastikan tidak terjadi kerusakan pada motor yang disewa."
    ];

    const touristTerms = [
        "Wajib menyerahkan 2 Kartu Identitas Asli (1 KTP, 1 Bebas: SIM/NPWP/KK/dll).",
        "Wajib mencantumkan Nomor Telepon Darurat (Kerabat/Teman).",
        "Wajib menunjukkan Tiket Perjalanan PP / Bukti perjalanan menuju atau keluar Bandung.",
        "Memperlihatkan bukti booking penginapan/hotel (jika ada).",
        "Bersedia difoto bersama unit sebagai testimoni & mengisi form penyewaan."
    ];

    const generalRules = [
        {
            title: "Sistem Pembayaran & DP",
            content: "TIDAK ADA SISTEM DP. Pembayaran dilakukan FULL saat bertemu dengan tim (serah terima unit). Bisa Cash atau Scan QRIS."
        },
        {
            title: "Pembatalan (Cancel)",
            content: "Konfirmasi cancel paling lambat 1 hari sebelum waktu sewa (Wisatawan) atau 6 jam sebelum waktu sewa (Mahasiswa)."
        },
        {
            title: "Overtime (Perpanjangan)",
            content: "Konfirmasi tambah waktu: Paling lambat 6 jam sebelum habis (Wisatawan) atau 2 jam sebelum habis (Mahasiswa). Jika melebihi batas konfirmasi, dikenakan denda Rp 100.000/jam."
        },
        {
            title: "Bahan Bakar (Bensin)",
            content: "Sistem 'Isi Sesuai Kebutuhan'. Tidak ada ketentuan khusus jumlah bensin saat dikembalikan (tapi jangan sampai mogok/kering ya, kasian tim antarnya 😉)."
        },
        {
            title: "Operasional Pengantaran",
            content: "Operasional 24 Jam. Khusus pengantaran pukul 23.00 - 04.00 WIB wajib memberikan uang tambah layanan (seikhlasnya) untuk tim lapangan."
        },
        {
            title: "Tanggung Jawab Kerusakan/Kehilangan",
            content: "Dilarang memindah-tangankan kendaraan. Segala bentuk penilangan, kehilangan, dan kerusakan saat proses sewa sepenuhnya DITANGGUNG PENYEWA. Kerusakan akan dikenakan denda sesuai harga sparepart/perbaikan."
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-40 -left-20 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-sm font-bold text-[#004aad] tracking-widest uppercase mb-2">Informasi Penting</h2>
                    <h3 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
                        SYARAT & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004aad] to-blue-400">KETENTUAN</span>
                    </h3>
                    <p className="text-gray-500 text-lg">
                        Mox, baca dulu ya biar sama-sama enak! Berikut syarat sewa untuk Mahasiswa dan Wisatawan.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* LEFT COLUMN: SYARAT (Tabs) */}
                    <div>
                        <div className="bg-gray-50 p-2 rounded-2xl flex gap-2 mb-8 border border-gray-100 shadow-sm">
                            <button
                                onClick={() => setActiveTab('mahasiswa')}
                                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'mahasiswa' ? 'bg-white text-[#004aad] shadow-md ring-1 ring-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <GraduationCap size={20} /> Edisi Mahasiswa
                            </button>
                            <button
                                onClick={() => setActiveTab('wisatawan')}
                                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'wisatawan' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Plane size={20} /> Edisi Wisatawan
                            </button>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl relative overflow-hidden min-h-[400px]">
                            {/* Decorative Blob in Card */}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 transition-colors duration-500 ${activeTab === 'mahasiswa' ? 'bg-blue-600' : 'bg-emerald-600'}`} />

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h4 className={`text-2xl font-black mb-6 flex items-center gap-3 ${activeTab === 'mahasiswa' ? 'text-[#004aad]' : 'text-emerald-700'}`}>
                                        {activeTab === 'mahasiswa' ? <GraduationCap /> : <Plane />}
                                        Syarat {activeTab === 'mahasiswa' ? 'Mahasiswa' : 'Wisatawan'}
                                    </h4>

                                    <ul className="space-y-4">
                                        {(activeTab === 'mahasiswa' ? studentTerms : touristTerms).map((term, idx) => (
                                            <li key={idx} className="flex items-start gap-4 text-gray-600">
                                                <div className={`mt-1 p-1 rounded-full shrink-0 ${activeTab === 'mahasiswa' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <span className="leading-relaxed font-medium">{term}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className={`mt-8 p-4 rounded-xl flex items-start gap-3 text-sm ${activeTab === 'mahasiswa' ? 'bg-blue-50 text-blue-800' : 'bg-emerald-50 text-emerald-800'}`}>
                                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                        <p>Pastikan data diri asli dan masih berlaku. Kami menjamin kerahasiaan data keamanan Anda.</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: KETENUAN UMUM (Accordion) */}
                    <div>
                        <h4 className="text-2xl font-black mb-8 text-gray-900 flex items-center gap-3">
                            <HelpCircle className="text-[#004aad]" /> Ketentuan & FAQ
                        </h4>

                        <div className="space-y-4">
                            {generalRules.map((rule, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <button
                                        onClick={() => toggleRule(index)}
                                        className="w-full text-left p-5 flex justify-between items-center group"
                                    >
                                        <span className="font-bold text-gray-800 group-hover:text-[#004aad] transition-colors">
                                            {rule.title}
                                        </span>
                                        <div className={`p-2 rounded-full bg-gray-50 transition-transform duration-300 ${openRule === index ? 'rotate-180 bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
                                            <ChevronDown size={18} />
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {openRule === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-3">
                                                    {rule.content}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
