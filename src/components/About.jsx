import { motion } from 'framer-motion';

export default function About() {
    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Left: Logo */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 flex justify-center"
                    >
                        <img
                            src="/Nyetor Logo Transparent.png"
                            alt="Nyetor Logo"
                            className="w-3/4 md:w-full max-w-sm drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                        />
                    </motion.div>

                    {/* Right: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full md:w-1/2"
                    >
                        <h2 className="text-sm font-bold text-[#004aad] tracking-widest uppercase mb-2">Tentang Kami</h2>
                        <h3 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 leading-tight">
                            APA ITU <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004aad] to-blue-400">NYEWAIN MOTOR?</span>
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            Nyewain Motor (Nyetor) adalah penyedia layanan sewa motor terpercaya di Bandung yang mengutamakan <strong>kualitas, kemudahan,</strong> dan <strong>harga bersahabat</strong>. Kami hadir untuk menemani perjalananmu menjelajahi keindahan Kota Kembang.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            Sejak didirikan, kami berkomitmen menyediakan unit motor yang terawat prima, mulai dari matic hemat bahan bakar hingga unit premium untuk gaya maksimal.
                        </p>

                        <div className="flex gap-8 border-t border-gray-100 pt-8">
                            <div>
                                <h4 className="text-4xl font-black text-[#004aad]">20+</h4>
                                <p className="text-sm text-gray-500 font-medium mt-1">Ready Unit</p>
                            </div>
                            <div>
                                <h4 className="text-4xl font-black text-[#004aad]">24/7</h4>
                                <p className="text-sm text-gray-500 font-medium mt-1">Layanan Support</p>
                            </div>
                            <div>
                                <h4 className="text-4xl font-black text-[#004aad]">4.9</h4>
                                <p className="text-sm text-gray-500 font-medium mt-1">Rating Google</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
