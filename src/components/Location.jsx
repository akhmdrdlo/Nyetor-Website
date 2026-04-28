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

// Coordinates
const MARKAS_1 = [-6.930130, 107.715293]; // Cipadung
const MARKAS_2 = [-6.945500, 107.727500]; // Bumi Harapan Cimekar
const MAP_CENTER = [-6.937815, 107.721396]; // Center between the two

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
                    <MapContainer center={MAP_CENTER} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={MARKAS_1}>
                            <Popup>
                                <strong>Markas 1: Pusat</strong> <br />
                                Terusan Gang Kujang, Cipadung.
                            </Popup>
                        </Marker>
                        <Marker position={MARKAS_2}>
                            <Popup>
                                <strong>Markas 2: Cimekar</strong> <br />
                                Bumi Harapan Blok CC9 No. 37.
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>

                <div className="flex flex-col md:flex-row justify-center mt-8 gap-4">
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=-6.930130,107.715293"
                        target="_blank"
                        rel="noreferrer"
                        className="px-8 py-3 bg-[#0a0a0a] text-white rounded-full font-bold shadow-lg hover:bg-gray-800 transition-transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        Peta Markas 1 (Cipadung)
                    </a>
                    <a
                        href="https://maps.app.goo.gl/TF7GWxfpSB6Tnwas7"
                        target="_blank"
                        rel="noreferrer"
                        className="px-8 py-3 bg-[#004aad] text-white rounded-full font-bold shadow-lg hover:bg-blue-800 transition-transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        Peta Markas 2 (Cimekar)
                    </a>
                </div>
            </div>
        </section>
    );
}
