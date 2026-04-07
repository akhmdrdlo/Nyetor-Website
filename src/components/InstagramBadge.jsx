import { Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InstagramBadge() {
    return (
        <motion.a
            href="https://www.instagram.com/nyewainmotornyetor/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 1, bounce: 0.5 }}
            className="fixed bottom-6 left-6 z-50 group flex items-center shadow-2xl"
        >
            {/* The Badge */}
            <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-3 md:p-4 rounded-full text-white shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full"></div>
                <Instagram size={28} className="relative z-10 animate-pulse group-hover:animate-none" />
            </div>

            {/* Hover Text Banner */}
            <div className="absolute left-full ml-3 bg-white px-4 py-2 rounded-2xl shadow-xl font-bold text-sm text-gray-800 whitespace-nowrap opacity-0 md:group-hover:opacity-100 -translate-x-4 md:group-hover:translate-x-0 transition-all duration-300 pointer-events-none hidden md:block">
                Lihat Testimoni Kami! <br/>
                <span className="text-xs font-normal text-pink-600">@nyewainmotornyetor</span>
                
                {/* Small Triangle Pointer */}
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 border-[6px] border-transparent border-r-white"></div>
            </div>
        </motion.a>
    );
}
