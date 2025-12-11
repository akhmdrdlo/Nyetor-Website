import { motion } from 'framer-motion';
import { Bike } from 'lucide-react';

export default function Hero({ onStart }) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-0">
            {/* Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/bandung.png"
                    alt="Bandung Motor"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-[#0a0a0a]" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex justify-center mb-6">
                        {/* Use local logo with DARK glow */}
                        <div className="p-0 rounded-full bg-transparent">
                            <img
                                src="/Nyetor Logo Transparent.png"
                                alt="Nyetor Logo"
                                className="w-48 md:w-64 drop-shadow-[0_0_30px_rgba(0,74,173,0.8)] filter brightness-110"
                            />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
                        NYETOR.<span className="text-[#004aad]">ID</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white mb-10 font-medium drop-shadow-md">
                        Solusi Sewa Motor Terbaik di <span className="text-[#004aad] font-bold bg-white/10 px-2 rounded">Bandung</span>.
                        <br className="hidden md:block" />
                        Unit Terawat, Harga Mahasiswa.
                    </p>

                    <button
                        onClick={onStart}
                        className="group relative px-10 py-4 bg-[#004aad] text-white font-bold text-lg rounded-full overflow-hidden shadow-[0_0_20px_rgba(0,74,173,0.5)] hover:shadow-[0_0_40px_rgba(0,74,173,0.8)] hover:scale-105 transition-all"
                    >
                        <span className="relative z-10">BOOKING SEKARANG</span>
                        <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
