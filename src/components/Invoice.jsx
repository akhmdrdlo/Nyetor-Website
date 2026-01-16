import React, { forwardRef } from 'react';

const Invoice = forwardRef(({ data }, ref) => {
    if (!data) return null;

    const { name, phone, bike, duration, helmet, total, shippingCost, shippingZoneLabel, titikAntar, titikJemput, date, orderNo } = data;

    return (
        <div ref={ref} id="invoice-template" className="bg-white text-black p-10 w-[800px] mx-auto font-sans relative">
            {/* Top Bar Decoration */}
            <div className="absolute top-0 left-0 w-full h-4 bg-[#004aad]"></div>

            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4 mb-6 mt-6">
                <div className="flex items-center gap-4">
                    <img src="/Nyetor Logo Transparent.png" alt="Nyetor Logo" className="h-16" />
                    <div>
                        <h2 className="text-xl font-bold text-[#004aad] uppercase tracking-wide">NYETOR.ID</h2>
                        <p className="text-xs text-gray-500 leading-snug">
                            Gang Sanusi, Cipadung, Cibiru, Bandung<br />
                            WA: 087818747396 | IG: @nyewainmotornyetor
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold text-gray-200 tracking-widest">INVOICE</h2>
                    <p className="mt-1 font-semibold text-gray-500 text-sm">{date}</p>
                    <div className="mt-2 inline-block border-2 border-red-600 text-red-600 px-2 py-0.5 font-bold text-sm rounded transform -rotate-6">
                        BELUM LUNAS
                    </div>
                </div>
            </div>

            {/* Details - Compact */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 flex justify-between items-center border border-gray-100">
                <div>
                    <strong className="text-xs uppercase text-gray-400 tracking-wider">Penyewa</strong>
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg text-[#004aad]">{name}</span>
                        <span className="text-sm text-gray-600">({phone})</span>
                    </div>
                </div>
                {/* Removed Order No as requested to save space */}
            </div>

            {/* Table */}
            <table className="w-full mb-8 border-collapse">
                <thead>
                    <tr className="bg-[#004aad] text-white">
                        <th className="p-3 text-left w-16 rounded-tl-lg">NO</th>
                        <th className="p-3 text-left">ITEM DESCRIPTION</th>
                        <th className="p-3 text-right rounded-tr-lg">COST</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-100/50">
                        <td className="p-4 font-bold text-gray-500">1</td>
                        <td className="p-4">
                            <span className="font-bold text-lg text-gray-800">Rental {duration} Jam</span>
                            <br />
                            <span className="text-sm text-[#004aad] font-semibold">{bike.name}</span>
                            <div className="mt-2 text-[10px] text-gray-500 font-mono">
                                <div>Mulai: {data.startDate} {data.startTime}</div>
                                <div>Selesai: {data.endDateInfo?.date} {data.endDateInfo?.time}</div>
                            </div>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-gray-700">
                            {/* Calculate Base Price: Total - Helmet (10k) - Shipping */}
                            IDR {(total - (helmet ? 10000 : 0) - (shippingCost || 0)).toLocaleString('id-ID')}
                        </td>
                    </tr>
                    {helmet && (
                        <tr className="border-b border-gray-100/50">
                            <td className="p-4 font-bold text-gray-500">2</td>
                            <td className="p-4 font-bold text-gray-800">Tambahan Helm</td>
                            <td className="p-4 text-right font-mono font-bold text-gray-700">IDR 10.000</td>
                        </tr>
                    )}
                    {shippingCost > 0 && (
                        <tr className="border-b border-gray-100/50">
                            <td className="p-4 font-bold text-gray-500 valign-top pt-5">{helmet ? 3 : 2}</td>
                            <td className="p-4">
                                <span className="font-bold text-gray-800 text-lg">Biaya Antar/Jemput (PP)</span>
                                <div className="mt-2 text-xs text-gray-500 space-y-1">
                                    <p><strong className="text-[#004aad]">Zone:</strong> {shippingZoneLabel}</p>
                                    <p><strong className="text-[#004aad]">Antar:</strong> {titikAntar}</p>
                                    <p><strong className="text-[#004aad]">Jemput:</strong> {titikJemput}</p>
                                </div>
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-gray-700 valign-top pt-5">
                                IDR {shippingCost.toLocaleString('id-ID')}
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot className="bg-[#ffcc00] text-black">
                    <tr>
                        <td colSpan="2" className="p-4 text-right font-black uppercase text-sm tracking-wide">Grand Total</td>
                        <td className="p-4 text-right text-2xl font-black">IDR {total.toLocaleString('id-ID')}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Terms */}
            <div className="text-xs text-gray-600 mt-8 mb-12">
                <h4 className="font-bold mb-2 uppercase text-[#004aad]">Syarat dan Ketentuan</h4>
                <ol className="list-decimal pl-5 space-y-1">
                    <li>Penyewa hanya memiliki hak penggunaan saat masa penyewaan bukan Hak memiliki, artinya penyewa <strong className="text-red-600">DILARANG</strong> memindahtangankan.</li>
                    <li>Penyewa <strong className="text-red-600">DILARANG</strong> mengubah dan atau mengganti spek motor, sparepart motor tanpa izin.</li>
                    <li>Segala bentuk penilaian dan tindakan kepolisian menjadi tanggung jawab penyewa.</li>
                    <li>Segala bentuk kehilangan/kerusakan menjadi tanggung jawab <strong className="text-red-600">SEPENUHNYA</strong> penyewa.</li>
                    <li><strong className="text-black">WAKTU</strong>: Penyewa hanya boleh menikmati hak penggunaan motor sesuai dengan perjanjian lisan atau pun tulisan.</li>
                </ol>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end px-8 text-center mt-10">
                <div className="w-48">
                    <p className="mb-4 italic text-sm">Pemilik</p>
                    {/* Placeholder Signature */}
                    <div className="h-16 flex items-end justify-center relative">
                        <img src="/ttd_bos.png" alt="Signature" className="h-20 object-contain absolute bottom-0" />
                    </div>

                    <p className="border-t border-black font-bold pt-2 mt-2">Rafif Sunu Fauzi</p>
                    <p className="text-xs font-bold text-[#004aad]">NYETOR.ID</p>
                </div>
                <div className="w-48">
                    <p className="mb-20 italic text-sm">Menyetujui</p>
                    <p className="border-t border-black font-bold pt-2">{name || 'Customer'}</p>
                    <p className="text-xs font-bold text-black">Customer</p>
                </div>
            </div>

            {/* Footer Decoration Page 1 */}
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gray-100 flex items-center justify-between px-8 text-[10px] text-gray-400">
                <span>instagram: @nyewainmotornyetor</span>
                <span>tiktok: @nyetor.id</span>
            </div>

            {/* --- PAGE BREAK --- */}
            <div className="html2pdf__page-break"></div>

            {/* --- PAGE 2: ACTION ITEMS --- */}
            <div className="bg-white text-black pt-20 pb-10 px-10 h-[1080px] font-sans relative flex flex-col items-center text-center">
                {/* Top Bar Decoration */}
                <div className="absolute top-0 left-0 w-full h-4 bg-[#004aad]"></div>

                <img src="/Nyetor Logo Transparent.png" alt="Nyetor Logo" className="h-32 mb-8 drop-shadow-lg" />

                <h1 className="text-4xl font-black text-[#004aad] mb-4">LANGKAH TERAKHIR</h1>
                <p className="text-xl text-gray-600 mb-12 max-w-lg leading-relaxed">
                    Halo <strong>{name}</strong>, terima kasih telah booking di <strong>NYETOR.ID</strong>.<br />
                    Untuk memproses pesanan Anda, kami membutuhkan data jaminan (KTP) Anda.
                </p>

                <div className="bg-blue-50 p-8 rounded-2xl border-2 border-blue-100 mb-12 w-full max-w-xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">KLIK TOMBOL DI BAWAH</h2>
                    <p className="text-gray-500 mb-8">Silahkan klik tombol berikut untuk melengkapi formulir data diri & upload foto KTP.</p>

                    <a
                        href={data.googleFormUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-[#004aad] text-white text-2xl font-bold py-6 px-12 rounded-xl shadow-xl hover:bg-blue-800 transition-transform hover:scale-105"
                        style={{ textDecoration: 'none' }} // Ensure it looks good in PDF
                    >
                        ISI FORMULIR DATA DIRI ➔
                    </a>

                    <div className="bg-gray-100 p-4 rounded-lg text-left w-full break-all border border-gray-300 mt-6">
                        <p className="text-xs text-gray-500 font-bold mb-1">LINK ALTERNATIF (COPY & PASTE)</p>
                        <p className="font-mono text-[10px] text-gray-600 select-all">
                            {data.googleFormUrl || '-'}
                        </p>
                    </div>
                </div>

                <p className="text-gray-400 text-sm mt-auto mb-20">
                    *Link di atas dapat diklik langsung dari dokumen PDF ini.<br />
                    Atau scan QR Code jika tersedia.
                </p>

                {/* Footer Decoration Page 2 */}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gray-100 flex items-center justify-between px-8 text-[10px] text-gray-400">
                    <span>instagram: @nyewainmotornyetor</span>
                    <span>Page 2 of 2</span>
                </div>
            </div>
        </div>
    );
});

export default Invoice;
