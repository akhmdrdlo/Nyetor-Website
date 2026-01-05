
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Hero({ onStart }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const textY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

    return (
        <div ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* Parallax Background */}
            <motion.div
                style={{ y: yBackground }}
                className="absolute inset-0 z-0"
            >
                <img
                    src="/bandung.png"
                    alt="Bandung City View"
                    className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#f8f9fa] z-10" />
            </motion.div>

            {/* Content */}
            <motion.div
                style={{ opacity: textOpacity, y: textY }}
                className="relative z-20 text-center px-4 max-w-4xl mx-auto"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <img
                        src="/Nyetor Logo Transparent.png"
                        alt="Nyetor Logo"
                        className="h-24 md:h-32 mx-auto mb-8 drop-shadow-2xl"
                    />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-4xl md:text-7xl font-thin tracking-tight text-white mb-6 uppercase"
                >
                    Nyewain <span className="font-black text-[#004aad]">Motor</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-lg md:text-xl text-gray-200 font-light tracking-wide max-w-2xl mx-auto mb-12"
                >
                    Jelajahi setiap sudut kota kembang dengan kebebasan tanpa batas.
                    <br className="hidden md:block" /> Unit terawat, harga bersahabat, pengalaman tak terlupakan.
                </motion.p>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    onClick={onStart}
                    className="cursor-pointer flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors group"
                >
                    <span className="text-xs uppercase tracking-[0.3em] font-medium">Scroll to Explore</span>
                    <div className="p-2 rounded-full border border-white/20 group-hover:border-white/60 transition-colors animate-bounce">
                        <ChevronDown size={20} />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

