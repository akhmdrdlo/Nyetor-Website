import { motion } from 'framer-motion';
import { ShieldCheck, Clock, PenTool as Tool, Sparkles } from 'lucide-react';

const services = [
    {
        icon: <ShieldCheck size={32} />,
        title: "Unit Terawat & Aman",
        desc: "Setiap motor rutin diservis untuk menjamin keamanan dan kenyamanan berkendara."
    },
    {
        icon: <Tool size={32} />,
        title: "Include Helm & Jas Hujan",
        desc: "Fasilitas lengkap! Dapat 2 helm SNI bersih dan jas hujan di setiap penyewaan."
    },
    {
        icon: <Clock size={32} />,
        title: "Sewa Fleksibel",
        desc: "Pilihan durasi beragam mulai dari 3 jam, harian, hingga mingguan sesuai kebutuhanmu."
    },
    {
        icon: <Sparkles size={32} />,
        title: "Antar Jemput Unit",
        desc: "Layanan antar jemput unit ke lokasi penginapan/stasiun (S&K Berlaku)."
    }
];

export default function Services() {
    return (
        <section className="py-20 bg-gray-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-[#004aad] rounded-full filter blur-[100px] opacity-5" />
                <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-400 rounded-full filter blur-[120px] opacity-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-100 rounded-full opacity-30" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-sm font-bold text-[#004aad] tracking-widest uppercase mb-2">Kenapa Memilih Kami?</h2>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                        MENYEDIAKAN APA SAJA?
                    </h3>
                    <p className="text-gray-500">
                        Kami tidak hanya menyewakan motor, tapi juga memberikan pengalaman terbaik liburan di Bandung.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:border-blue-200 transition-all group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#004aad] flex items-center justify-center mb-6 group-hover:bg-[#004aad] group-hover:text-white transition-colors duration-300">
                                {service.icon}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {service.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
