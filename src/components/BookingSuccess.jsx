import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Download, ExternalLink, X, FileText, Smartphone, Home } from 'lucide-react';

export default function BookingSuccess({ invoiceData, googleFormUrl, onDownloadInvoice }) {

    // Auto-scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const whatsappMessage = `Halo Admin, saya sudah download invoice atas nama *${invoiceData?.name}*. Mohon dibantu untuk proses selanjutnya.\n\nLink Invoice: ${invoiceData?.shareLink || '-'}`;
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
                        Terima kasih <strong>{invoiceData?.name}</strong>. Invoice anda sedang diunduh otomatis.<br />
                        <span className="text-xs text-gray-400">(Cek halaman 2 pada Invoice untuk link pengisian data)</span>
                    </p>

                    <div className="space-y-4">
                        {/* 1. Primary Action: Download Invoice (If not auto, or redownload) */}
                        <button
                            onClick={onDownloadInvoice}
                            className="flex items-center justify-center gap-2 w-full py-4 bg-[#004aad] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-800 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Download size={20} />
                            DOWNLOAD INVOICE
                        </button>

                        {/* 2. Secondary: Google Form (Manual Link) */}
                        <a
                            href={googleFormUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-[#004aad] text-[#004aad] rounded-xl font-bold hover:bg-blue-50 transition-colors"
                        >
                            <ExternalLink size={18} />
                            ISI DATA JAMINAN
                        </a>

                        {/* 3. Third: WA */}
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl font-bold hover:bg-green-50 transition-colors"
                        >
                            <Smartphone size={18} />
                            Konfirmasi ke WhatsApp
                        </a>

                        {/* 3. Kembali */}
                        <button
                            onClick={() => window.location.href = '/'}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-gray-400 hover:text-gray-800 transition-colors"
                        >
                            <Home size={18} />
                            Kembali ke Beranda
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
