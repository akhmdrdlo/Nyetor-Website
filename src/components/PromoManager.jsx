import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Data Promo yang akan ditampilkan secara berurutan
// Bisa ditambahkan seberapa banyak pun nanti.
const promosData = [
  {
    id: "promo_welcome",
    image: "/Nyetor Logo Transparent.png",
    imageClass: "h-24 md:h-32 object-contain brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover:scale-105 transition-transform duration-700", 
    imageWrapperClass: "bg-[#004aad]", // Dark Blue background for white logo
    badge: "WELCOME 🤙",
    badgeColor: "bg-blue-100 text-[#004aad] border-blue-200",
    title: { regular: "SELAMAT DATANG DI ", highlight: "NYETOR", highlightColor: "text-[#004aad]" },
    desc: "Pusat rental motor TERBAIK & TERMURAH! Unit super terawat, wangi, dan aman. Siap temani liburanmu keliling Bandung!",
    buttonText: "NICE!",
    buttonBg: "bg-[#004aad] text-white hover:shadow-[0_8px_30px_rgb(0,74,173,0.5)] hover:-translate-y-1",
  },
  {
    id: "promo_nmax",
    image: "/nmax_keyless.png",
    imageClass: "w-4/5 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700",
    imageWrapperClass: "bg-gradient-to-tr from-yellow-400 to-yellow-600",
    badge: "HOT UPDATE 🔥",
    badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    title: { regular: "YAMAHA NMAX KEYLESS ", highlight: "KEMBALI!", highlightColor: "text-[#004aad]" },
    desc: "Unit primadona sudah bisa disewa lagi. Jangan sampai kehabisan, langsung amankan jadwalmu sekarang juga.",
    buttonText: "SEWA SEKARANG",
    buttonBg: "bg-[#004aad] text-white hover:shadow-[0_8px_30px_rgb(0,74,173,0.5)] hover:-translate-y-1",
  }
];

export default function PromoManager() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        // Automatically start showing promos after 1.5s
        const timer = setTimeout(() => {
            setIsStarted(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const handleNext = () => {
        setCurrentIndex((prev) => prev + 1);
    };

    // If we haven't started or we've run out of promos, render nothing
    if (!isStarted || currentIndex >= promosData.length) {
        return null;
    }

    const currentPromo = promosData[currentIndex];

    return (
        <AnimatePresence mode="wait">
            <div key={currentPromo.id} className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                {/* Dark overlay onClick to go to next promo */}
                <div className="absolute inset-0" onClick={handleNext}></div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                    className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Close button inside modal (floating) */}
                    <button 
                        onClick={handleNext} 
                        className="absolute top-4 right-4 z-20 bg-black/10 hover:bg-black/20 text-white p-2 rounded-full transition-colors backdrop-blur"
                    >
                        <X size={24} />
                    </button>

                    <div className={`relative h-64 flex items-center justify-center group overflow-hidden ${currentPromo.imageWrapperClass}`}>
                            {/* Decorative Shapes */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                        
                        <img 
                            src={currentPromo.image} 
                            alt={currentPromo.id} 
                            className={`relative z-10 ${currentPromo.imageClass}`} 
                        />
                    </div>

                    <div className="p-8 text-center bg-white cursor-auto">
                        <span className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full mb-4 border ${currentPromo.badgeColor}`}>
                            {currentPromo.badge}
                        </span>
                        
                        <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight uppercase">
                            {currentPromo.title.regular} <span className={currentPromo.title.highlightColor}>{currentPromo.title.highlight}</span>
                        </h2>
                        
                        <p className="text-gray-500 mb-8 font-medium">
                            {currentPromo.desc}
                        </p>
                        
                        <button 
                            onClick={() => {
                                handleNext();
                                // if want to scroll logic on certain promos, you could add property logic 
                                // but for simplicity just next
                            }}
                            className={`w-full py-4 rounded-full font-bold shadow-lg transition-all duration-300 ${currentPromo.buttonBg}`}
                        >
                            {currentPromo.buttonText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
