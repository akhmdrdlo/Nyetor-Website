import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { catalogData } from '../data';
import { Check } from 'lucide-react';

const categories = [
    { id: 'super_ekonomis', label: 'Super Ekonomis', color: 'bg-blue-600' },
    { id: 'ekonomis', label: 'Ekonomis Unit', color: 'bg-indigo-600' },
    { id: 'silver', label: 'Silver Unit', color: 'bg-gray-600' },
    { id: 'gold', label: 'Gold Unit', color: 'bg-yellow-600' },
    { id: 'accessories', label: 'Aksesoris', color: 'bg-red-600' },
];

// CONFIGURATION
const FORCE_SPECIAL_MODE = false; // Set to TRUE to disable Regular mode entirely (e.g. Peak Season)

export default function Catalog({ onSelectBike }) {
    const [priceMode, setPriceMode] = useState(FORCE_SPECIAL_MODE ? 'special' : 'regular'); // 'regular' | 'special'
    const [activeTab, setActiveTab] = useState('super_ekonomis');

    const isSpecial = priceMode === 'special';
    const themeColor = isSpecial ? '#991b1b' : '#004aad'; // Dark Red vs Brand Blue
    const themeText = isSpecial ? 'text-red-800' : 'text-[#004aad]';
    const themeGradient = isSpecial ? 'from-red-600 to-red-900' : 'from-[#004aad] to-[#00f3ff]';
    const themeBgAccent = isSpecial ? 'bg-red-50' : 'bg-blue-50';

    // Data Source Logic
    // If special, we just use the 'christmas' list directly (flat list).
    // If regular, we use the activeTab to filter.
    const currentList = isSpecial ? catalogData.christmas : catalogData[activeTab];

    return (
        <div className={`relative py-20 overflow-hidden transition-colors duration-700 ${isSpecial ? 'bg-red-50/30' : 'bg-[#f8f9fa]'}`}>
            {/* Dynamic Backgrounds */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/bandung.png"
                    alt="Background"
                    className={`w-full h-full object-cover opacity-10 grayscale contrast-125 transition-all duration-700 ${isSpecial ? 'sepia-[.5] hue-rotate-[-50deg]' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            {/* Decor Shapes */}
            <div className={`absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l to-transparent -skew-x-[20deg] translate-x-[20%] pointer-events-none transition-colors duration-700 ${isSpecial ? 'from-red-100/50' : 'from-blue-50/80'}`} />

            <div className="relative z-10 container mx-auto px-4">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img src="/Nyetor Logo Transparent.png" alt="Nyetor Logo" className="h-16 md:h-20 drop-shadow-md" />
                    </div>

                    <h2 className={`text-4xl md:text-5xl font-black mb-2 drop-shadow-sm uppercase tracking-tight transition-colors duration-500 ${themeText}`}>
                        PILIH UNIT <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>MOTOR</span>
                    </h2>

                    {/* Mode Toggle Switch (Only show if NOT forced special) */}
                    {!FORCE_SPECIAL_MODE ? (
                        <div className="flex justify-center mt-6 mb-8">
                            <div className="bg-white p-1.5 rounded-full shadow-lg border border-gray-200 flex relative">
                                {/* Animated Background Pill */}
                                <motion.div
                                    className={`absolute top-1.5 bottom-1.5 rounded-full shadow-md ${isSpecial ? 'bg-red-600' : 'bg-[#004aad]'}`}
                                    layoutId="modePill"
                                    initial={false}
                                    animate={{
                                        left: isSpecial ? '50%' : '1.5%',
                                        width: '48%'
                                    }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />

                                <button
                                    onClick={() => setPriceMode('regular')}
                                    className={`relative z-10 px-6 py-2 rounded-full font-bold text-sm md:text-base transition-colors duration-300 w-32 ${!isSpecial ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    HARGA BIASA
                                </button>
                                <button
                                    onClick={() => setPriceMode('special')}
                                    className={`relative z-10 px-6 py-2 rounded-full font-bold text-sm md:text-base transition-colors duration-300 w-32 ${isSpecial ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    🎄PERIODE NATARU
                                </button>
                            </div>
                        </div>
                    ) : (
                        // If Forced Special, show a static Title/Badge indicating Special Event
                        <div className="flex justify-center mt-4 mb-8">
                            <div className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm md:text-base shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                <span>✨ SPECIAL EVENT PRICING</span>
                            </div>
                        </div>
                    )}

                    {/* Conditional Description */}
                    <AnimatePresence mode="wait">
                        {isSpecial ? (
                            <motion.div
                                key="special-desc"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-3xl mx-auto bg-red-100 border border-red-200 text-red-800 p-4 rounded-xl shadow-inner mb-8"
                            >
                                <h3 className="font-black text-lg mb-1">🎄 PENYESUAIAN TARIF NATAL DAN TAHUN BARU 🎄</h3>
                                <p className="text-sm font-medium">
                                    Masa Berlaku: <strong>23 Desember 2025 - 3 Januari 2026</strong>* <br />
                                    <span className="text-xs opacity-75">*Dapat berubah sewaktu-waktu.</span>
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
                                Unit terawat, performa maksimal. Siap temani keliling Bandung!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Regular Categories Tabs (Only show if Regular Mode) */}
                {!isSpecial && (
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

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="wait">
                        {currentList?.map((bike) => (
                            <motion.div
                                key={bike.id}
                                layoutId={bike.id} // LayoutID for smooth morphing if IDs match
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, type: "spring" }}
                                className={`bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer border relative ${isSpecial ? 'border-red-100' : 'border-gray-100'}`}
                                onClick={() => onSelectBike(bike)}
                            >
                                {/* Diagonal Cut Image Container */}
                                <div className="h-64 bg-gray-100 relative overflow-hidden">
                                    <div className={`absolute inset-0 transition-colors z-10 ${isSpecial ? 'bg-red-600/5' : 'bg-[#004aad]/5'}`} />
                                    <img
                                        src={bike.image}
                                        alt={bike.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />

                                    {/* Sharp Badge */}
                                    <div className={`absolute bottom-0 left-0 px-6 py-2 rounded-tr-3xl z-20 shadow-lg ${isSpecial ? 'bg-red-600' : 'bg-[#004aad]'} text-white`}>
                                        <h3 className="text-lg font-black italic tracking-wider">{bike.name}</h3>
                                    </div>
                                </div>

                                <div className="p-6 pt-8">
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
                                        {bike.features.length > 0 ? (
                                            bike.features.map((feat, idx) => (
                                                <span key={idx} className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${isSpecial ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                    <Check size={10} /> {feat}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] uppercase tracking-wider bg-gray-50 text-gray-400 font-bold px-3 py-1 rounded-full border border-gray-100">
                                                Unit Only
                                            </span>
                                        )}
                                    </div>

                                    <button className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2 relative overflow-hidden ${isSpecial ? 'bg-red-900 group-hover:bg-red-700' : 'bg-[#0a0a0a] group-hover:bg-[#004aad]'}`}>
                                        <span className="relative z-10">PILIH UNIT INI</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
