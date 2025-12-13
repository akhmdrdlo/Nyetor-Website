import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Download, ExternalLink, X, FileText, Smartphone, Home } from 'lucide-react';

export default function BookingSuccess({ invoiceData, googleFormUrl, onDownloadInvoice }) {
    const [showModal, setShowModal] = useState(true);

    // Auto-scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const whatsappMessage = `Halo Admin, saya sudah download invoice atas nama *${invoiceData?.name}*. Mohon dibantu untuk proses selanjutnya.`;
    const whatsappUrl = `https://wa.me/6287818747396?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden font-sans">

            {/* LEFT COLUMN: Hero Style (Logo & Background) */}
            <div className="w-full md:w-1/2 relative bg-black hidden md:block">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/bandung.png"
                        alt="Bandung Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-[#0a0a0a]" />
                </div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
                    <img
                        src="/Nyetor Logo Transparent.png"
                        alt="Nyetor Logo"
                        className="w-48 mb-6 drop-shadow-[0_0_30px_rgba(0,74,173,0.8)]"
                    />
                    <h1 className="text-4xl font-bold text-white mb-2">
                        NYETOR.<span className="text-[#004aad]">ID</span>
                    </h1>
                    <p className="text-gray-300">Solusi Sewa Motor Terbaik di Bandung.</p>
                </div>
            </div>

            {/* RIGHT COLUMN: Main Content */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="mb-6 flex justify-center">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle className="text-green-600 w-16 h-16" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-[#004aad] mb-2 uppercase">Booking Berhasil!</h2>
                    <p className="text-gray-500 mb-8">
                        Terima kasih <strong>{invoiceData?.name}</strong>. Invoice anda telah otomatis diunduh.
                    </p>

                    <div className="space-y-4">
                        {/* 1. Primary Action: WhatsApp Confirm */}
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-[#004aad] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-800 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Smartphone size={20} />
                            KONFIRMASI KE WHATSAPP
                        </a>

                        {/* 2. Secondary: Download Invoice Again */}
                        <button
                            onClick={onDownloadInvoice}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-[#004aad] hover:text-[#004aad] transition-colors"
                        >
                            <Download size={18} />
                            Download Invoice Lagi
                        </button>

                        {/* 3. Fallback Link: Google Form */}
                        <div className="pt-4 border-t border-gray-100 mt-6">
                            <p className="text-xs text-gray-400 mb-2">Belum mengisi data jaminan?</p>
                            <a
                                href={googleFormUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-[#004aad] font-bold hover:underline"
                            >
                                <ExternalLink size={14} />
                                Isi Formulir Kelengkapan Data
                            </a>
                        </div>
                        {/* 4. kembali ke beranda */}
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-[#004aad] hover:text-[#004aad] transition-colors"
                        >
                            <Home size={18} />
                            Kembali ke Beranda
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* MODAL POPUP */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8 text-center">
                                <div className="mx-auto bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 text-[#004aad]">
                                    <FileText size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 mb-2">LENGKAPI DATA</h3>
                                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                                    Agar pesananmu segera diproses, silakan lengkapi data jaminan (KTP) melalu Google Form berikut.
                                </p>

                                <a
                                    href={googleFormUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => setShowModal(false)}
                                    className="block w-full py-3 bg-[#004aad] text-white font-bold rounded-xl shadow-lg hover:bg-blue-800 transition-transform active:scale-95 mb-3"
                                >
                                    ISI FORMULIR SEKARANG
                                </a>

                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 text-xs font-semibold hover:text-gray-600"
                                >
                                    Saya sudah mengisi, tutup popup ini
                                </button>
                            </div>

                            {/* Decorative stripe */}
                            <div className="h-2 bg-gradient-to-r from-blue-400 to-[#004aad] w-full" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
