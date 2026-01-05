import { Instagram, MessageCircle, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#0a0a0a] text-white pt-20 pb-10 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    {/* Brand */}
                    <div>
                        <img
                            src="/Nyetor Logo Transparent.png"
                            alt="Nyetor Logo"
                            className="h-16 mb-6 brightness-200 grayscale contrast-150"
                        />
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Partner perjalanan terbaikmu di Bandung. Sewa motor mudah, murah, dan terpercaya.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/nyewainmotornyetor/" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#004aad] transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="https://wa.me/6287818747396" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 transition-colors">
                                <MessageCircle size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xl font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-[#004aad] transition-colors">Home</a></li>
                            <li><a href="#catalog-section" className="hover:text-[#004aad] transition-colors">Katalog Motor</a></li>
                            <li><a href="#" className="hover:text-[#004aad] transition-colors">Syarat & Ketentuan</a></li>
                            <li><a href="#" className="hover:text-[#004aad] transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xl font-bold mb-6">Hubungi Kami</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="shrink-0 mt-1" size={18} />
                                <span>Terusan Gang Kujang, Kp Jl. Desa Cipadung, Cipadung, Kec. Cibiru, Kota Bandung, Jawa Barat 40614</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <MessageCircle className="shrink-0" size={18} />
                                <span>0878-1874-7396 (Admin)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Nyetor.id. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
