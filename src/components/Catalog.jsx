import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { catalogData, SEASONAL_CONFIG } from '../data';
import { Check, AlertTriangle, Camera } from 'lucide-react';

const categories = [
    { id: 'super_ekonomis', label: 'Super Ekonomis', color: 'bg-blue-600' },
    { id: 'unit_bebek', label: 'Unit Bebek', color: 'bg-orange-600' },
    { id: 'ekonomis', label: 'Ekonomis Unit', color: 'bg-indigo-600' },
    { id: 'silver', label: 'Silver Unit', color: 'bg-zinc-600' },
    { id: 'gold', label: 'Gold Unit', color: 'bg-yellow-600' },
    { id: 'unit_tambahan', label: 'Unit Tambahan', color: 'bg-amber-600' },
    { id: 'accessories', label: 'Aksesoris', color: 'bg-red-600' },
];

export default function Catalog({ onSelectBike, customCatalog, fleet = [] }) {
    const [priceMode, setPriceMode] = useState('regular'); // 'regular' | 'warlok' | 'seasonal'
    const [activeTab, setActiveTab] = useState('super_ekonomis');
    const [isSeasonalActive, setIsSeasonalActive] = useState(false);

    useEffect(() => {
        if (!SEASONAL_CONFIG.isAutoEnabled) return;

        // Mendapatkan timestamp saat ini secara universal (browser)
        const currentTimestamp = Date.now();
        const startTimestamp = new Date(SEASONAL_CONFIG.startDate).getTime();
        const endTimestamp = new Date(SEASONAL_CONFIG.endDate).getTime();

        if (currentTimestamp >= startTimestamp && currentTimestamp <= endTimestamp) {
            setIsSeasonalActive(true);
            setPriceMode('seasonal'); // Default to seasonal when active
        }
    }, []);

    // Override mode states dependent on user toggle now
    const isSpecial = priceMode === 'seasonal';
    const isWarlok = priceMode === 'warlok';
    const isRegular = priceMode === 'regular';

    // THEME LOGIC
    let themeColor = '#004aad'; // Blue (Regular)
    let themeText = 'text-[#004aad]';
    let themeBgAccent = 'bg-blue-50';
    let themeGradient = 'from-[#004aad] to-[#00f3ff]';
    let themeBorder = 'border-gray-100';
    let themeBg = 'bg-[#f8f9fa]';
    let themeOverlay = 'bg-[#004aad]/5';

    if (isSpecial) {
        // IDUL FITRI (Emerald/Green)
        themeColor = '#047857';
        themeText = 'text-emerald-800';
        themeBgAccent = 'bg-emerald-50';
        themeGradient = 'from-emerald-600 to-yellow-400';
        themeBorder = 'border-emerald-100';
        themeBg = 'bg-emerald-50/30';
        themeOverlay = 'bg-emerald-600/5';
    } else if (isWarlok) {
        // WARLOK (Purple/Indigo)
        themeColor = '#7c3aed'; // Violet-600
        themeText = 'text-violet-800';
        themeBgAccent = 'bg-violet-50';
        themeGradient = 'from-violet-600 to-fuchsia-400';
        themeBorder = 'border-violet-100';
        themeBg = 'bg-violet-50/30';
        themeOverlay = 'bg-violet-600/5';
    }

    // Data Source Logic
    const activeCatalog = customCatalog || catalogData;
    let currentList = activeCatalog[activeTab] || [];
    if (isSpecial) currentList = activeCatalog.seasonal || [];
    if (isWarlok) currentList = activeCatalog.warlok || [];

    return (
        <div className={`relative py-20 overflow-hidden transition-colors duration-700 ${themeBg}`}>
            {/* Dynamic Backgrounds */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/bandung.png"
                    alt="Background"
                    className={`w-full h-full object-cover opacity-10 grayscale contrast-125 transition-all duration-700 ${isSpecial ? 'sepia-[.2] hue-rotate-[90deg]' : ''} ${isWarlok ? 'sepia-[.3] hue-rotate-[240deg]' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            {/* Decor Shapes */}
            <div className={`absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l to-transparent -skew-x-[20deg] translate-x-[20%] pointer-events-none transition-colors duration-700 ${isSpecial ? 'from-emerald-100/50' : isWarlok ? 'from-violet-50/80' : 'from-blue-50/80'}`} />

            <div className="relative z-10 container mx-auto px-4">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img src="/Nyetor Logo Transparent.png" alt="Nyetor Logo" className="h-16 md:h-20 drop-shadow-md" />
                    </div>

                    <h2 className={`text-4xl md:text-5xl font-black mb-2 drop-shadow-sm uppercase tracking-tight transition-colors duration-500 ${themeText}`}>
                        PILIH UNIT <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>MOTOR</span>
                    </h2>

                    {/* Mode Toggle Switch */}
                    <div className="flex justify-center mt-6 mb-8">
                        <div className="bg-white p-1.5 rounded-full shadow-lg border border-gray-200 flex relative">
                            {/* Animated Background Pill */}
                            <motion.div
                                className={`absolute top-1.5 bottom-1.5 rounded-full shadow-md`}
                                layoutId="modePill"
                                initial={false}
                                animate={{
                                    left: isSpecial 
                                        ? '66.5%' 
                                        : isWarlok 
                                            ? (isSeasonalActive ? '34%' : '50.5%') 
                                            : '1.5%',
                                    width: isSeasonalActive ? '32%' : '48%'
                                }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                style={{
                                    backgroundColor: isSpecial ? '#059669' : isWarlok ? '#7c3aed' : '#004aad'
                                }}
                            />

                            <button
                                onClick={() => setPriceMode('regular')}
                                className={`relative z-10 px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm transition-colors duration-300 flex-1 ${isRegular ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                HARGA BIASA
                            </button>
                            <button
                                onClick={() => setPriceMode('warlok')}
                                className={`relative z-10 px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm transition-colors duration-300 flex-1 ${isWarlok ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                WARLOK
                            </button>
                            {isSeasonalActive && (
                                <button
                                    onClick={() => setPriceMode('seasonal')}
                                    className={`relative z-10 px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm transition-colors duration-300 flex-1 ${isSpecial ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    {SEASONAL_CONFIG.badgeText.replace(' 🔥', '')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Conditional Description */}
                    <AnimatePresence mode="wait">
                        {isSpecial ? (
                            <motion.div
                                key="special-desc"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-3xl mx-auto bg-emerald-100 border border-emerald-200 text-emerald-800 p-4 rounded-xl shadow-inner mb-8"
                            >
                                <h3 className="font-black text-lg mb-1">{SEASONAL_CONFIG.eventName}</h3>
                                <p className="text-sm font-medium">
                                    Masa Berlaku Promo: <strong>{new Date(SEASONAL_CONFIG.startDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(SEASONAL_CONFIG.endDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="regular-desc"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-gray-500 max-w-2xl mx-auto text-lg font-medium mb-8"
                            >
                                {isWarlok ? (
                                    <span>Harga khusus untuk <strong>Warga Lokal & Langganan</strong>! 🤙</span>
                                ) : (
                                    <span>Unit terawat, performa maksimal. Siap temani keliling Bandung!</span>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Regular Categories Tabs (Only show if Regular Mode) */}
                {isRegular && (
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold transition-all duration-300 relative overflow-hidden group text-sm md:text-base ${activeTab === cat.id
                                    ? `${cat.color} text-white shadow-lg shadow-blue-500/30 scale-105 ring-2 ring-offset-2 ring-[#004aad]`
                                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                <span className="relative z-10">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid or Warlok Warning Card */}
                {isWarlok ? (
                    <div className="max-w-2xl mx-auto w-full">
                        <motion.a
                            href="https://wa.me/6287818747396?text=Halo%20Admin%20Nyetor,%20saya%20ingin%20tanya%20mengenai%20Katalog%20Warlok%20ber-KTP%20Bandung"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="block bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-8 md:p-10 rounded-3xl shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 relative overflow-hidden border border-violet-500/30 text-center cursor-pointer group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 text-white mb-2 animate-bounce">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-snug uppercase">
                                    Katalog Warlok Ber-KTP Bandung
                                </h3>
                                <p className="text-violet-100 font-medium text-base md:text-lg max-w-lg mx-auto leading-relaxed">
                                    Katalog Warlok ber-KTP Bandung silakan chat langsung ke admin ya! 🤙
                                </p>
                                <div className="inline-flex items-center gap-2 bg-white text-violet-800 font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-transform group-hover:scale-105">
                                    <span>HUBUNGI ADMIN VIA WHATSAPP</span>
                                </div>
                            </div>
                        </motion.a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Info Alert for Unit Tambahan */}
                        {activeTab === 'unit_tambahan' && (
                            <div className="col-span-full bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex gap-3 text-amber-800 text-sm">
                                <AlertTriangle className="shrink-0 text-amber-600" size={20} />
                                <div>
                                    <span className="font-extrabold block mb-0.5">INFORMASI UNIT TAMBAHAN</span>
                                    <span>Unit di bawah ini merupakan unit pendukung/tambahan dan hanya tersedia apabila unit utama penuh atau sedang diservis. Silakan hubungi CS untuk konfirmasi.</span>
                                </div>
                            </div>
                        )}

                        <AnimatePresence>
                            {currentList?.map((bike) => (
                                <motion.div
                                    key={bike.id}
                                    layoutId={bike.id} // LayoutID for smooth morphing if IDs match
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, type: "spring" }}
                                    className={`bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer border relative ${isSpecial ? 'border-emerald-100' : 'border-gray-100'}`}
                                    onClick={() => onSelectBike(bike)}
                                >
                                    {/* Real-time Stock Badge */}
                                    {activeTab !== 'accessories' && (() => {
                                        const bikeUnits = fleet.filter(item => item.bike_id === bike.id);
                                        if (bikeUnits.length === 0) return null;
                                        
                                        const availableCount = bikeUnits.filter(item => item.status === 'Tersedia').length;
                                        
                                        return (
                                            <div className={`absolute top-4 left-4 z-20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md ${
                                                availableCount > 0 
                                                    ? 'bg-emerald-500 text-white' 
                                                    : 'bg-rose-500 text-white'
                                            }`}>
                                                {availableCount > 0 ? `Ready: ${availableCount} Unit` : 'Habis Dipesan'}
                                            </div>
                                        );
                                    })()}

                                    {/* Unit Tambahan Badge */}
                                    {(bike.isAdditional || activeTab === 'unit_tambahan') && (
                                        <div className="absolute top-4 right-4 z-20 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md animate-pulse">
                                            Bila Tersedia
                                        </div>
                                    )}
                                    {/* Diagonal Cut Image Container */}
                                    <div className="h-64 bg-gray-100 relative overflow-hidden">
                                        <div className={`absolute inset-0 transition-colors z-10 ${themeOverlay}`} />
                                        {bike.image ? (
                                            <img
                                                src={bike.image}
                                                alt={bike.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 select-none">
                                                <Camera size={44} className="mb-2 stroke-1 text-gray-400 group-hover:scale-110 transition-transform duration-500" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Foto Belum Tersedia</span>
                                            </div>
                                        )}

                                        {/* Sharp Badge */}
                                        <div className={`absolute bottom-0 left-0 px-6 py-2 rounded-tr-3xl z-20 shadow-lg ${isRegular ? 'bg-[#004aad]' : ''} text-white`} style={{ backgroundColor: isRegular ? '' : themeColor }}>
                                            <h3 className={`text-lg font-black italic tracking-wider ${!bike.image ? 'underline decoration-2 decoration-white underline-offset-4' : ''}`}>
                                                {bike.name}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-8">
                                        {/* Unit Tambahan description tag */}
                                        {(bike.isAdditional || activeTab === 'unit_tambahan') && (
                                            <div className="mb-4 inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg">
                                                ⚠️ UNIT TAMBAHAN (BILA TERSEDIA)
                                            </div>
                                        )}
                                    {/* Prices */}
                                    <div className="space-y-3 mb-6">
                                        {Object.entries(bike.prices).slice(0, 4).map(([hours, price]) => (
                                            <div key={hours} className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2 last:border-0 last:pb-0">
                                                <span className="text-gray-500 font-semibold text-sm">{hours} Jam</span>
                                                <span className={`text-xl font-black ${themeText}`}>
                                                    {price / 1000}<span className="text-sm align-top">K</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {bike.features?.length > 0 ? (
                                            bike.features.map((feat, idx) => (
                                                <span key={idx} className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${isSpecial ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                    <Check size={10} /> {feat}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] uppercase tracking-wider bg-gray-50 text-gray-400 font-bold px-3 py-1 rounded-full border border-gray-100">
                                                Unit Only
                                            </span>
                                        )}
                                    </div>

                                    <button className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2 relative overflow-hidden ${isSpecial ? 'bg-emerald-900 group-hover:bg-emerald-700' : 'bg-[#0a0a0a] group-hover:bg-[#004aad]'}`}>
                                        <span className="relative z-10">PILIH UNIT INI</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                )}
            </div>
        </div>
    );
}
