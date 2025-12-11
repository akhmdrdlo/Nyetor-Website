import { motion } from 'framer-motion';
import { Bike } from 'lucide-react';

export default function Hero({ onStart }) {
    return (
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=2000"
                    alt="Bandung Motor"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/30 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
                            <Bike size={48} className="text-[#00f3ff]" />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        NYETOR.<span className="text-[#00f3ff]">ID</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-300 mb-10 font-light">
                        Solusi Sewa Motor Terbaik di <span className="text-[#00f3ff] font-semibold">Bandung</span>.
                        <br className="hidden md:block" />
                        Unit Terawat, Harga Mahasiswa.
                    </p>

                    <button
                        onClick={onStart}
                        className="group relative px-8 py-4 bg-[#00f3ff] text-black font-bold text-lg rounded-full overflow-hidden shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_40px_rgba(0,243,255,0.6)] transition-all"
                    >
                        <span className="relative z-10">BOOKING SEKARANG</span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
