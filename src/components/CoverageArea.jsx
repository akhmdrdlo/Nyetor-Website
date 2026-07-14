import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Info, Map as MapIcon, ShieldAlert } from 'lucide-react';
import { SHIPPING_ZONES } from '../data';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LUAR_KOTA_DATA = [
    // Free
    { name: "Garut Kota", pos: [-7.2279, 107.9087], price: "Free" },
    { name: "Tasik Kota", pos: [-7.3274, 108.2140], price: "Free" },
    { name: "Singaparna", pos: [-7.3486, 108.1118], price: "Free" },
    { name: "Sumedang Barat", pos: [-6.9018, 107.8206], price: "Free" },
    { name: "Subang Ciater", pos: [-6.7371, 107.6585], price: "Free" },
    { name: "Cianjur Kota", pos: [-6.8168, 107.1425], price: "Free" },

    // Rp 15.000
    { name: "Garut Selatan", pos: [-7.6416, 107.6974], price: "Rp 15.000" },
    { name: "Pangandaran", pos: [-7.6975, 108.6493], price: "Rp 15.000 / Rp 35.000" },
    { name: "Ciamis", pos: [-7.3253, 108.3533], price: "Rp 15.000" },
    { name: "Tasik Selatan", pos: [-7.7478, 108.0125], price: "Rp 15.000" },
    { name: "Cianjur Selatan", pos: [-7.4526, 107.1517], price: "Rp 15.000" },
    { name: "Sumedang Kota", pos: [-6.8375, 107.9258], price: "Rp 15.000" },

    // Rp 20.000
    { name: "Banjar", pos: [-7.3750, 108.5322], price: "Rp 20.000" },
    { name: "Kuningan", pos: [-6.9757, 108.4800], price: "Rp 20.000" },
    { name: "Majalengka", pos: [-6.8365, 108.2274], price: "Rp 20.000" },

    // Rp 25.000
    { name: "Subang Kota", pos: [-6.5683, 107.7607], price: "Rp 25.000" },
    { name: "Purwakarta", pos: [-6.5562, 107.4423], price: "Rp 25.000" },
    { name: "Cikampek", pos: [-6.4026, 107.4560], price: "Rp 25.000" },

    // Rp 30.000
    { name: "Karawang Kota", pos: [-6.3079, 107.2917], price: "Rp 30.000" },
    { name: "Subang Utara", pos: [-6.2829, 107.8173], price: "Rp 30.000" },
    { name: "Indramayu", pos: [-6.3275, 108.3249], price: "Rp 30.000" },
    { name: "Cikarang", pos: [-6.2911, 107.1706], price: "Rp 30.000" },

    // Rp 35.000
    { name: "Sukabumi", pos: [-6.9200, 106.9275], price: "Rp 35.000" },
    { name: "Bogor", pos: [-6.5971, 106.8060], price: "Rp 35.000" },
    { name: "Depok", pos: [-6.4025, 106.7942], price: "Rp 35.000" },
    { name: "Kota Bekasi", pos: [-6.2383, 106.9756], price: "Rp 35.000" },

    // Rp 40.000
    { name: "Jakarta", pos: [-6.2088, 106.8456], price: "Rp 40.000" },
    { name: "Tegal", pos: [-6.8694, 109.1402], price: "Rp 40.000" },
    { name: "Brebes", pos: [-6.8706, 109.0436], price: "Rp 40.000" },
    { name: "Tangerang", pos: [-6.1702, 106.6403], price: "Rp 40.000" },

    // Rp 45.000
    { name: "Cilacap", pos: [-7.7118, 109.0069], price: "Rp 45.000" },

    // Rp 50.000
    { name: "Serang", pos: [-6.1200, 106.1503], price: "Rp 50.000" },
    { name: "Banyumas", pos: [-7.5256, 109.2968], price: "Rp 50.000" },
    { name: "Pemalang", pos: [-6.8887, 109.3803], price: "Rp 50.000" }
];

const ZONE_COORDS = {
    'Zone A': [-6.935, 107.712],
    'Zone B': [-6.920, 107.725],
    'Zone C': [-6.905, 107.715],
    'Zone D': [-6.915, 107.690],
    'Zone E': [-6.940, 107.732],
    'Zone F': [-6.955, 107.765],
    'Zone G': [-6.925, 107.675],
    'Zone H': [-6.938, 107.665],
    'Zone I': [-6.920, 107.636],
    'Zone J': [-6.955, 107.630],
    'Zone K': [-6.915, 107.608],
    'Zone L': [-6.890, 107.575],
    'Zone M': [-6.825, 107.620]
};

export default function CoverageArea({ shippingZones = [], luarKotaData = [] }) {
    const activeZones = shippingZones && shippingZones.length > 0 ? shippingZones : SHIPPING_ZONES;

    const activeLuarKota = luarKotaData && luarKotaData.length > 0 ? luarKotaData : LUAR_KOTA_DATA;

    // Group out-of-town cities by price for the text overview list
    const groupedByPrice = {};
    activeLuarKota.forEach(loc => {
        if (!groupedByPrice[loc.price]) {
            groupedByPrice[loc.price] = [];
        }
        groupedByPrice[loc.price].push(loc.name);
    });

    return (
        <section className="py-20 bg-gray-50 border-t border-gray-200" id="coverage-area">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-sm font-bold text-[#004aad] tracking-widest uppercase mb-2">Area Cakupan & Tarif</h2>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase">
                        BIAYA ANTAR LOKAL & LUAR KOTA
                    </h3>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Cek estimasi biaya pengantaran unit ke lokasimu, atau biaya tambahan jika unit dibawa keluar area Bandung Raya. Note: Sewa 3 jam tidak bisa diantarkan.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* SEBANDUNGEUN SECTION */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                        <div className="p-6 bg-[#004aad] text-white">
                            <h4 className="text-xl font-black flex items-center gap-2">
                                <MapIcon size={24} /> BIAYA ANTAR SEBANDUNGEUN
                            </h4>
                            <p className="text-blue-100 text-sm mt-1">Tarif pengantaran unit ke lokasi Anda (Sekitar Garasi)</p>
                        </div>
                        
                        {/* Map */}
                        <div className="h-64 md:h-80 relative z-0 border-b border-gray-100">
                            <MapContainer center={[-6.935, 107.695]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {activeZones.map((loc, idx) => {
                                    const coords = ZONE_COORDS[loc.zone_name] || [-6.930, 107.715];
                                    return (
                                        <Marker key={idx} position={coords}>
                                            <Popup>
                                                <div className="text-center max-w-xs">
                                                    <strong className="block text-[#004aad] uppercase font-black">{loc.zone_name}</strong>
                                                    <span className="font-bold text-gray-700 block text-xs">Rp {Number(loc.price).toLocaleString('id-ID')}</span>
                                                    <p className="text-[10px] text-gray-500 mt-1 leading-normal">{loc.detail}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        </div>

                        {/* Text List */}
                        <div className="p-6 flex-1 bg-white flex flex-col justify-between overflow-hidden">
                            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                {activeZones.map((loc, idx) => (
                                    <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-gray-900 font-extrabold uppercase">{loc.zone_name || loc.label?.split(' ')[0] || `Zone ${String.fromCharCode(65 + idx)}`}</span>
                                            <span className="font-black text-[#004aad] bg-blue-50 px-3 py-1 rounded-full text-xs shrink-0">
                                                Rp {Number(loc.price).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{loc.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* LUAR KOTA SECTION */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                        <div className="p-6 bg-orange-600 text-white">
                            <h4 className="text-xl font-black flex items-center gap-2">
                                <ShieldAlert size={24} /> CHARGE LUAR KOTA
                            </h4>
                            <p className="text-orange-100 text-sm mt-1">Biaya tambahan izin membawa unit ke luar area Bandung Raya</p>
                        </div>
                        
                        {/* Map */}
                        <div className="h-64 md:h-80 relative z-0 border-b border-gray-100">
                            <MapContainer center={[-6.9175, 107.6191]} zoom={8} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {activeLuarKota.map((loc, idx) => (
                                    <Marker key={idx} position={loc.pos}>
                                        <Popup>
                                            <div className="text-center">
                                                <strong className="block text-orange-600">{loc.name}</strong>
                                                <span className="font-bold text-gray-700">{loc.price}</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>

                        {/* Provisions */}
                        <div className="p-6 flex-1 bg-white flex flex-col">
                            <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl p-4 mb-4 shadow-inner">
                                <h5 className="font-black flex items-center gap-2 mb-2 text-sm uppercase">
                                    <Info size={18} /> KETENTUAN PENTING:
                                </h5>
                                <ul className="text-xs space-y-2 list-decimal list-inside font-medium leading-relaxed">
                                    <li><strong>Varian Super Ekonomis</strong> <span className="text-red-600">tidak diijinkan</span> ke luar kota.</li>
                                    <li>Konfirmasi terlebih dahulu kepada admin.</li>
                                    <li>Biaya dibayarkan 1 kali di awal bersamaan rental.</li>
                                    <li><span className="text-red-600 font-bold">DILARANG</span> membawa unit selain pada list resmi.</li>
                                    <li>Jaminan wajib lengkap.</li>
                                </ul>
                            </div>

                            <div className="text-xs space-y-3 text-gray-700 h-40 overflow-y-auto pr-2 custom-scrollbar flex-1 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                                {Object.entries(groupedByPrice).map(([price, cities], idx) => (
                                    <div key={idx} className="flex justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                                        <span className="pr-4 leading-relaxed">{cities.join(', ')}</span> 
                                        <strong className={`${price.toLowerCase() === 'free' ? 'text-green-600 bg-green-100 px-2 py-1 rounded-md' : 'text-orange-600'} shrink-0 self-center`}>
                                            {price}
                                        </strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
