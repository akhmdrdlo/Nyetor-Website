import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { catalogData } from '../data';
import { Info, Check, AlertCircle } from 'lucide-react';

const categories = [
    { id: 'super_ekonomis', label: 'Super Ekonomis', color: 'bg-blue-600' },
    { id: 'ekonomis', label: 'Ekonomis Unit', color: 'bg-indigo-600' },
    { id: 'silver', label: 'Silver Unit', color: 'bg-gray-600' },
    { id: 'gold', label: 'Gold Unit', color: 'bg-yellow-600' },
    { id: 'accessories', label: 'Aksesoris', color: 'bg-red-600' },
];

export default function Catalog({ onSelectBike }) {
    const [activeTab, setActiveTab] = useState('super_ekonomis');

    return (
        <div className="relative py-20 bg-[#f8f9fa] overflow-hidden">
            {/* Background Gedung Sate & Sharp Shapes */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/bandung.png"
                    alt="Gedung Sate Background"
                    className="w-full h-full object-cover opacity-10 grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            {/* Dynamic Sharp Shapes - "Tech/Racing" Aesthetic */}
            <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-blue-50/80 to-transparent -skew-x-[20deg] translate-x-[20%] pointer-events-none" />
            <div className="absolute top-20 right-[5%] w-[200px] h-[400px] bg-[#004aad]/5 -skew-x-[20deg] pointer-events-none rounded-tl-[100px]" />
            <div className="absolute bottom-0 left-0 w-[60%] h-[300px] bg-gradient-to-t from-blue-100/40 to-transparent skew-y-3 pointer-events-none" />

            {/* Additional Decorative Lines */}
            <div className="hidden lg:block absolute top-[15%] left-[5%] w-[2px] h-[100px] bg-gradient-to-b from-[#004aad] to-transparent" />
            <div className="hidden lg:block absolute top-[15%] left-[5%] w-[100px] h-[2px] bg-gradient-to-r from-[#004aad] to-transparent" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <img src="/Nyetor Logo Transparent.png" alt="Nyetor Logo" className="h-16 md:h-20 drop-shadow-md" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#004aad] drop-shadow-sm uppercase tracking-tight">
                        PILIH UNIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004aad] to-[#00f3ff]">MOTOR</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
                        Unit terawat, performa maksimal. Siap temani keliling Bandung!
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 relative overflow-hidden group ${activeTab === cat.id
                                ? `${cat.color} text-white shadow-lg shadow-blue-500/30 scale-105 ring-2 ring-offset-2 ring-[#004aad]`
                                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <span className="relative z-10">{cat.label}</span>
                            {activeTab !== cat.id && (
                                <div className="absolute inset-0 bg-gray-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="wait">
                        {catalogData[activeTab]?.map((bike) => (
                            <motion.div
                                key={bike.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, type: "spring" }}
                                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 relative"
                                onClick={() => onSelectBike(bike)}
                            >
                                {/* Diagonal Cut Image Container */}
                                <div className="h-64 bg-gray-100 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[#004aad]/5 group-hover:bg-transparent transition-colors z-10" />
                                    <img
                                        src={bike.image}
                                        alt={bike.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />

                                    {/* Sharp Badge */}
                                    <div className="absolute bottom-0 left-0 bg-[#004aad] text-white px-6 py-2 rounded-tr-3xl z-20 shadow-lg">
                                        <h3 className="text-lg font-black italic tracking-wider">{bike.name}</h3>
                                    </div>
                                </div>

                                <div className="p-6 pt-8">
                                    {/* Prices */}
                                    <div className="space-y-3 mb-6">
                                        {Object.entries(bike.prices).slice(0, 4).map(([hours, price]) => (
                                            <div key={hours} className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2 last:border-0 last:pb-0">
                                                <span className="text-gray-500 font-semibold text-sm">{hours} Jam</span>
                                                <span className="text-xl font-black text-[#004aad]">
                                                    {price / 1000}<span className="text-sm align-top">K</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {bike.features.length > 0 ? (
                                            bike.features.map((feat, idx) => (
                                                <span key={idx} className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                                                    <Check size={10} /> {feat}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] uppercase tracking-wider bg-gray-50 text-gray-400 font-bold px-3 py-1 rounded-full border border-gray-100">
                                                Unit Only
                                            </span>
                                        )}
                                    </div>

                                    <button className="w-full py-4 bg-[#0a0a0a] text-white rounded-2xl font-bold shadow-lg group-hover:bg-[#004aad] transition-colors flex items-center justify-center gap-2 relative overflow-hidden">
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
