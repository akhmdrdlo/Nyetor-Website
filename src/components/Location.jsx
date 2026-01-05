import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// Coordinate Garasi Nyetor (Based on Address: Terusan Gang Kujang, Cipadung)
// Approx Coords for Cipadung, Cibiru area: -6.9248, 107.7206
const position = [-6.9248, 107.7206];

export default function Location() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-sm font-bold text-[#004aad] tracking-widest uppercase mb-2">Lokasi Kami</h2>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900">
                        TEMUKAN GARASI KAMI
                    </h3>
                </div>

                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-[400px] md:h-[500px] relative z-0">
                    <MapContainer center={position} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={position}>
                            <Popup>
                                <strong>Garasi Nyetor.id</strong> <br />
                                Terusan Gang Kujang, Cipadung.
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>

                <div className="flex justify-center mt-8">
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=Terusan+Gang+Kujang,+Kp+Jl.+Desa+Cipadung,+Cipadung,+Kec.+Cibiru,+Kota+Bandung,+Jawa+Barat+40614"
                        target="_blank"
                        rel="noreferrer"
                        className="px-8 py-3 bg-[#004aad] text-white rounded-full font-bold shadow-lg hover:bg-blue-800 transition-transform hover:scale-105 flex items-center gap-2"
                    >
                        Buka di Google Maps
                    </a>
                </div>
            </div>
        </section>
    );
}
