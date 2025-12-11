import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { catalogData } from '../data';
import { Info, Check, AlertCircle } from 'lucide-react';

const categories = [
    { id: 'super_ekonomis', label: 'Super Ekonomis', color: 'bg-blue-600' },
    { id: 'ekonomis', label: 'Ekonomis Unit', color: 'bg-indigo-600' },
    { id: 'silver', label: 'Silver Unit', color: 'bg-gray-600' },
    { id: 'gold', label: 'Gold Unit', color: 'bg-yellow-600' },
];

export default function Catalog({ onSelectBike }) {
    const [activeTab, setActiveTab] = useState('super_ekonomis');

    return (
        <div className="py-10 bg-white">
            <h2 className="text-4xl font-extrabold mb-4 text-center text-[#004aad]">PILIH UNIT MOTOR</h2>
            <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
                Kualitas terbaik dengan harga mahasiswa. Temukan unit yang pas untuk kebutuhanmu.
            </p>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`px-6 py-2 rounded-full border border-gray-200 transition-all font-bold ${activeTab === cat.id
                                ? 'bg-[#004aad] text-white shadow-lg scale-105'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="wait">
                    {catalogData[activeTab]?.map((bike) => (
                        <motion.div
                            key={bike.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all group cursor-pointer shadow-md"
                            onClick={() => onSelectBike(bike)}
                        >
                            <div className="h-56 bg-gray-50 overflow-hidden relative">
                                {/* Image Placeholder */}
                                <img
                                    src={bike.image}
                                    alt={bike.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <h3 className="text-xl font-black text-white drop-shadow-md uppercase bg-[#004aad]/80 px-2 py-1 rounded">{bike.name}</h3>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Price List Mini View - Show formatted neatly */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {Object.entries(bike.prices).slice(0, 4).map(([hours, price]) => (
                                        <div key={hours} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                                            <span className="font-semibold text-gray-600">{hours} Jam</span>
                                            <span className="text-[#004aad] font-bold">{price / 1000}K</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Features */}
                                <div className="flex flex-wrap gap-2 mb-6 min-h-[1.5rem]">
                                    {bike.features.map((feat, idx) => (
                                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                                            <Check size={12} /> {feat}
                                        </span>
                                    ))}
                                    {/* Default Sarung Tangan badge if generic? logic in data is better */}
                                </div>

                                <button className="w-full py-3 bg-[#004aad] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 group-hover:bg-[#003380] transition-colors flex items-center justify-center gap-2">
                                    BOOKING SEKARANG
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
