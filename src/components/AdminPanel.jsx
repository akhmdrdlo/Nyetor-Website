import { useState, useEffect, useRef } from 'react';
import { supabase, creds } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    MapPin, 
    User, 
    Check, 
    X, 
    AlertTriangle, 
    Trash2, 
    Edit, 
    Plus, 
    Search, 
    FileSpreadsheet, 
    Settings, 
    LogOut, 
    BarChart2, 
    Lock, 
    Wrench, 
    Download, 
    Upload, 
    RefreshCw, 
    AlertCircle, 
    ChevronLeft, 
    ChevronRight,
    MessageCircle,
    Info,
    DollarSign,
    FileText,
    Sun,
    Moon
} from 'lucide-react';
import { catalogData, SHIPPING_ZONES } from '../data';

export default function AdminPanel({ onClose }) {
    // Supabase Config States
    const isDbConfigured = creds.isConfigured;
    const [isLoading, setIsLoading] = useState(false);

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState('');

    // Admin Dashboard Active Tab
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'fleet' | 'booking' | 'logs' | 'backup'
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Database States
    const [fleet, setFleet] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isLoadingXlsx, setIsLoadingXlsx] = useState(false);

    // Rent Extension Modal state
    const [extendingLog, setExtendingLog] = useState(null);
    const [extensionForm, setExtensionForm] = useState({ additionalHours: 24, additionalFee: '' });

    // Advanced log filters state
    const [logFilterSearch, setLogFilterSearch] = useState('');
    const [logFilterStatus, setLogFilterStatus] = useState('Semua'); // 'Semua' | 'Aktif' | 'Selesai'
    const [logFilterDelivery, setLogFilterDelivery] = useState('Semua'); // 'Semua' | 'Kirim (Delivery)' | 'Ambil Sendiri'
    const [logFilterBike, setLogFilterBike] = useState('Semua');
    const [logFilterStartDate, setLogFilterStartDate] = useState('');
    const [logFilterEndDate, setLogFilterEndDate] = useState('');

    // Form inputs state
    const [bookingForm, setBookingForm] = useState({
        renterName: '',
        whatsapp: '',
        unitId: '',
        guarantees: [], // array of selected docs
        customGuarantee: '',
        startDate: '',
        startTime: '',
        duration: 24, // default 24 hours
        isDelivery: false,
        deliveryZonePrice: 0,
        deliveryAddress: '',
        deliveryStaff: '',
        customRentalFee: ''
    });

    // Smart Dropdowns
    const [bikeSearchQuery, setBikeSearchQuery] = useState('');
    const [isBikeDropdownOpen, setIsBikeDropdownOpen] = useState(false);
    const [zoneSearchQuery, setZoneSearchQuery] = useState('');
    const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);

    // Fleet management unit form state
    const [newUnitForm, setNewUnitForm] = useState({
        bikeId: '',
        plate: '',
        color: '',
        status: 'Tersedia',
        note: ''
    });

    // Calendar state
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedCalDay, setSelectedCalDay] = useState(null);
    const [calPopupData, setCalPopupData] = useState([]);

    // CSV/XLSX Import Preview Modal State
    const [importPreview, setImportPreview] = useState(null); // { units: [], logs: [], warnings: [] }
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Editable status mapping for inline fleet modifications
    const [editingUnitId, setEditingUnitId] = useState(null);
    const [editForm, setEditForm] = useState({ plate: '', color: '', status: 'Tersedia', note: '' });

    // Settings page passwords
    const [settingsForm, setSettingsForm] = useState({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [settingsMsg, setSettingsMsg] = useState({ text: '', type: 'success' });
    const [dbPricing, setDbPricing] = useState([]);
    const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'dark');



    // Load data from Supabase
    const loadFromSupabase = async () => {
        if (!supabase) return;
        
        try {
            setIsLoading(true);
            
            // Fetch Fleet
            const { data: fleetData, error: fleetErr } = await supabase
                .from('nyetor_fleet')
                .select('*')
                .order('name', { ascending: true });
                
            if (fleetErr) throw fleetErr;
            
            // Fetch Logs
            const { data: logsData, error: logsErr } = await supabase
                .from('nyetor_logs')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (logsErr) throw logsErr;

            // Fetch Pricing
            const { data: pricingData, error: pricingErr } = await supabase
                .from('nyetor_pricing')
                .select('*')
                .order('name', { ascending: true });

            if (pricingErr) throw pricingErr;

            // Map fleet rows
            const mappedFleet = (fleetData || []).map(row => ({
                id: row.id,
                bikeId: row.bike_id,
                name: row.name,
                plate: row.plate,
                color: row.color,
                status: row.status,
                note: row.note || ''
            }));

            // Map logs rows
            const mappedLogs = (logsData || []).map(row => ({
                id: row.id,
                renterName: row.renter_name,
                phone: row.phone,
                unitId: row.unit_id,
                bikeName: row.bike_name,
                plate: row.plate,
                color: row.color,
                guarantees: row.guarantees || [],
                startDate: row.start_date,
                startTime: row.start_time ? row.start_time.substring(0, 5) : '',
                duration: row.duration,
                endDate: row.end_date,
                endTime: row.end_time ? row.end_time.substring(0, 5) : '',
                status: row.status,
                isDelivery: row.is_delivery,
                deliveryZone: row.delivery_zone,
                deliveryAddress: row.delivery_address || '',
                deliveryStaff: row.delivery_staff || '',
                rentalFee: Number(row.rental_fee || 0),
                deliveryFee: Number(row.delivery_fee || 0),
                totalRevenue: Number(row.total_revenue || 0),
                createdAt: row.created_at
            }));

            setFleet(mappedFleet);
            setLogs(mappedLogs);
            setDbPricing(pricingData || []);
        } catch (err) {
            console.error("Failed to load from Supabase:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load initial authentication states & fetch Supabase data
    useEffect(() => {
        if (!supabase) return;

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsLoggedIn(true);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        });

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []);

    // Realtime changes listener subscription
    useEffect(() => {
        if (!supabase || !isLoggedIn) return;

        loadFromSupabase();

        // Subscribe to changes in fleet
        const fleetChannel = supabase
            .channel('fleet-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'nyetor_fleet' }, () => {
                loadFromSupabase();
            })
            .subscribe();

        // Subscribe to changes in logs
        const logsChannel = supabase
            .channel('logs-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'nyetor_logs' }, () => {
                loadFromSupabase();
            })
            .subscribe();

        // Subscribe to changes in pricing
        const pricingChannel = supabase
            .channel('pricing-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'nyetor_pricing' }, () => {
                loadFromSupabase();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(fleetChannel);
            supabase.removeChannel(logsChannel);
            supabase.removeChannel(pricingChannel);
        };
    }, [isLoggedIn]);

    // Handle Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError('');

        if (!supabase) {
            setAuthError('Supabase tidak terhubung!');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: usernameInput.trim(),
                password: passwordInput
            });

            if (error) throw error;

            setIsLoggedIn(true);
        } catch (err) {
            console.error("Login verification failed:", err);
            setAuthError('Email atau Password salah! ' + err.message);
        }
    };

    // Handle Logout
    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setIsLoggedIn(false);
    };

    // Change Password
    // Change Password / Email
    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setSettingsMsg({ text: '', type: 'success' });

        if (!supabase) {
            setSettingsMsg({ text: 'Database tidak terhubung!', type: 'error' });
            return;
        }

        try {
            if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmNewPassword) {
                setSettingsMsg({ text: 'Konfirmasi password baru tidak cocok!', type: 'error' });
                return;
            }

            const updates = {};
            if (settingsForm.newPassword) {
                updates.password = settingsForm.newPassword;
            }
            if (settingsForm.newUsername.trim()) {
                updates.email = settingsForm.newUsername.trim();
            }

            if (Object.keys(updates).length === 0) {
                setSettingsMsg({ text: 'Tidak ada data perubahan yang diisi!', type: 'error' });
                return;
            }

            const { error } = await supabase.auth.updateUser(updates);
            if (error) throw error;

            setSettingsMsg({ text: 'Kredensial berhasil diperbarui di Supabase Auth!', type: 'success' });
            setSettingsForm({
                currentPassword: '',
                newUsername: '',
                newPassword: '',
                confirmNewPassword: ''
            });
        } catch (err) {
            console.error("Settings update failed:", err);
            setSettingsMsg({ text: 'Gagal memperbarui: ' + err.message, type: 'error' });
        }
    };

    // Save motorbike price rates row to Supabase
    const handleSavePriceRow = async (bikeId, prices, isAdditional, category) => {
        if (!supabase) return;
        try {
            const { error } = await supabase
                .from('nyetor_pricing')
                .update({ 
                    prices, 
                    is_additional: isAdditional,
                    category: category
                })
                .eq('id', bikeId);
            
            if (error) throw error;
            alert('Tarif unit berhasil diperbarui!');
            loadFromSupabase();
        } catch (e) {
            console.error(e);
            alert('Gagal memperbarui tarif: ' + e.message);
        }
    };

    // Generate price list brochure PDF matching the slanted flyer design
    const generatePricingPDF = () => {
        const container = document.createElement('div');
        container.style.cssText = `
            width: 794px;
            background-color: #ffffff;
            color: #111827;
            font-family: 'Inter', -apple-system, sans-serif;
            padding: 0;
            box-sizing: border-box;
        `;

        const categoryLabels = {
            unit_bebek: 'UNIT BEBEK',
            super_ekonomis: 'SUPER EKONOMIS',
            ekonomis: 'EKONOMIS UNIT',
            silver: 'SILVER UNIT',
            unit_tambahan: 'UNIT TAMBAHAN'
        };

        const categoriesToPrint = ['super_ekonomis', 'unit_bebek', 'ekonomis', 'silver', 'unit_tambahan'];

        categoriesToPrint.forEach((catId, pageIdx) => {
            const list = dbPricing.filter(b => b.category === catId);
            if (list.length === 0) return;

            const page = document.createElement('div');
            page.style.cssText = `
                padding: 40px;
                box-sizing: border-box;
                min-height: 1120px;
                position: relative;
                display: flex;
                flex-direction: column;
            `;

            // Header: Logo & Title
            const header = document.createElement('div');
            header.style.cssText = 'text-align: center; margin-bottom: 30px; display: flex; flex-direction: column; align-items: center; gap: 15px;';
            header.innerHTML = `
                <img src="/Nyetor Logo Transparent.png" style="height: 60px;" />
                <div style="display: inline-block; transform: skewX(-15deg); background-color: #004aad; border: 2px solid #ffffff; padding: 10px 40px; box-shadow: 0 4px 15px rgba(0,74,173,0.3);">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; text-transform: uppercase; transform: skewX(15deg); letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                        ${categoryLabels[catId]}
                    </h2>
                </div>
            `;
            page.appendChild(header);

            // Grid container for cards
            const grid = document.createElement('div');
            grid.style.cssText = 'display: flex; flex-direction: column; gap: 20px; flex-grow: 1;';

            list.forEach((bike, idx) => {
                const card = document.createElement('div');
                const isEven = idx % 2 === 0;

                // Pricing parsing
                const prices = bike.prices || {};
                let mainHours = '6';
                if (!prices['6'] && prices['3']) mainHours = '3';
                
                const mainPriceVal = prices[mainHours] ? `${(prices[mainHours] / 1000).toFixed(0)}.000` : '-';
                
                // Secondary prices
                const secondaries = [];
                Object.entries(prices).forEach(([h, p]) => {
                    if (h !== mainHours) {
                        secondaries.push(`<div style="font-size: 13px; font-weight: bold; color: #4b5563;">${h} Jam : ${(p/1000).toFixed(0)}.000</div>`);
                    }
                });

                // Feature badge (e.g. "+ INCLUDE SARUNG TANGAN!!")
                let featureBadge = '';
                if (bike.features && bike.features.length > 0) {
                    featureBadge = `
                        <div style="display: inline-block; background-color: #0084ff; border-radius: 4px; padding: 4px 12px; margin-top: 8px; font-size: 9px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
                            + ${bike.features.join(' & ')}!!
                        </div>
                    `;
                }

                card.style.cssText = `
                    display: flex;
                    flex-direction: ${isEven ? 'row' : 'row-reverse'};
                    background-color: #ffffff;
                    border-radius: 20px;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    height: 140px;
                    align-items: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                `;

                card.innerHTML = `
                    <!-- Image Block -->
                    <div style="width: 38%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 10px;">
                        <img src="${bike.image || '/bandung.png'}" style="max-height: 100%; max-width: 100%; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));" />
                    </div>
                    
                    <!-- Info Block -->
                    <div style="width: 62%; padding: 15px; display: flex; flex-direction: column; justify-content: center; text-align: ${isEven ? 'left' : 'right'}; align-items: ${isEven ? 'flex-start' : 'flex-end'};">
                        <h4 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${bike.name}
                        </h4>
                        
                        <!-- Price Grid -->
                        <div style="display: flex; flex-direction: ${isEven ? 'row' : 'row-reverse'}; align-items: center; gap: 15px;">
                            <!-- Large Main Price -->
                            <div style="display: flex; flex-direction: column; align-items: ${isEven ? 'flex-start' : 'flex-end'};">
                                <span style="font-size: 9px; font-weight: 900; color: #004aad; text-transform: uppercase; letter-spacing: 0.5px;">
                                    ${mainHours} JAM
                                </span>
                                <span style="font-size: 22px; font-weight: 900; color: #111827; line-height: 1.1;">
                                    ${mainPriceVal}
                                </span>
                            </div>
                            
                            <!-- Divider -->
                            <div style="width: 1px; height: 35px; background-color: #e5e7eb;"></div>
                            
                            <!-- Secondary Prices -->
                            <div style="display: flex; flex-direction: column; gap: 1px; text-align: ${isEven ? 'left' : 'right'};">
                                ${secondaries.join('')}
                            </div>
                        </div>
                        
                        ${featureBadge}
                    </div>
                `;

                grid.appendChild(card);
            });

            page.appendChild(grid);

            // Page footer note
            const footer = document.createElement('div');
            footer.style.cssText = 'text-align: center; font-size: 10px; color: #6b7280; margin-top: auto; border-top: 1px solid #e5e7eb; padding-top: 15px;';
            footer.innerHTML = '* Syarat & Ketentuan Berlaku • Sewa 3 Jam Wajib Ambil di Garasi • Hubungi CS Nyetor untuk Booking';
            page.appendChild(footer);

            // Add page break except for last page
            if (pageIdx < categoriesToPrint.length - 1) {
                const breakDiv = document.createElement('div');
                breakDiv.className = 'html2pdf__page-break';
                page.appendChild(breakDiv);
            }

            container.appendChild(page);
        });

        // Save PDF via html2pdf
        const opt = {
            margin:       0,
            filename:     'pricelist_nyetor_motor.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
            jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(container).set(opt).save();
    };

    // Calculate dates helper
    const getEndDate = (startD, startT, durationHours) => {
        if (!startD || !startT) return { date: '', time: '' };
        const start = new Date(`${startD}T${startT}`);
        if (isNaN(start.getTime())) return { date: '', time: '' };
        const end = new Date(start.getTime() + Number(durationHours) * 60 * 60 * 1000);
        
        const yyyy = end.getFullYear();
        const mm = String(end.getMonth() + 1).padStart(2, '0');
        const dd = String(end.getDate()).padStart(2, '0');
        const hh = String(end.getHours()).padStart(2, '0');
        const min = String(end.getMinutes()).padStart(2, '0');

        return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
    };

    // Check overlaps for conflicts
    const checkBookingConflict = (unitId, startDate, startTime, durationHours, excludeLogId = null) => {
        if (!startDate || !startTime || !unitId) return false;
        
        const start = new Date(`${startDate}T${startTime}`).getTime();
        const end = start + Number(durationHours) * 60 * 60 * 1000;

        return logs.some(log => {
            if (log.id === excludeLogId || log.status !== 'Aktif' || log.unitId !== unitId) return false;
            
            const logStart = new Date(`${log.startDate}T${log.startTime}`).getTime();
            const logEnd = new Date(`${log.endDate}T${log.endTime}`).getTime();

            // Overlap check
            return (start < logEnd && end > logStart);
        });
    };

    // Extract catalog rates for override default calculation
    const getCatalogRate = (bikeId, durationHours) => {
        // Flatten catalog
        let bikeData = null;
        Object.values(catalogData).forEach(bikes => {
            const found = bikes.find(b => b.id === bikeId);
            if (found) bikeData = found;
        });

        if (!bikeData || !bikeData.prices) return 0;
        
        // Find best match or greedy smart rate
        const hours = Number(durationHours);
        if (bikeData.prices[hours]) return bikeData.prices[hours];

        // smart price calculator similar to BookingForm.jsx
        const calculateSmartPrice = (h, prices) => {
            if (h <= 0) return 0;
            if (prices[h]) return prices[h];
            const numericDurations = Object.keys(prices).map(Number).sort((a, b) => b - a);
            const bestFit = numericDurations.find(d => d <= h);
            if (bestFit) {
                return prices[bestFit] + calculateSmartPrice(h - bestFit, prices);
            }
            const minDur = numericDurations[numericDurations.length - 1];
            return prices[minDur] || 0;
        };

        return calculateSmartPrice(hours, bikeData.prices);
    };

    // Handle booking submit
    const handleSaveBooking = async (e) => {
        e.preventDefault();
        const { renterName, whatsapp, unitId, startDate, startTime, duration, isDelivery, deliveryZonePrice, deliveryAddress, deliveryStaff, customRentalFee, guarantees, customGuarantee } = bookingForm;

        if (!renterName || !whatsapp || !unitId || !startDate || !startTime) {
            alert('Harap isi semua field utama penyewaan!');
            return;
        }

        if (!supabase) {
            alert('Database tidak terhubung!');
            return;
        }

        // Conflict warning check
        const conflict = checkBookingConflict(unitId, startDate, startTime, duration);
        if (conflict) {
            const proceed = window.confirm('Peringatan: Motor ini sudah memiliki jadwal sewa aktif yang bertabrakan (overlap) dengan waktu yang diinput. Apakah Anda yakin ingin memaksakan booking ini?');
            if (!proceed) return;
        }

        const selectedUnit = fleet.find(u => u.id === unitId);
        if (!selectedUnit) return;

        // Auto rates
        const baseRate = customRentalFee !== '' ? Number(customRentalFee) : getCatalogRate(selectedUnit.bikeId, duration);
        const delFee = isDelivery ? Number(deliveryZonePrice) : 0;
        const total = baseRate + delFee;

        const zoneLabel = isDelivery ? SHIPPING_ZONES.find(z => z.price === Number(deliveryZonePrice))?.label || '' : '';
        const { date: endDate, time: endTime } = getEndDate(startDate, startTime, duration);

        const activeGuarantees = [...guarantees];
        if (customGuarantee.trim()) {
            activeGuarantees.push(customGuarantee.trim());
        }

        const transactionId = `TX-${Date.now().toString().slice(-6)}`;

        const newLogDb = {
            id: transactionId,
            renter_name: renterName,
            phone: whatsapp,
            unit_id: unitId,
            bike_name: selectedUnit.name,
            plate: selectedUnit.plate,
            color: selectedUnit.color || 'Hitam',
            guarantees: activeGuarantees,
            start_date: startDate,
            start_time: startTime + ':00', // HH:mm:ss for Postgres
            duration: Number(duration),
            end_date: endDate,
            end_time: endTime + ':00',
            status: 'Aktif',
            is_delivery: isDelivery,
            delivery_zone: zoneLabel,
            delivery_address: isDelivery ? deliveryAddress : '',
            delivery_staff: isDelivery ? deliveryStaff : '',
            rental_fee: baseRate,
            delivery_fee: delFee,
            total_revenue: total
        };

        try {
            // 1. Save Log
            const { error: logErr } = await supabase.from('nyetor_logs').insert([newLogDb]);
            if (logErr) throw logErr;

            // 2. Update motor status to "Terbooking" if booking starts now
            const startTimestamp = new Date(`${startDate}T${startTime}`).getTime();
            const endTimestamp = new Date(`${endDate}T${endTime}`).getTime();
            const currentTimestamp = Date.now();

            if (currentTimestamp >= startTimestamp && currentTimestamp <= endTimestamp) {
                const { error: fleetErr } = await supabase
                    .from('nyetor_fleet')
                    .update({ status: 'Terbooking' })
                    .eq('id', unitId);
                if (fleetErr) throw fleetErr;
            }

            // Reset form
            setBookingForm({
                renterName: '',
                whatsapp: '',
                unitId: '',
                guarantees: [],
                customGuarantee: '',
                startDate: '',
                startTime: '',
                duration: 24,
                isDelivery: false,
                deliveryZonePrice: 0,
                deliveryAddress: '',
                deliveryStaff: '',
                customRentalFee: ''
            });
            setBikeSearchQuery('');
            setZoneSearchQuery('');
            alert('Booking penyewaan berhasil disimpan ke cloud database!');
            setActiveTab('logs');
        } catch (err) {
            console.error("Save booking failed:", err);
            alert("Gagal menyimpan booking ke database: " + err.message);
        }
    };

    // End/Resolve active booking
    const handleResolveBooking = async (logId) => {
        const targetLog = logs.find(l => l.id === logId);
        if (!targetLog || !supabase) return;

        if (window.confirm(`Apakah Anda yakin penyewaan oleh ${targetLog.renterName} sudah selesai dan unit motor sudah dikembalikan?`)) {
            try {
                // 1. Update log status
                const { error: logErr } = await supabase
                    .from('nyetor_logs')
                    .update({ status: 'Selesai' })
                    .eq('id', logId);
                if (logErr) throw logErr;

                // 2. Restore motor status to "Tersedia"
                const { error: fleetErr } = await supabase
                    .from('nyetor_fleet')
                    .update({ status: 'Tersedia' })
                    .eq('id', targetLog.unitId);
                if (fleetErr) throw fleetErr;

                alert('Penyewaan diselesaikan dan motor kembali tersedia!');
            } catch (err) {
                console.error("Resolve booking failed:", err);
                alert("Gagal memperbarui status sewa: " + err.message);
            }
        }
    };

    // Recalculate fee dynamically for extensions
    const handleExtensionHoursChange = (hoursVal, bikeName) => {
        const hrs = Number(hoursVal);
        setExtensionForm(prev => {
            let bikeId = '';
            Object.values(catalogData).forEach(bikes => {
                const found = bikes.find(b => b.name === bikeName);
                if (found) bikeId = found.id;
            });
            const rate = getCatalogRate(bikeId, hrs);
            return {
                ...prev,
                additionalHours: hoursVal,
                additionalFee: rate || ''
            };
        });
    };

    // Save Extension Booking
    const handleSaveExtension = async (e) => {
        e.preventDefault();
        if (!extendingLog || !supabase) return;

        const additionalHours = Number(extensionForm.additionalHours);
        const additionalFee = Number(extensionForm.additionalFee);

        if (isNaN(additionalHours) || additionalHours <= 0) {
            alert('Durasi tambahan tidak valid!');
            return;
        }

        const newDuration = extendingLog.duration + additionalHours;
        const newRentalFee = extendingLog.rentalFee + additionalFee;
        const newTotalRevenue = extendingLog.totalRevenue + additionalFee;

        // Recalculate end date & time based on start_date, start_time, and new total duration
        const { date: newEndDate, time: newEndTime } = getEndDate(extendingLog.startDate, extendingLog.startTime, newDuration);

        try {
            const { error } = await supabase
                .from('nyetor_logs')
                .update({
                    duration: newDuration,
                    end_date: newEndDate,
                    end_time: newEndTime + ':00',
                    rental_fee: newRentalFee,
                    total_revenue: newTotalRevenue
                })
                .eq('id', extendingLog.id);

            if (error) throw error;

            alert('Sewa berhasil diperpanjang!');
            setExtendingLog(null);
        } catch (err) {
            console.error("Failed to extend booking:", err);
            alert("Gagal memperpanjang sewa di database: " + err.message);
        }
    };

    // Fleet management: add new physical unit
    const handleAddFleetUnit = async (e) => {
        e.preventDefault();
        const { bikeId, plate, color, status, note } = newUnitForm;
        
        if (!bikeId || !plate) {
            alert('Harap pilih jenis motor dan isi plat nomor!');
            return;
        }

        if (!supabase) {
            alert('Database tidak terhubung!');
            return;
        }

        // Get variant details from catalog
        let catalogName = '';
        Object.values(catalogData).forEach(bikes => {
            const found = bikes.find(b => b.id === bikeId);
            if (found) catalogName = found.name;
        });

        const newUnitDb = {
            id: `${bikeId}_${Date.now()}`,
            bike_id: bikeId,
            name: catalogName,
            plate: plate.trim().toUpperCase(),
            color: color.trim() || 'Hitam',
            status,
            note: note.trim()
        };

        try {
            const { error: fleetErr } = await supabase.from('nyetor_fleet').insert([newUnitDb]);
            if (fleetErr) throw fleetErr;
            
            setNewUnitForm({ bikeId: '', plate: '', color: '', status: 'Tersedia', note: '' });
            alert('Unit motor baru berhasil disimpan ke cloud database!');
        } catch (err) {
            console.error("Add unit failed:", err);
            alert("Gagal menambahkan unit ke database: " + err.message);
        }
    };

    // Fleet management: edit physical unit
    const startEditUnit = (unit) => {
        setEditingUnitId(unit.id);
        setEditForm({
            plate: unit.plate,
            color: unit.color || 'Hitam',
            status: unit.status,
            note: unit.note || ''
        });
    };

    const handleSaveUnitEdit = async (id) => {
        if (!editForm.plate.trim()) {
            alert('Plat nomor tidak boleh kosong!');
            return;
        }

        if (!supabase) {
            alert('Database tidak terhubung!');
            return;
        }

        // If status changed, warn active booking conflicts
        const prevUnit = fleet.find(u => u.id === id);
        const hasActiveLog = logs.some(l => l.unitId === id && l.status === 'Aktif');

        if (prevUnit.status === 'Terbooking' && editForm.status !== 'Terbooking' && hasActiveLog) {
            const proceed = window.confirm('Peringatan: Motor ini masih memiliki penyewaan yang sedang aktif. Mengubah status unit akan memutus sinkronisasi harian. Lanjutkan?');
            if (!proceed) return;
        }

        try {
            const { error: fleetErr } = await supabase
                .from('nyetor_fleet')
                .update({
                    plate: editForm.plate.trim().toUpperCase(),
                    color: editForm.color.trim(),
                    status: editForm.status,
                    note: editForm.note.trim()
                })
                .eq('id', id);
            if (fleetErr) throw fleetErr;

            setEditingUnitId(null);
        } catch (err) {
            console.error("Save unit edit failed:", err);
            alert("Gagal menyimpan perubahan unit: " + err.message);
        }
    };

    const handleDeleteUnit = async (id) => {
        const hasActiveLog = logs.some(l => l.unitId === id && l.status === 'Aktif');
        if (hasActiveLog) {
            alert('Gagal menghapus! Unit motor ini sedang memiliki transaksi sewa aktif.');
            return;
        }

        if (!supabase) {
            alert('Database tidak terhubung!');
            return;
        }

        if (window.confirm('Apakah Anda yakin ingin menghapus unit motor ini secara permanen dari armada?')) {
            try {
                const { error: fleetErr } = await supabase
                    .from('nyetor_fleet')
                    .delete()
                    .eq('id', id);
                if (fleetErr) throw fleetErr;
                alert('Unit motor berhasil dihapus dari cloud database!');
            } catch (err) {
                console.error("Delete unit failed:", err);
                alert("Gagal menghapus unit: " + err.message);
            }
        }
    };

    // Overdue/Due Helper
    const isBookingOverdue = (endDateStr, endTimeStr) => {
        if (!endDateStr || !endTimeStr) return false;
        const end = new Date(`${endDateStr}T${endTimeStr}`);
        return Date.now() > end.getTime();
    };

    const getOverdueHours = (endDateStr, endTimeStr) => {
        const end = new Date(`${endDateStr}T${endTimeStr}`);
        const diffMs = Date.now() - end.getTime();
        return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    };

    // Calculate Analytics
    const getPopularMotorsData = () => {
        const counts = {};
        logs.forEach(log => {
            if (log.bikeName) {
                counts[log.bikeName] = (counts[log.bikeName] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    };

    const getRevenueTrendData = () => {
        const dailyRevenue = {};
        logs.forEach(log => {
            if (log.startDate) {
                dailyRevenue[log.startDate] = (dailyRevenue[log.startDate] || 0) + Number(log.totalRevenue || 0);
            }
        });
        return Object.entries(dailyRevenue)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-7);
    };

    // Statistics Calculations
    const getStats = () => {
        const totalBikes = fleet.length;
        const activeBikes = fleet.filter(u => u.status === 'Terbooking').length;
        const repairBikes = fleet.filter(u => u.status === 'Rusak').length;
        const maintBikes = fleet.filter(u => u.status === 'Maintenance').length;
        const inactiveBikes = fleet.filter(u => u.status === 'Inactive').length;

        // Active available fleet excludes Inactive and Maintenance
        const activeFleetCount = totalBikes - (maintBikes + inactiveBikes);
        const utilization = activeFleetCount > 0 ? Math.round((activeBikes / activeFleetCount) * 100) : 0;

        const totalEarned = logs.reduce((sum, log) => sum + (log.totalRevenue || 0), 0);
        
        const todayStr = new Date().toISOString().split('T')[0];
        const returnsTodayCount = logs.filter(l => l.status === 'Aktif' && l.endDate === todayStr).length;
        
        const overdueCount = logs.filter(l => l.status === 'Aktif' && isBookingOverdue(l.endDate, l.endTime)).length;

        // Find popular bikes from logs
        const bikeCounts = {};
        logs.forEach(l => {
            bikeCounts[l.bikeName] = (bikeCounts[l.bikeName] || 0) + 1;
        });
        const popularBikes = Object.entries(bikeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            totalBikes,
            activeBikes,
            repairBikes,
            maintBikes,
            inactiveBikes,
            utilization,
            totalEarned,
            returnsTodayCount,
            overdueCount,
            popularBikes
        };
    };

    const stats = getStats();

    // Calendar Generation
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
        const daysCount = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        
        // Padding for previous month
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthDays - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthDays - i)
            });
        }

        // Current month
        for (let i = 1; i <= daysCount; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i)
            });
        }

        // Padding for next month
        const totalCells = 42; // 6 rows
        const nextPadding = totalCells - days.length;
        for (let i = 1; i <= nextPadding; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }

        return days;
    };

    const calendarCells = getDaysInMonth(calendarDate);
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    // Find active logs for a specific calendar day
    const getLogsForDay = (dateObj) => {
        const targetTime = dateObj.getTime();
        return logs.filter(log => {
            if (log.status !== 'Aktif') return false;
            
            // Set mid-day (12:00) of log dates to check overlaps purely by dates
            const start = new Date(`${log.startDate}T00:00:00`).getTime();
            const end = new Date(`${log.endDate}T23:59:59`).getTime();
            
            return (targetTime >= start && targetTime <= end);
        });
    };

    const handleCalendarDayClick = (cellDate) => {
        const activeLogs = getLogsForDay(cellDate);
        setSelectedCalDay(cellDate);
        setCalPopupData(activeLogs);
    };

    // WhatsApp Message triggers
    const getWhatsAppUrl = (phone, text) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
        const finalPhone = formattedPhone.startsWith('62') ? formattedPhone : '62' + formattedPhone;
        return `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`;
    };

    // Lazy load XLSX sheet exporter
    const handleExportExcel = async () => {
        setIsLoadingXlsx(true);
        try {
            const XLSX = await import('xlsx');
            
            // 1. Fleet Sheets
            const sheet1Data = fleet.map(u => ({
                'ID Unit': u.id,
                'Nama Motor': u.name,
                'Plat Nomor': u.plate,
                'Warna': u.color || 'Hitam',
                'Status Terkini': u.status,
                'Alasan Rusak / Catatan': u.note || ''
            }));

            // 2. Logs Sheets
            const sheet2Data = logs.map(l => ({
                'ID Transaksi': l.id,
                'Nama Penyewa': l.renterName,
                'No WhatsApp': l.phone,
                'Nama Motor': l.bikeName,
                'Plat Nomor': l.plate,
                'Warna': l.color || '',
                'Kelengkapan Jaminan': l.guarantees.join('; '),
                'Tanggal Mulai': l.startDate,
                'Waktu Mulai': l.startTime,
                'Durasi Sewa (Jam)': l.duration,
                'Tanggal Selesai': l.endDate,
                'Waktu Selesai': l.endTime,
                'Status Transaksi': l.status,
                'Metode Pengantaran': l.isDelivery ? 'Diantar' : 'Ambil Sendiri',
                'Zona Pengantaran': l.deliveryZone || '',
                'Alamat Pengantaran': l.deliveryAddress || '',
                'Pengantar / PJ': l.deliveryStaff || '',
                'Biaya Sewa (Rp)': l.rentalFee,
                'Biaya Antar (Rp)': l.deliveryFee,
                'Total Pendapatan (Rp)': l.totalRevenue
            }));

            // 3. Instruction Sheets
            const sheet3Data = [
                { 'Kolom': 'ID Unit', 'Deskripsi/Aturan': 'Teks unik, penanda database unit' },
                { 'Kolom': 'Nama Motor', 'Deskripsi/Aturan': 'Harus sesuai katalog Nyetor.id (e.g. HONDA BEAT DELUXE)' },
                { 'Kolom': 'Status Terkini', 'Deskripsi/Aturan': 'Pilihan: Tersedia, Terbooking, Rusak, Maintenance, Inactive' },
                { 'Kolom': 'No WhatsApp', 'Deskripsi/Aturan': 'Format HP aktif penyewa, diawali dengan 62 atau 08' },
                { 'Kolom': 'Status Transaksi', 'Deskripsi/Aturan': 'Pilihan: Aktif, Selesai' }
            ];

            const wb = XLSX.utils.book_new();
            const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
            const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
            const ws3 = XLSX.utils.json_to_sheet(sheet3Data);

            XLSX.utils.book_append_sheet(wb, ws1, 'Status Unit Terkini');
            XLSX.utils.book_append_sheet(wb, ws2, 'Riwayat Penyewaan');
            XLSX.utils.book_append_sheet(wb, ws3, 'Panduan & Validasi');

            XLSX.writeFile(wb, `Database_Nyetor_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (e) {
            console.error(e);
            alert('Gagal mengekspor data Excel');
        } finally {
            setIsLoadingXlsx(false);
        }
    };

    // Download empty template
    const handleDownloadTemplate = async () => {
        setIsLoadingXlsx(true);
        try {
            const XLSX = await import('xlsx');
            
            const sampleUnits = [
                {
                    'ID Unit': 'vario_kzr_sample1',
                    'Nama Motor': 'HONDA VARIO KZR',
                    'Plat Nomor': 'D 1234 ABC',
                    'Warna': 'Hitam Doff',
                    'Status Terkini': 'Tersedia',
                    'Alasan Rusak / Catatan': ''
                }
            ];

            const sampleLogs = [
                {
                    'ID Transaksi': 'TX-SAMPLE1',
                    'Nama Penyewa': 'Budi Santoso',
                    'No WhatsApp': '087818747396',
                    'Nama Motor': 'HONDA VARIO KZR',
                    'Plat Nomor': 'D 1234 ABC',
                    'Warna': 'Hitam Doff',
                    'Kelengkapan Jaminan': 'KTP; SIM C; KK',
                    'Tanggal Mulai': '2026-07-03',
                    'Waktu Mulai': '10:00',
                    'Durasi Sewa (Jam)': 24,
                    'Tanggal Selesai': '2026-07-04',
                    'Waktu Selesai': '10:00',
                    'Status Transaksi': 'Selesai',
                    'Metode Pengantaran': 'Diantar',
                    'Zona Pengantaran': 'Zone A (Rp 5.000)',
                    'Alamat Pengantaran': 'Kost Unpad Cipadung',
                    'Pengantar / PJ': 'Tim A',
                    'Biaya Sewa (Rp)': 65000,
                    'Biaya Antar (Rp)': 5000,
                    'Total Pendapatan (Rp)': 70000
                }
            ];

            const wb = XLSX.utils.book_new();
            const ws1 = XLSX.utils.json_to_sheet(sampleUnits);
            const ws2 = XLSX.utils.json_to_sheet(sampleLogs);

            XLSX.utils.book_append_sheet(wb, ws1, 'Status Unit Terkini');
            XLSX.utils.book_append_sheet(wb, ws2, 'Riwayat Penyewaan');

            XLSX.writeFile(wb, 'Template_Database_Nyetor.xlsx');
        } catch (e) {
            console.error(e);
            alert('Gagal mendownload template Excel');
        } finally {
            setIsLoadingXlsx(false);
        }
    };

    // Lazy load XLSX importer with preview modal verification
    const handleImportExcel = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoadingXlsx(true);
        try {
            const XLSX = await import('xlsx');
            const reader = new FileReader();

            reader.onload = (evt) => {
                try {
                    const data = new Uint8Array(evt.target?.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    const ws1 = workbook.Sheets['Status Unit Terkini'];
                    const ws2 = workbook.Sheets['Riwayat Penyewaan'];

                    if (!ws1 || !ws2) {
                        alert("Format tidak valid! Pastikan file Excel memiliki sheet 'Status Unit Terkini' dan 'Riwayat Penyewaan'.");
                        setIsLoadingXlsx(false);
                        return;
                    }

                    const importedUnits = XLSX.utils.sheet_to_json(ws1);
                    const importedLogs = XLSX.utils.sheet_to_json(ws2);

                    // Compile warning logs & normalize
                    const warnings = [];
                    const normalizedUnits = importedUnits.map((u, idx) => {
                        const id = u['ID Unit'] || `unit_${Date.now()}_${idx}`;
                        const name = (u['Nama Motor'] || '').toString().trim().toUpperCase();
                        const plate = (u['Plat Nomor'] || '').toString().trim().toUpperCase();
                        const color = (u['Warna'] || 'Hitam').toString().trim();
                        const status = (u['Status Terkini'] || 'Tersedia').toString().trim();
                        const note = (u['Alasan Rusak / Catatan'] || '').toString().trim();

                        // Sync variant model check
                        let bikeId = '';
                        Object.values(catalogData).forEach(bikes => {
                            const match = bikes.find(b => b.name === name);
                            if (match) bikeId = match.id;
                        });

                        if (!bikeId) {
                            warnings.push(`Baris ${idx+2} (Status Unit): Motor "${name}" tidak ditemukan di katalog website.`);
                        }

                        // Determine standard status values
                        const validStatuses = ['Tersedia', 'Terbooking', 'Rusak', 'Maintenance', 'Inactive'];
                        const verifiedStatus = validStatuses.includes(status) ? status : 'Tersedia';

                        return {
                            id,
                            bikeId: bikeId || 'unknown',
                            name,
                            plate,
                            color,
                            status: verifiedStatus,
                            note
                        };
                    });

                    const normalizedLogs = importedLogs.map((l, idx) => {
                        const id = l['ID Transaksi'] || `TX-${Date.now()}-${idx}`;
                        const renterName = (l['Nama Penyewa'] || '').toString();
                        const phone = (l['No WhatsApp'] || '').toString();
                        const bikeName = (l['Nama Motor'] || '').toString().toUpperCase();
                        const plate = (l['Plat Nomor'] || '').toString().toUpperCase();
                        const color = (l['Warna'] || 'Hitam').toString();
                        const guarantees = (l['Kelengkapan Jaminan'] || '').toString().split(';').map(x => x.trim()).filter(Boolean);
                        const startDate = l['Tanggal Mulai'] || '';
                        const startTime = l['Waktu Mulai'] || '';
                        const duration = Number(l['Durasi Sewa (Jam)'] || 24);
                        const endDate = l['Tanggal Selesai'] || '';
                        const endTime = l['Waktu Selesai'] || '';
                        const logStatus = l['Status Transaksi'] || 'Selesai';
                        const isDelivery = l['Metode Pengantaran'] === 'Diantar';
                        const deliveryZone = l['Zona Pengantaran'] || '';
                        const deliveryAddress = l['Alamat Pengantaran'] || '';
                        const deliveryStaff = l['Pengantar / PJ'] || '';
                        const rentalFee = Number(l['Biaya Sewa (Rp)'] || 0);
                        const deliveryFee = Number(l['Biaya Antar (Rp)'] || 0);
                        const totalRevenue = Number(l['Total Pendapatan (Rp)'] || 0);

                        return {
                            id,
                            renterName,
                            phone,
                            bikeName,
                            plate,
                            color,
                            guarantees,
                            startDate,
                            startTime,
                            duration,
                            endDate,
                            endTime,
                            status: logStatus,
                            isDelivery,
                            deliveryZone,
                            deliveryAddress,
                            deliveryStaff,
                            rentalFee,
                            deliveryFee,
                            totalRevenue
                        };
                    });

                    setImportPreview({
                        units: normalizedUnits,
                        logs: normalizedLogs,
                        warnings
                    });
                    setIsImportModalOpen(true);
                } catch (e) {
                    console.error(e);
                    alert('Gagal memproses file Excel, periksa kembali strukturnya.');
                } finally {
                    setIsLoadingXlsx(false);
                }
            };

            reader.readAsArrayBuffer(file);
        } catch (e) {
            console.error(e);
            alert('Kesalahan saat mengimpor.');
            setIsLoadingXlsx(false);
        }
    };

    const confirmImport = async () => {
        if (!importPreview || !supabase) return;
        
        try {
            setIsLoadingXlsx(true);
            
            // 1. Delete all current rows in fleet (cascade deletes logs)
            const { error: deleteErr } = await supabase.from('nyetor_fleet').delete().neq('id', 'placeholder_delete_preventer');
            if (deleteErr) throw deleteErr;

            // 2. Insert imported units
            const dbUnits = importPreview.units.map(u => ({
                id: u.id,
                bike_id: u.bikeId,
                name: u.name,
                plate: u.plate,
                color: u.color,
                status: u.status,
                note: u.note || ''
            }));
            const { error: unitInsertErr } = await supabase.from('nyetor_fleet').insert(dbUnits);
            if (unitInsertErr) throw unitInsertErr;

            // 3. Insert imported logs
            const dbLogs = importPreview.logs.map(l => ({
                id: l.id,
                renter_name: l.renterName,
                phone: l.phone,
                unit_id: l.unitId,
                bike_name: l.bikeName,
                plate: l.plate,
                color: l.color || 'Hitam',
                guarantees: l.guarantees,
                start_date: l.startDate,
                start_time: l.startTime.length === 5 ? l.startTime + ':00' : l.startTime,
                duration: l.duration,
                end_date: l.endDate,
                end_time: l.endTime.length === 5 ? l.endTime + ':00' : l.endTime,
                status: l.status,
                is_delivery: l.isDelivery,
                delivery_zone: l.deliveryZone,
                delivery_address: l.deliveryAddress,
                delivery_staff: l.deliveryStaff,
                rental_fee: l.rentalFee,
                delivery_fee: l.deliveryFee,
                total_revenue: l.totalRevenue
            }));

            if (dbLogs.length > 0) {
                const { error: logsInsertErr } = await supabase.from('nyetor_logs').insert(dbLogs);
                if (logsInsertErr) throw logsInsertErr;
            }

            setIsImportModalOpen(false);
            setImportPreview(null);
            alert('Database cloud Supabase berhasil disinkronkan dengan berkas Excel!');
        } catch (err) {
            console.error("Import sync failed:", err);
            alert("Gagal sinkronisasi data Excel ke Supabase: " + err.message);
        } finally {
            setIsLoadingXlsx(false);
        }
    };

    // Helpers to render statuses nicely
    const getStatusStyles = (status) => {
        switch (status) {
            case 'Tersedia': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'Terbooking': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            case 'Rusak': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            case 'Maintenance': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            case 'Inactive': return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
        }
    };

    // Auto-rate filler
    const handleFormBikeSelect = (unit) => {
        setBookingForm(prev => {
            const calculated = getCatalogRate(unit.bikeId, prev.duration);
            return {
                ...prev,
                unitId: unit.id,
                customRentalFee: calculated
            };
        });
        setBikeSearchQuery(`${unit.name} - [${unit.plate}] (${unit.color})`);
        setIsBikeDropdownOpen(false);
    };

    const handleFormDurationChange = (hrs) => {
        setBookingForm(prev => {
            const selectedUnit = fleet.find(u => u.id === prev.unitId);
            const calculated = selectedUnit ? getCatalogRate(selectedUnit.bikeId, hrs) : '';
            return {
                ...prev,
                duration: hrs,
                customRentalFee: calculated
            };
        });
    };

    // Filter units matching smart search
    const filteredBikes = fleet.filter(unit => {
        const query = bikeSearchQuery.toLowerCase();
        return (
            unit.name.toLowerCase().includes(query) ||
            unit.plate.toLowerCase().includes(query) ||
            (unit.color && unit.color.toLowerCase().includes(query))
        );
    });

    const filteredZones = SHIPPING_ZONES.filter(z => {
        const query = zoneSearchQuery.toLowerCase();
        return z.label.toLowerCase().includes(query) || z.detail.toLowerCase().includes(query);
    });

    // Calendar month offset
    const changeMonth = (offset) => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1));
    };

    // Gantt chart: days in month list
    const getGanttDays = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const total = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: total }, (_, i) => i + 1);
    };

    const ganttDays = getGanttDays();

    // Check status of a unit on a particular date for Gantt chart
    const getUnitStatusOnDate = (unit, dateNum) => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
        
        // 1. Check if unit is damaged/maint/inactive currently, and it matches today.
        // But for Gantt schedule, we look at bookings first.
        const activeBooking = logs.find(log => {
            if (log.unitId !== unit.id || log.status !== 'Aktif') return false;
            return targetDateStr >= log.startDate && targetDateStr <= log.endDate;
        });

        if (activeBooking) return 'Terbooking';
        
        // Fallback to unit's current physical status if looking at today,
        // or just base status.
        const todayStr = new Date().toISOString().split('T')[0];
        if (targetDateStr === todayStr) {
            return unit.status;
        }

        // For other dates, if the motor has a static downtime note, we show it, but assume available otherwise
        if (targetDateStr > todayStr) {
            // For future, if it's currently Damaged, it might still be damaged unless resolved
            if (unit.status === 'Rusak' || unit.status === 'Maintenance' || unit.status === 'Inactive') {
                return unit.status;
            }
        } else {
            // Past dates
            if (unit.status === 'Inactive') return 'Inactive';
        }

        return 'Tersedia';
    };



    // RENDER LOGIN SCREEN IF NOT AUTHENTICATED
    if (!isLoggedIn) {
        return (
            <div className="fixed inset-0 z-50 bg-black text-white flex items-center justify-center p-4">
                {/* Background Parallax Image like Hero section */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/bandung.png"
                        alt="Bandung City View"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-[#07070a] z-10" />
                </div>
                
                {/* Glassmorphic card matching the dark Bandung hero style */}
                <div className="relative z-20 w-full max-w-md bg-zinc-950/75 border border-zinc-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
                    <div className="text-center mb-8">
                        <img src="/Nyetor Logo Transparent.png" alt="Nyetor Logo" className="h-16 mx-auto mb-4 brightness-200" />
                        <h2 className="text-2xl font-black text-white tracking-tight">PORTAL ADMIN NYETOR</h2>
                        <p className="text-zinc-400 text-sm mt-1">Gunakan sandi default untuk masuk pertama kali</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {!creds.isConfigured && (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg flex items-center gap-2 text-[11px] leading-relaxed mb-4">
                                <AlertTriangle size={18} className="shrink-0 text-amber-400" />
                                <span>
                                    <strong>Dev Note:</strong> Supabase URL & Anon Key belum diatur di file <code>.env</code>. Silakan lihat instruksi di file <code>walkthrough.md</code>.
                                </span>
                            </div>
                        )}

                        {authError && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg flex items-center gap-2 text-sm">
                                <AlertTriangle size={18} className="shrink-0 animate-bounce" />
                                <span>{authError}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-zinc-300 text-sm font-semibold mb-2">Email Admin</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-zinc-500" size={18} />
                                <input 
                                    type="email" 
                                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#004aad] focus:ring-1 focus:ring-[#004aad] transition-all text-sm"
                                    placeholder="Masukkan email admin..."
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-zinc-300 text-sm font-semibold mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
                                <input 
                                    type="password" 
                                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#004aad] focus:ring-1 focus:ring-[#004aad] transition-all text-sm"
                                    placeholder="Masukkan password..."
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full btn py-3 text-base font-bold tracking-wider mt-4 shadow-lg shadow-blue-500/10">
                            MASUK SEKARANG
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <button 
                            onClick={onClose}
                            className="text-zinc-500 text-sm hover:text-white transition-colors cursor-pointer"
                        >
                            Kembali ke Website
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const popularMotors = getPopularMotorsData();
    const maxPopularCount = popularMotors.length > 0 ? Math.max(...popularMotors.map(m => m.count)) : 1;

    const revenueTrend = getRevenueTrendData();
    const maxRevenue = revenueTrend.length > 0 ? Math.max(...revenueTrend.map(r => r.revenue)) : 1;

    // Generate SVG path for line chart
    let points = '';
    let fillPoints = '';
    if (revenueTrend.length > 1) {
        const coords = revenueTrend.map((r, i) => {
            const x = (i / (revenueTrend.length - 1)) * 420 + 40;
            const y = 160 - (r.revenue / maxRevenue) * 120;
            return { x, y };
        });
        
        points = `M ${coords.map(c => `${c.x},${c.y}`).join(' L ')}`;
        fillPoints = `${points} L ${coords[coords.length - 1].x},160 L ${coords[0].x},160 Z`;
    }

    // Filtered logs calculation
    const filteredLogs = logs.filter(log => {
        const matchesSearch = logFilterSearch.trim() === '' || 
            log.renterName.toLowerCase().includes(logFilterSearch.toLowerCase()) ||
            log.plate.toLowerCase().includes(logFilterSearch.toLowerCase()) ||
            log.id.toLowerCase().includes(logFilterSearch.toLowerCase());

        const matchesStatus = logFilterStatus === 'Semua' || log.status === logFilterStatus;

        const matchesDelivery = logFilterDelivery === 'Semua' || 
            (logFilterDelivery === 'Kirim (Delivery)' && log.isDelivery) ||
            (logFilterDelivery === 'Ambil Sendiri' && !log.isDelivery);

        const matchesBike = logFilterBike === 'Semua' || log.bikeName === logFilterBike;

        const matchesStartDate = logFilterStartDate === '' || log.startDate >= logFilterStartDate;
        const matchesEndDate = logFilterEndDate === '' || log.startDate <= logFilterEndDate;

        return matchesSearch && matchesStatus && matchesDelivery && matchesBike && matchesStartDate && matchesEndDate;
    });

    // Unique bike names list from logs for the dropdown filter
    const uniqueBikesInLogs = Array.from(new Set(logs.map(l => l.bikeName).filter(Boolean)));

    // MAIN ADMIN PANEL VIEW
    return (
        <div className={`fixed inset-0 z-50 flex flex-col font-sans overflow-hidden transition-colors duration-300 ${
            theme === 'light' 
                ? 'light-mode-active bg-gray-50 text-gray-800' 
                : 'bg-[#07070a] text-zinc-300'
        }`}>
            <style>{`
                .light-mode-active {
                    --bg-main: #f3f4f6;
                    --bg-card: #ffffff;
                    --border-color: #e5e7eb;
                    --text-main: #111827;
                    --text-muted: #4b5563;
                    --text-light: #6b7280;
                }
                
                /* Standard tags overrides */
                .light-mode-active,
                .light-mode-active main,
                .light-mode-active aside {
                    background-color: var(--bg-main) !important;
                    color: var(--text-main) !important;
                }
                
                .light-mode-active header {
                    background-color: #ffffff !important;
                    border-color: var(--border-color) !important;
                    color: var(--text-main) !important;
                }
                
                /* Wildcard selectors to target Tailwind classes without backslash syntax problems */
                .light-mode-active div[class*="bg-zinc-"],
                .light-mode-active div[class*="bg-[#"],
                .light-mode-active form[class*="bg-zinc-"],
                .light-mode-active form[class*="bg-[#"],
                .light-mode-active nav[class*="bg-zinc-"],
                .light-mode-active button[class*="bg-zinc-"] {
                    background-color: var(--bg-card) !important;
                    border-color: var(--border-color) !important;
                    color: var(--text-main) !important;
                }
                
                .light-mode-active h1,
                .light-mode-active h2,
                .light-mode-active h3,
                .light-mode-active h4,
                .light-mode-active th {
                    color: var(--text-main) !important;
                }
                
                .light-mode-active span[class*="text-zinc-"],
                .light-mode-active p[class*="text-zinc-"],
                .light-mode-active label[class*="text-zinc-"],
                .light-mode-active div[class*="text-zinc-"] {
                    color: var(--text-muted) !important;
                }
                
                .light-mode-active input,
                .light-mode-active select,
                .light-mode-active textarea {
                    background-color: #ffffff !important;
                    color: #111827 !important;
                    border-color: #d1d5db !important;
                }
                
                .light-mode-active input::placeholder,
                .light-mode-active select::placeholder,
                .light-mode-active textarea::placeholder {
                    color: #9ca3af !important;
                }
                
                /* Calendar grid cell override */
                .light-mode-active .calendar-grid-cell,
                .light-mode-active div[class*="border-zinc-"] {
                    border-color: var(--border-color) !important;
                }
                
                /* Keep the primary blue background buttons working */
                .light-mode-active button[class*="bg-[#004aad]"],
                .light-mode-active .bg-\\[\\#004aad\\] {
                    background-color: #004aad !important;
                    color: #ffffff !important;
                }
                
                /* Keep the primary gradient buttons working */
                .light-mode-active .btn {
                    color: #ffffff !important;
                }
                
                /* Fix hover states for sidebar items */
                .light-mode-active aside button:hover {
                    background-color: #e5e7eb !important;
                    color: #111827 !important;
                }

                /* Overrides for tag badges (spans) in light mode */
                .light-mode-active span[class*="bg-zinc-"] {
                    background-color: #e5e7eb !important;
                    border-color: #d1d5db !important;
                    color: #374151 !important;
                }
                .light-mode-active span[class*="bg-amber-"] {
                    background-color: #fef3c7 !important;
                    border-color: #fde68a !important;
                    color: #b45309 !important;
                }
            `}</style>

            {/* Header */}
            <header className="bg-zinc-950 border-b border-zinc-900 px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Hamburger Button for Mobile */}
                    <button 
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-1.5 text-zinc-400 hover:text-white md:hidden hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                        title="Buka Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo: Large on Desktop, NY on Mobile */}
                    <img src="/Nyetor Logo Transparent.png" alt="Nyetor Logo" className={`h-10 hidden md:block ${theme === 'dark' ? 'brightness-200' : ''}`} />
                    <span className="md:hidden font-black text-2xl text-[#004aad] tracking-tighter">NY</span>

                    <div className="h-6 w-[1px] bg-zinc-800 hidden md:block" />
                    <span className="text-[#004aad] font-black tracking-widest text-xs md:text-sm uppercase truncate max-w-[120px] md:max-w-none">
                        CONTROL PANEL
                    </span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <button 
                        onClick={() => {
                            const newTheme = theme === 'dark' ? 'light' : 'dark';
                            setTheme(newTheme);
                            localStorage.setItem('adminTheme', newTheme);
                        }}
                        className="text-zinc-400 hover:text-[#004aad] p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                        title={theme === 'dark' ? "Mode Terang" : "Mode Gelap"}
                    >
                        {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-400" />}
                    </button>
                    <button 
                        onClick={onClose} 
                        className="text-zinc-400 hover:text-white text-xs md:text-sm font-medium transition-colors"
                    >
                        Halaman Utama
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all p-2 rounded-lg"
                        title="Keluar"
                    >
                        <LogOut size={14} className="md:w-4 md:h-4" />
                    </button>
                </div>
            </header>

            {/* Sidebar & content container */}
            <div className="flex flex-1 overflow-hidden relative">
                
                {/* Backdrop Overlay for Mobile Sidebar */}
                {isMobileSidebarOpen && (
                    <div 
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Navigation */}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between p-4 shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 md:z-0 md:bg-zinc-950/50 md:shadow-none md:border-r-0
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div>
                        {/* Header for mobile sidebar with close button and large logo */}
                        <div className="flex items-center justify-between mb-6 md:hidden">
                            <img src="/Nyetor Logo Transparent.png" alt="Nyetor Logo" className="h-10 brightness-200" />
                            <button 
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className="p-1 text-zinc-400 hover:text-white"
                                title="Tutup Menu"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <nav className="space-y-1">
                            <button 
                                onClick={() => {
                                    setActiveTab('summary');
                                    setIsMobileSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'summary' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'}`}
                            >
                                <BarChart2 size={18} />
                                <span>Dashboard & Kalender</span>
                            </button>
                            <button 
                                onClick={() => {
                                    setActiveTab('fleet');
                                    setIsMobileSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'fleet' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'}`}
                            >
                                <Wrench size={18} />
                                <span>Pengelolaan Armada</span>
                            </button>
                            <button 
                                onClick={() => {
                                    setActiveTab('booking');
                                    setIsMobileSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'booking' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'}`}
                            >
                                <Plus size={18} />
                                <span>Input Booking Form</span>
                            </button>
                            <button 
                                onClick={() => {
                                    setActiveTab('logs');
                                    setIsMobileSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'logs' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'}`}
                            >
                                <Clock size={18} />
                                <span>Riwayat & Logs</span>
                                {logs.filter(l => l.status === 'Aktif').length > 0 && (
                                    <span className="ml-auto bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2 py-0.5 rounded-full font-bold">
                                        {logs.filter(l => l.status === 'Aktif').length}
                                    </span>
                                )}
                            </button>
                            <button 
                                onClick={() => {
                                    setActiveTab('backup');
                                    setIsMobileSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'backup' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'}`}
                            >
                                <FileSpreadsheet size={18} />
                                <span>Database Excel (XLSX)</span>
                            </button>
                            <button 
                                onClick={() => {
                                    setActiveTab('pricing');
                                    setIsMobileSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'pricing' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'}`}
                            >
                                <DollarSign size={18} />
                                <span>Atur Tarif & Price List</span>
                            </button>
                        </nav>
                    </div>

                    <div className="border-t border-zinc-900 pt-4">
                        <button 
                            onClick={() => {
                                setActiveTab('settings');
                                setIsMobileSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900/60'}`}
                        >
                            <Settings size={18} />
                            <span>Sandi Admin</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-[#09090c] overflow-y-auto p-8 relative">
                    
                    {/* SUMMARY & CALENDAR TAB */}
                    {activeTab === 'summary' && (
                        <div className="space-y-8 max-w-6xl">
                            {/* Heading */}
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">KONTROL ARMADA & JADWAL</h1>
                                <p className="text-zinc-500 text-sm mt-1">Pantau utilitas motor, pengembalian tertunda, dan estimasi omzet sewa.</p>
                            </div>

                            {/* KPI Widgets */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Armada</span>
                                    <div className="text-3xl font-black text-white mt-1">{stats.totalBikes} Unit</div>
                                    <div className="text-xs text-zinc-500 mt-2 flex gap-3">
                                        <span className="text-emerald-400 font-bold">{fleet.filter(u => u.status === 'Tersedia').length} Tersedia</span>
                                        <span className="text-rose-400 font-bold">{stats.repairBikes} Rusak</span>
                                    </div>
                                </div>
                                <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Utilitas Armada</span>
                                    <div className="text-3xl font-black text-blue-400 mt-1">{stats.utilization}%</div>
                                    <div className="text-xs text-zinc-500 mt-2">
                                        <span className="text-blue-400 font-bold">{stats.activeBikes} Aktif</span> menyewa dari {stats.totalBikes - (stats.maintBikes + stats.inactiveBikes)} unit aktif.
                                    </div>
                                </div>
                                <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl relative overflow-hidden">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Kembali / Overdue</span>
                                    <div className="text-3xl font-black mt-1 flex items-baseline gap-2">
                                        <span className="text-white">{stats.returnsTodayCount} Hari ini</span>
                                        {stats.overdueCount > 0 && (
                                            <span className="text-sm font-black text-rose-400 animate-pulse bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                                {stats.overdueCount} Overdue
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-2">
                                        Status unit butuh verifikasi pengembalian.
                                    </div>
                                </div>
                                <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Estimasi Akumulasi Omzet</span>
                                    <div className="text-3xl font-black text-emerald-400 mt-1">Rp {stats.totalEarned.toLocaleString('id-ID')}</div>
                                    <div className="text-xs text-zinc-500 mt-2">
                                        Total biaya sewa + ongkos antar tercatat.
                                    </div>
                                </div>
                            </div>

                            {/* Calendar & Timeline Grid Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                
                                {/* Calendar Grid */}
                                <div className="lg:col-span-7 bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <CalendarIcon size={18} className="text-[#004aad]" />
                                            <span>Kalender Jadwal Booking</span>
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-800">
                                                <ChevronLeft size={16} />
                                            </button>
                                            <span className="text-sm font-bold text-white px-2">
                                                {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                                            </span>
                                            <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-800">
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Days Headers */}
                                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-600 mb-2">
                                        <div>MIN</div><div>SEN</div><div>SEL</div><div>RAB</div><div>KAM</div><div>JUM</div><div>SAB</div>
                                    </div>

                                    {/* Cells */}
                                    <div className="grid grid-cols-7 gap-2">
                                        {calendarCells.map((cell, idx) => {
                                            const activeLogs = getLogsForDay(cell.date);
                                            const hasActive = activeLogs.length > 0;
                                            const isToday = cell.date.toDateString() === new Date().toDateString();

                                            return (
                                                <button 
                                                    key={idx}
                                                    onClick={() => handleCalendarDayClick(cell.date)}
                                                    className={`h-20 p-1.5 rounded-xl border flex flex-col justify-between items-start transition-all relative group ${
                                                        cell.isCurrentMonth ? 'bg-zinc-900/20 hover:bg-zinc-900/60' : 'bg-transparent text-zinc-700 hover:bg-zinc-900/20'
                                                    } ${isToday ? 'border-[#004aad] bg-[#004aad]/5' : 'border-zinc-900/80'} ${hasActive ? 'ring-1 ring-blue-500/10' : ''}`}
                                                >
                                                    <span className={`text-xs font-black px-1.5 py-0.5 rounded ${isToday ? 'bg-[#004aad] text-white' : 'text-zinc-500'}`}>
                                                        {cell.day}
                                                    </span>

                                                    {hasActive && (
                                                        <div className="w-full flex flex-col gap-1 overflow-hidden mt-1">
                                                            <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black py-0.5 px-1 rounded truncate w-full text-left">
                                                                {activeLogs.length} Terbooking
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Popular & Downtime details */}
                                <div className="lg:col-span-5 flex flex-col gap-6">
                                    {/* Popular variants */}
                                    <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl flex-1">
                                        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                            <Info size={16} className="text-blue-400" />
                                            <span>Motor Paling Sering Disewa (Log)</span>
                                        </h3>
                                        
                                        {stats.popularBikes.length === 0 ? (
                                            <div className="text-zinc-600 text-sm text-center py-6">Belum ada riwayat transaksi.</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {stats.popularBikes.map(([name, count], index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-[#004aad]">
                                                                {index + 1}
                                                            </span>
                                                            <span className="text-sm font-semibold text-zinc-300">{name}</span>
                                                        </div>
                                                        <span className="text-xs bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 text-blue-400 rounded-full font-black">
                                                            {count}x Sewa
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick list of broken motors */}
                                    <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl flex-1">
                                        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                            <AlertTriangle size={16} className="text-rose-400" />
                                            <span>Armada Butuh Perbaikan ({stats.repairBikes})</span>
                                        </h3>
                                        
                                        {fleet.filter(u => u.status === 'Rusak').length === 0 ? (
                                            <div className="text-emerald-400/80 text-sm text-center py-6 flex items-center justify-center gap-2">
                                                <Check size={16} />
                                                <span>Semua unit motor dalam kondisi prima!</span>
                                            </div>
                                        ) : (
                                            <div className="max-h-48 overflow-y-auto space-y-3">
                                                {fleet.filter(u => u.status === 'Rusak').map((unit, idx) => (
                                                    <div key={idx} className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl flex flex-col gap-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-white">{unit.name}</span>
                                                            <span className="text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded uppercase">
                                                                {unit.plate}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-zinc-500 italic">"{unit.note || 'Tidak ada catatan kerusakan'}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Gantt Timeline View */}
                            <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl w-full">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <BarChart2 size={18} className="text-[#004aad]" />
                                    <span>Timeline Jadwal Armada (Gantt View)</span>
                                </h3>

                                <div className="overflow-x-auto">
                                    <div className="min-w-[800px]">
                                        
                                        {/* Gantt Headers */}
                                        <div className="grid grid-cols-12 gap-2 border-b border-zinc-900 pb-3 mb-3 text-xs font-bold text-zinc-500">
                                            <div className="col-span-3">Unit Motor / Plat</div>
                                            <div className="col-span-9 grid gap-1 font-bold text-center" style={{ gridTemplateColumns: `repeat(${ganttDays.length}, minmax(0, 1fr))` }}>
                                                {ganttDays.map(d => (
                                                    <div key={d} className="text-[10px] w-4 font-mono">{d}</div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Gantt Rows */}
                                        <div className="space-y-2.5">
                                            {fleet.map((unit, idx) => (
                                                <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                                                    <div className="col-span-3 flex flex-col justify-center">
                                                        <span className="font-bold text-zinc-300 truncate" title={unit.name}>{unit.name}</span>
                                                        <div className="flex gap-2 items-center mt-0.5">
                                                            <span className="text-[9px] font-mono text-zinc-500 px-1 bg-zinc-900 border border-zinc-800 rounded">{unit.plate}</span>
                                                            <span className="text-[9px] text-zinc-500">({unit.color || 'Hitam'})</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Days Block */}
                                                    <div className="col-span-9 grid gap-1" style={{ gridTemplateColumns: `repeat(${ganttDays.length}, minmax(0, 1fr))` }}>
                                                        {ganttDays.map(d => {
                                                            const dayStatus = getUnitStatusOnDate(unit, d);
                                                            let blockColor = 'bg-zinc-900 border border-zinc-800/40';
                                                            let tooltip = 'Tersedia';

                                                            if (dayStatus === 'Terbooking') {
                                                                blockColor = 'bg-blue-500 border border-blue-400';
                                                                tooltip = 'Sedang disewa';
                                                            } else if (dayStatus === 'Rusak') {
                                                                blockColor = 'bg-rose-500 border border-rose-400';
                                                                tooltip = 'Rusak: ' + (unit.note || '');
                                                            } else if (dayStatus === 'Maintenance') {
                                                                blockColor = 'bg-amber-500 border border-amber-400';
                                                                tooltip = 'Maintenance';
                                                            } else if (dayStatus === 'Inactive') {
                                                                blockColor = 'bg-zinc-700 border border-zinc-600';
                                                                tooltip = 'Non-aktif';
                                                            }

                                                            return (
                                                                <div 
                                                                    key={d} 
                                                                    className={`w-4 h-6 rounded-md transition-colors ${blockColor}`}
                                                                    title={`${unit.name} [${unit.plate}] - Tanggal ${d}: ${tooltip}`}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Analytics Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-900 pt-8 mt-4">
                                    
                                    {/* Popular Motors Chart */}
                                    <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <BarChart2 size={18} className="text-blue-500" />
                                            <span>Top 5 Motor Paling Laris</span>
                                        </h3>
                                        
                                        {popularMotors.length === 0 ? (
                                            <div className="text-zinc-600 text-sm text-center py-10">Belum ada riwayat transaksi sewa.</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {popularMotors.map((m, i) => (
                                                    <div key={i} className="text-xs">
                                                        <div className="flex justify-between font-bold text-zinc-300">
                                                            <span>{i + 1}. {m.name}</span>
                                                            <span className="text-blue-400">{m.count} kali disewa</span>
                                                        </div>
                                                        <div className="h-2.5 bg-zinc-900 border border-zinc-800/80 rounded-full overflow-hidden w-full mt-1.5 relative">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-[#004aad]/90 to-[#004aad]/50 rounded-full transition-all duration-500"
                                                                style={{ width: `${(m.count / maxPopularCount) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Revenue Trend Area Chart */}
                                    <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <FileSpreadsheet size={18} className="text-emerald-500" />
                                            <span>Tren Pendapatan Harian (7 Hari Terakhir)</span>
                                        </h3>

                                        {revenueTrend.length === 0 ? (
                                            <div className="text-zinc-600 text-sm text-center py-10">Belum ada riwayat transaksi sewa.</div>
                                        ) : (
                                            <div className="w-full flex flex-col items-center">
                                                {revenueTrend.length === 1 ? (
                                                    <div className="text-center py-8">
                                                        <span className="text-zinc-500 text-xs uppercase block">Pendapatan Hari ini</span>
                                                        <span className="text-2xl font-black text-emerald-400 mt-1 block">Rp {revenueTrend[0].revenue.toLocaleString('id-ID')}</span>
                                                        <span className="text-[10px] text-zinc-500 block mt-2">({revenueTrend[0].date})</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full relative">
                                                        <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible">
                                                            <defs>
                                                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                                                </linearGradient>
                                                            </defs>

                                                            {/* Horizontal grid lines */}
                                                            <line x1="40" y1="40" x2="460" y2="40" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
                                                            <line x1="40" y1="100" x2="460" y2="100" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
                                                            <line x1="40" y1="160" x2="460" y2="160" stroke="#1f2937" strokeWidth="1" />

                                                            {/* Gradient Area Fill */}
                                                            {fillPoints && <path d={fillPoints} fill="url(#revGrad)" />}

                                                            {/* Sparkline Line */}
                                                            {points && (
                                                                <path 
                                                                    d={points} 
                                                                    fill="none" 
                                                                    stroke="#10b981" 
                                                                    strokeWidth="3" 
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            )}

                                                            {/* Circles at nodes */}
                                                            {revenueTrend.map((r, i) => {
                                                                const x = (i / (revenueTrend.length - 1)) * 420 + 40;
                                                                const y = 160 - (r.revenue / maxRevenue) * 120;
                                                                return (
                                                                    <g key={i} className="group cursor-pointer">
                                                                        <circle 
                                                                            cx={x} 
                                                                            cy={y} 
                                                                            r="4" 
                                                                            fill="#10b981" 
                                                                            stroke="#09090c" 
                                                                            strokeWidth="2" 
                                                                        />
                                                                        <circle 
                                                                            cx={x} 
                                                                            cy={y} 
                                                                            r="8" 
                                                                            fill="#10b981" 
                                                                            opacity="0"
                                                                            className="hover:opacity-20 transition-opacity" 
                                                                        />
                                                                    </g>
                                                                );
                                                            })}
                                                        </svg>
                                                        {/* Labels */}
                                                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-3 px-8">
                                                            {revenueTrend.map((r, i) => {
                                                                const parts = r.date.split('-');
                                                                const label = `${parts[2]}/${parts[1]}`;
                                                                return (
                                                                    <span key={i} title={r.date}>{label}</span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                    )}

                    {/* FLEET MANAGEMENT TAB */}
                    {activeTab === 'fleet' && (
                        <div className="space-y-8 max-w-6xl">
                            {/* Heading */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-black text-white tracking-tight">PENGELOLAAN ARMADA MOTOR</h1>
                                    <p className="text-zinc-500 text-sm mt-1">Ubah plat nomor, ubah status, serta tambah dan kurangi unit motor fisik per tipe.</p>
                                </div>
                            </div>

                            {/* Add Unit form */}
                            <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl">
                                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                    <Plus size={18} className="text-[#004aad]" />
                                    <span>Tambah Unit Motor Baru</span>
                                </h3>

                                <form onSubmit={handleAddFleetUnit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                    <div>
                                        <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Model Tipe Motor</label>
                                        <select 
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#004aad]"
                                            value={newUnitForm.bikeId}
                                            onChange={(e) => setNewUnitForm({ ...newUnitForm, bikeId: e.target.value })}
                                            required
                                        >
                                            <option value="">-- Pilih Model --</option>
                                            {Object.entries(catalogData).map(([category, bikes]) => {
                                                if (category === 'accessories' || category === 'seasonal' || category === 'warlok') return null;
                                                return bikes.map(b => (
                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                ));
                                            })}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Plat Nomor</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                            placeholder="Contoh: D 1234 NYT"
                                            value={newUnitForm.plate}
                                            onChange={(e) => setNewUnitForm({ ...newUnitForm, plate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Warna (Opsional)</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                            placeholder="Contoh: Hitam Doff"
                                            value={newUnitForm.color}
                                            onChange={(e) => setNewUnitForm({ ...newUnitForm, color: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Status Awal</label>
                                        <select 
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#004aad]"
                                            value={newUnitForm.status}
                                            onChange={(e) => setNewUnitForm({ ...newUnitForm, status: e.target.value })}
                                        >
                                            <option value="Tersedia">Tersedia</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <button type="submit" className="btn py-2.5 text-sm font-bold h-[42px] w-full">
                                        TAMBAH UNIT
                                    </button>
                                </form>
                            </div>

                            {/* Fleet Table list */}
                            <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
                                    <h3 className="text-base font-bold text-white">Daftar Semua Armada ({fleet.length} Unit)</h3>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-zinc-900/60 border-b border-zinc-900 text-zinc-500 font-bold">
                                                <th className="p-4">Model Motor</th>
                                                <th className="p-4">Plat Nomor</th>
                                                <th className="p-4">Warna</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4">Catatan Kerusakan / Downtime</th>
                                                <th className="p-4 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-900">
                                            {fleet.map((unit) => {
                                                const isEditing = editingUnitId === unit.id;

                                                return (
                                                    <tr key={unit.id} className="hover:bg-zinc-900/20 text-zinc-300">
                                                        <td className="p-4 font-bold text-white">{unit.name}</td>
                                                        <td className="p-4">
                                                            {isEditing ? (
                                                                <input 
                                                                    type="text" 
                                                                    className="bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-white uppercase w-28 font-mono"
                                                                    value={editForm.plate}
                                                                    onChange={(e) => setEditForm({ ...editForm, plate: e.target.value })}
                                                                />
                                                            ) : (
                                                                <span className="font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
                                                                    {unit.plate}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-zinc-400">
                                                            {isEditing ? (
                                                                <input 
                                                                    type="text" 
                                                                    className="bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-white w-28"
                                                                    value={editForm.color}
                                                                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                                                />
                                                            ) : (
                                                                unit.color || '-'
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            {isEditing ? (
                                                                <select 
                                                                    className="bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-white"
                                                                    value={editForm.status}
                                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                                >
                                                                    <option value="Tersedia">Tersedia</option>
                                                                    <option value="Terbooking">Terbooking</option>
                                                                    <option value="Rusak">Rusak</option>
                                                                    <option value="Maintenance">Maintenance</option>
                                                                    <option value="Inactive">Inactive</option>
                                                                </select>
                                                            ) : (
                                                                <span className={`px-2 py-1 text-[10px] font-black rounded-full uppercase ${getStatusStyles(unit.status)}`}>
                                                                    {unit.status}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-xs text-zinc-500">
                                                            {isEditing ? (
                                                                <input 
                                                                    type="text" 
                                                                    className="bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-white w-full"
                                                                    value={editForm.note}
                                                                    placeholder="Tulis alasan jika rusak/maint..."
                                                                    onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                                                />
                                                            ) : (
                                                                unit.note || <span className="text-zinc-800 italic">-</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {isEditing ? (
                                                                <div className="flex gap-2 justify-center">
                                                                    <button 
                                                                        onClick={() => handleSaveUnitEdit(unit.id)}
                                                                        className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded"
                                                                        title="Simpan"
                                                                    >
                                                                        <Check size={16} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setEditingUnitId(null)}
                                                                        className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                                                                        title="Batal"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-2 justify-center">
                                                                    <button 
                                                                        onClick={() => startEditUnit(unit)}
                                                                        className="p-1 text-blue-400 hover:bg-blue-500/10 rounded"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteUnit(unit.id)}
                                                                        className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                                                                        title="Hapus"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BOOKING FORM TAB */}
                    {activeTab === 'booking' && (
                        <div className="space-y-8 max-w-4xl">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">INPUT FORM BOOKING</h1>
                                <p className="text-zinc-500 text-sm mt-1">Cek bentrok ketersediaan secara otomatis dan simpan riwayat sewa motor.</p>
                            </div>

                            <div className="bg-zinc-950/80 border border-zinc-900 p-8 rounded-2xl shadow-xl">
                                <form onSubmit={handleSaveBooking} className="space-y-6">
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Nama Penyewa */}
                                        <div>
                                            <label className="block text-zinc-400 text-sm font-semibold mb-2">Nama Penyewa *</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                                placeholder="Nama lengkap penyewa..."
                                                value={bookingForm.renterName}
                                                onChange={(e) => setBookingForm({ ...bookingForm, renterName: e.target.value })}
                                                required
                                            />
                                        </div>

                                        {/* No WhatsApp */}
                                        <div>
                                            <label className="block text-zinc-400 text-sm font-semibold mb-2">No WhatsApp Aktif *</label>
                                            <input 
                                                type="tel"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                                placeholder="Contoh: 087818747396"
                                                value={bookingForm.whatsapp}
                                                onChange={(e) => setBookingForm({ ...bookingForm, whatsapp: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Motor Selection with Search */}
                                    <div className="relative">
                                        <label className="block text-zinc-400 text-sm font-semibold mb-2">Pilih Motor (Search by keyword)*</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                                            <input 
                                                type="text"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                                placeholder="Ketik tipe motor, plat, atau warna untuk menyaring..."
                                                value={bikeSearchQuery}
                                                onChange={(e) => {
                                                    setBikeSearchQuery(e.target.value);
                                                    setIsBikeDropdownOpen(true);
                                                }}
                                                onFocus={() => setIsBikeDropdownOpen(true)}
                                            />
                                        </div>

                                        {isBikeDropdownOpen && (
                                            <div className="absolute z-10 w-full bg-zinc-900 border border-zinc-800 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-2xl">
                                                {filteredBikes.length === 0 ? (
                                                    <div className="p-3 text-zinc-500 text-sm">Tidak ada motor yang cocok.</div>
                                                ) : (
                                                    filteredBikes.map((unit) => {
                                                        const isOffline = unit.status !== 'Tersedia';
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={unit.id}
                                                                onClick={() => handleFormBikeSelect(unit)}
                                                                className={`w-full text-left p-3 text-sm flex justify-between items-center transition-colors border-b border-zinc-800/40 hover:bg-zinc-800`}
                                                            >
                                                                <div>
                                                                    <span className="font-bold text-white block">{unit.name}</span>
                                                                    <span className="text-zinc-500 font-mono text-xs">{unit.plate} - {unit.color || 'Hitam'}</span>
                                                                </div>
                                                                <span className={`px-2 py-0.5 text-[9px] font-black rounded-full ${getStatusStyles(unit.status)}`}>
                                                                    {unit.status}
                                                                </span>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Date and duration */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-zinc-400 text-sm font-semibold mb-2">Tanggal Mulai Sewa *</label>
                                            <input 
                                                type="date"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#004aad]"
                                                value={bookingForm.startDate}
                                                onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-zinc-400 text-sm font-semibold mb-2">Jam Mulai Sewa *</label>
                                            <input 
                                                type="time"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#004aad]"
                                                value={bookingForm.startTime}
                                                onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-zinc-400 text-sm font-semibold mb-2">Durasi Sewa *</label>
                                            <select
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#004aad]"
                                                value={bookingForm.duration}
                                                onChange={(e) => handleFormDurationChange(Number(e.target.value))}
                                                required
                                            >
                                                <option value={6}>6 Jam</option>
                                                <option value={12}>12 Jam</option>
                                                <option value={24}>24 Jam (1 Hari)</option>
                                                <option value={48}>48 Jam (2 Hari)</option>
                                                <option value={72}>72 Jam (3 Hari)</option>
                                                <option value={168}>168 Jam (1 Minggu)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Guarantees checklist */}
                                    <div>
                                        <label className="block text-zinc-400 text-sm font-semibold mb-2">Kelengkapan Jaminan (Pilih yang diserahkan)</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-900/30 p-4 border border-zinc-900 rounded-xl">
                                            {['E-KTP', 'SIM C', 'KK', 'KTM', 'NPWP', 'STNK Pribadi', 'ID Card Karyawan', 'BPJS', 'Paspor'].map((doc) => {
                                                const isChecked = bookingForm.guarantees.includes(doc);
                                                return (
                                                    <label key={doc} className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-white font-medium">
                                                        <input 
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {
                                                                const updated = isChecked 
                                                                    ? bookingForm.guarantees.filter(g => g !== doc)
                                                                    : [...bookingForm.guarantees, doc];
                                                                setBookingForm({ ...bookingForm, guarantees: updated });
                                                            }}
                                                            className="rounded border-zinc-800 bg-zinc-900 text-[#004aad] focus:ring-0"
                                                        />
                                                        <span>{doc}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <input 
                                            type="text"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad] mt-2"
                                            placeholder="Catatan jaminan tambahan / jaminan lainnya..."
                                            value={bookingForm.customGuarantee}
                                            onChange={(e) => setBookingForm({ ...bookingForm, customGuarantee: e.target.value })}
                                        />
                                    </div>

                                    {/* Delivery options */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox"
                                                id="isDelivery"
                                                checked={bookingForm.isDelivery}
                                                onChange={(e) => setBookingForm({ ...bookingForm, isDelivery: e.target.checked })}
                                                className="rounded border-zinc-800 bg-zinc-900 text-[#004aad] focus:ring-0"
                                            />
                                            <label htmlFor="isDelivery" className="text-zinc-400 text-sm font-semibold cursor-pointer">
                                                Gunakan Jasa Pengantaran (Delivery)
                                            </label>
                                        </div>

                                        {bookingForm.isDelivery && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-900/20 border border-zinc-900 p-6 rounded-xl">
                                                
                                                {/* Delivery Zone search dropdown */}
                                                <div className="relative">
                                                    <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Zona Pengantaran *</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none"
                                                        placeholder="Cari zona/daerah..."
                                                        value={zoneSearchQuery}
                                                        onChange={(e) => {
                                                            setZoneSearchQuery(e.target.value);
                                                            setIsZoneDropdownOpen(true);
                                                        }}
                                                        onFocus={() => setIsZoneDropdownOpen(true)}
                                                    />

                                                    {isZoneDropdownOpen && (
                                                        <div className="absolute z-20 w-full bg-zinc-900 border border-zinc-800 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-2xl">
                                                            {filteredZones.map((zone, idx) => (
                                                                <button
                                                                    type="button"
                                                                    key={idx}
                                                                    onClick={() => {
                                                                        setBookingForm({ ...bookingForm, deliveryZonePrice: zone.price });
                                                                        setZoneSearchQuery(zone.label);
                                                                        setIsZoneDropdownOpen(false);
                                                                    }}
                                                                    className="w-full text-left p-2.5 text-xs text-zinc-300 hover:bg-zinc-800 border-b border-zinc-800/40"
                                                                >
                                                                    <span className="font-bold block text-white">{zone.label}</span>
                                                                    <span className="text-zinc-500">{zone.detail}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Delivery address details */}
                                                <div>
                                                    <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Alamat Pengantaran / Shareloc *</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                                        placeholder="Alamat kost/hotel/detail..."
                                                        value={bookingForm.deliveryAddress}
                                                        onChange={(e) => setBookingForm({ ...bookingForm, deliveryAddress: e.target.value })}
                                                        required={bookingForm.isDelivery}
                                                    />
                                                </div>

                                                {/* Delivery Person in charge */}
                                                <div>
                                                    <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Pengantar / Penanggung Jawab *</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                                        placeholder="Nama tim pengantar..."
                                                        value={bookingForm.deliveryStaff}
                                                        onChange={(e) => setBookingForm({ ...bookingForm, deliveryStaff: e.target.value })}
                                                        required={bookingForm.isDelivery}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cost overview */}
                                    <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900 flex justify-between items-center">
                                        <div>
                                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Total Pendapatan Terkalkulasi</span>
                                            <div className="text-2xl font-black text-emerald-400 mt-0.5 font-sans">
                                                Rp {(
                                                    Number(bookingForm.customRentalFee || 0) + 
                                                    (bookingForm.isDelivery ? Number(bookingForm.deliveryZonePrice || 0) : 0)
                                                ).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Override Biaya Sewa (Optional)</label>
                                            <input 
                                                type="number"
                                                className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white w-32 focus:outline-none text-right font-black"
                                                placeholder="Ubah harga..."
                                                value={bookingForm.customRentalFee}
                                                onChange={(e) => setBookingForm({ ...bookingForm, customRentalFee: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit button */}
                                    <button type="submit" className="w-full btn py-3.5 text-base font-bold tracking-wider">
                                        SIMPAN TRANSAKSI BOOKING
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* HISTORY LEDGER TAB */}
                    {activeTab === 'logs' && (
                        <div className="space-y-8 max-w-6xl">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">RIWAYAT PENYEWAAN (TRANS LOGS)</h1>
                                <p className="text-zinc-500 text-sm mt-1">Gunakan shortcut WA untuk mengirim pesan konfirmasi atau pengingat sewa.</p>
                            </div>

                            {/* Advanced Filters Section */}
                            <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl shadow-xl">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Search size={16} className="text-[#004aad]" />
                                    <span>Filter Pencarian Lanjutan</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {/* Text Search */}
                                    <div>
                                        <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1.5">Cari Penyewa / Plat / ID</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                            placeholder="Cari..."
                                            value={logFilterSearch}
                                            onChange={(e) => setLogFilterSearch(e.target.value)}
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1.5">Status Sewa</label>
                                        <select 
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#004aad]"
                                            value={logFilterStatus}
                                            onChange={(e) => setLogFilterStatus(e.target.value)}
                                        >
                                            <option value="Semua">Semua Status</option>
                                            <option value="Aktif">Aktif / Overdue</option>
                                            <option value="Selesai">Selesai</option>
                                        </select>
                                    </div>

                                    {/* Delivery Filter */}
                                    <div>
                                        <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1.5">Metode Penyerahan</label>
                                        <select 
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#004aad]"
                                            value={logFilterDelivery}
                                            onChange={(e) => setLogFilterDelivery(e.target.value)}
                                        >
                                            <option value="Semua">Semua Metode</option>
                                            <option value="Kirim (Delivery)">Kirim (Delivery)</option>
                                            <option value="Ambil Sendiri">Ambil Sendiri</option>
                                        </select>
                                    </div>

                                    {/* Bike Filter */}
                                    <div>
                                        <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1.5">Model Motor</label>
                                        <select 
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#004aad]"
                                            value={logFilterBike}
                                            onChange={(e) => setLogFilterBike(e.target.value)}
                                        >
                                            <option value="Semua">Semua Motor</option>
                                            {uniqueBikesInLogs.map((bike, idx) => (
                                                <option key={idx} value={bike}>{bike}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Start Date Range */}
                                    <div>
                                        <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1.5">Mulai Dari</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#004aad]"
                                            value={logFilterStartDate}
                                            onChange={(e) => setLogFilterStartDate(e.target.value)}
                                        />
                                    </div>

                                    {/* End Date Range */}
                                    <div>
                                        <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1.5">Hingga Tanggal</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#004aad]"
                                            value={logFilterEndDate}
                                            onChange={(e) => setLogFilterEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Reset button */}
                                {(logFilterSearch || logFilterStatus !== 'Semua' || logFilterDelivery !== 'Semua' || logFilterBike !== 'Semua' || logFilterStartDate || logFilterEndDate) && (
                                    <div className="flex justify-end mt-4">
                                        <button 
                                            onClick={() => {
                                                setLogFilterSearch('');
                                                setLogFilterStatus('Semua');
                                                setLogFilterDelivery('Semua');
                                                setLogFilterBike('Semua');
                                                setLogFilterStartDate('');
                                                setLogFilterEndDate('');
                                            }}
                                            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                                        >
                                            <RefreshCw size={12} />
                                            <span>Reset Filter</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Logs list table */}
                            <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-zinc-900">
                                    <h3 className="text-base font-bold text-white">Daftar Transaksi ({filteredLogs.length} Terfilter / {logs.length} Total)</h3>
                                </div>

                                {filteredLogs.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500 text-sm">Tidak ada transaksi sewa yang sesuai dengan filter pencarian.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-zinc-900/60 border-b border-zinc-900 text-zinc-500 font-bold uppercase">
                                                    <th className="p-4">ID Trans</th>
                                                    <th className="p-4">Penyewa / WA</th>
                                                    <th className="p-4">Motor / Plat</th>
                                                    <th className="p-4">Jadwal Sewa</th>
                                                    <th className="p-4">Jasa Antar</th>
                                                    <th className="p-4">Jaminan</th>
                                                    <th className="p-4">Biaya</th>
                                                    <th className="p-4 text-center">Status</th>
                                                    <th className="p-4 text-center">Aksi / Follow-up</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-900">
                                                {filteredLogs.map((log) => {
                                                    const isOverdue = log.status === 'Aktif' && isBookingOverdue(log.endDate, log.endTime);
                                                    const odHours = isOverdue ? getOverdueHours(log.endDate, log.endTime) : 0;
                                                    
                                                    // Dynamic prefilled WA texts
                                                    const welcomeMsg = `Halo ${log.renterName}, sewa motor ${log.bikeName} (${log.plate}) dari Nyetor.id sudah aktif (Kembali: ${log.endDate} jam ${log.endTime}). PJ Pengantar: ${log.deliveryStaff || 'Tim Markas'}. Terima kasih!`;
                                                    const reminderMsg = `Halo ${log.renterName}, pengingat sewa motor ${log.bikeName} (${log.plate}) Anda berakhir hari ini jam ${log.endTime}. Apakah ingin diperpanjang atau dijemput? Terima kasih!`;

                                                    return (
                                                        <tr key={log.id} className="hover:bg-zinc-900/20 text-zinc-300">
                                                            <td className="p-4 font-bold text-white font-mono">{log.id}</td>
                                                            <td className="p-4">
                                                                <span className="font-bold text-zinc-100 block">{log.renterName}</span>
                                                                <span className="text-zinc-500 font-mono">{log.phone}</span>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="font-bold block text-zinc-100">{log.bikeName}</span>
                                                                <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded font-mono uppercase inline-block mt-0.5">{log.plate}</span>
                                                            </td>
                                                            <td className="p-4 leading-relaxed font-sans">
                                                                <div><strong className="text-zinc-500">Mulai:</strong> {log.startDate} - {log.startTime}</div>
                                                                <div><strong className="text-zinc-500">Selesai:</strong> {log.endDate} - {log.endTime} ({log.duration} Jam)</div>
                                                            </td>
                                                            <td className="p-4">
                                                                {log.isDelivery ? (
                                                                    <div>
                                                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold block w-fit">DIANTAR</span>
                                                                        <span className="text-zinc-500 text-[11px] block mt-1 leading-tight">{log.deliveryZone}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] font-bold block w-fit">AMBIL SENDIRI</span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-zinc-500">
                                                                {log.guarantees && log.guarantees.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                                        {log.guarantees.map((g, i) => (
                                                                            <span key={i} className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[10px]">{g}</span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="italic text-zinc-700 font-medium">Tidak ada jaminan</span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 font-sans">
                                                                <span className="font-bold text-white block">Rp {log.totalRevenue.toLocaleString('id-ID')}</span>
                                                                <span className="text-[10px] text-zinc-500">Sewa: Rp {log.rentalFee.toLocaleString('id-ID')}</span>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                {log.status === 'Aktif' ? (
                                                                    isOverdue ? (
                                                                        <div className="flex flex-col gap-1 items-center">
                                                                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-black uppercase text-[9px] animate-pulse">OVERDUE</span>
                                                                            <span className="text-[9px] font-bold text-rose-500">+{odHours} Jam</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-black uppercase text-[9px]">AKTIF</span>
                                                                    )
                                                                ) : (
                                                                    <span className="bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded font-black uppercase text-[9px]">SELESAI</span>
                                                                )}
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    {log.status === 'Aktif' && (
                                                                        <>
                                                                            <a 
                                                                                href={getWhatsAppUrl(log.phone, welcomeMsg)}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"
                                                                                title="Kirim Konfirmasi WA"
                                                                            >
                                                                                <MessageCircle size={14} />
                                                                                <span className="ml-1 text-[10px] font-bold">Konfirmasi</span>
                                                                            </a>

                                                                            <a 
                                                                                href={getWhatsAppUrl(log.phone, reminderMsg)}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center"
                                                                                title="Kirim Pengingat WA"
                                                                            >
                                                                                <MessageCircle size={14} />
                                                                                <span className="ml-1 text-[10px] font-bold">Pengingat</span>
                                                                            </a>

                                                                            <button 
                                                                                onClick={() => {
                                                                                    setExtendingLog(log);
                                                                                    handleExtensionHoursChange(24, log.bikeName);
                                                                                }}
                                                                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all font-bold text-[10px]"
                                                                                title="Perpanjang Sewa Motor"
                                                                            >
                                                                                Perpanjang
                                                                            </button>

                                                                            <button 
                                                                                onClick={() => handleResolveBooking(log.id)}
                                                                                className="p-1.5 rounded-lg bg-[#004aad]/10 text-blue-400 border border-blue-500/20 hover:bg-[#004aad] hover:text-white transition-all"
                                                                                title="Selesaikan Rental"
                                                                            >
                                                                                Selesai
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {log.status === 'Selesai' && (
                                                                        <span className="text-zinc-600 font-semibold">Rental Selesai</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* DYNAMIC SHEETLOAD DATABASE EXCEL (XLSX) TAB */}
                    {activeTab === 'backup' && (
                        <div className="space-y-8 max-w-4xl">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">DATABASE BACKUP & SINKRONISASI</h1>
                                <p className="text-zinc-500 text-sm mt-1">Gunakan file spreadsheet XLSX sebagai database portabel Anda. Ekspor logs sewa dan status terkini.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* Export panel */}
                                <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                            <Download className="text-emerald-400" size={20} />
                                            <span>Ekspor Data ke Excel</span>
                                        </h3>
                                        <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                                            Unduh database lengkap Anda yang berisi sheet status motor harian, data riwayat logs sewa, serta panduan model motor. File Excel ini bisa Anda simpan sebagai backup utama.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <button 
                                            onClick={handleExportExcel}
                                            disabled={isLoadingXlsx}
                                            className="w-full btn py-3 font-bold flex items-center justify-center gap-2"
                                        >
                                            {isLoadingXlsx ? <RefreshCw className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
                                            <span>EKSPOR BACKUP XLSX</span>
                                        </button>
                                        <button 
                                            onClick={handleDownloadTemplate}
                                            disabled={isLoadingXlsx}
                                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all"
                                        >
                                            <Download size={16} />
                                            <span>DOWNLOAD TEMPLATE XLSX</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Import panel */}
                                <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                            <Upload className="text-blue-400" size={20} />
                                            <span>Impor Database Excel</span>
                                        </h3>
                                        <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                                            Unggah file Excel `.xlsx` backup Anda untuk memulihkan status database di browser ini. Data lama akan digantikan oleh data yang ada dalam spreadsheet.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer text-sm transition-all">
                                            {isLoadingXlsx ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                                            <span>PILIH & UNGGAH BERKAS XLSX</span>
                                            <input 
                                                type="file" 
                                                accept=".xlsx" 
                                                onChange={handleImportExcel} 
                                                className="hidden" 
                                                disabled={isLoadingXlsx}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'pricing' && (
                        <div className="space-y-8 max-w-6xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                                        <DollarSign className="text-[#004aad]" size={28} />
                                        <span>ATUR TARIF & PRICE LIST</span>
                                    </h1>
                                    <p className="text-zinc-500 text-sm mt-1">
                                        Sesuaikan tarif sewa motor secara real-time dan ekspor brosur PDF dengan desain profesional.
                                    </p>
                                </div>
                                <button 
                                    onClick={generatePricingPDF}
                                    className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 text-sm self-start md:self-auto cursor-pointer"
                                >
                                    <FileText size={18} />
                                    <span>EKSPOR PDF BROSUR</span>
                                </button>
                            </div>

                            {/* List of pricing categories */}
                            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-zinc-900 bg-zinc-900/10">
                                    <h3 className="text-base font-bold text-white uppercase tracking-wider">Kelola Daftar Tarif Motor</h3>
                                </div>
                                <div className="divide-y divide-zinc-900">
                                    {dbPricing.length === 0 ? (
                                        <div className="p-8 text-center text-zinc-500 text-sm">
                                            Memuat data tarif dari Supabase atau tabel belum dibuat...
                                        </div>
                                    ) : (
                                        dbPricing.map(bike => {
                                            return (
                                                <div key={bike.id} className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-zinc-900/10 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 shrink-0 flex items-center justify-center">
                                                            {bike.image ? (
                                                                <img src={bike.image} alt={bike.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <CameraIcon size={20} className="text-zinc-700" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-base">{bike.name}</h4>
                                                            <div className="flex gap-2 mt-1">
                                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                                                                    {bike.category.replace('_', ' ')}
                                                                </span>
                                                                {bike.is_additional && (
                                                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                                        Unit Tambahan
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-6">
                                                        {/* 3h, 6h, 12h, 24h input prices */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">3 Jam</label>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-24 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#004aad]"
                                                                    placeholder="N/A"
                                                                    value={bike.prices['3'] || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value ? Number(e.target.value) : undefined;
                                                                        const updatedPrices = { ...bike.prices };
                                                                        if (val === undefined || isNaN(val)) delete updatedPrices['3'];
                                                                        else updatedPrices['3'] = val;
                                                                        setDbPricing(prev => prev.map(p => p.id === bike.id ? { ...p, prices: updatedPrices } : p));
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">6 Jam</label>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-24 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#004aad]"
                                                                    placeholder="N/A"
                                                                    value={bike.prices['6'] || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value ? Number(e.target.value) : undefined;
                                                                        const updatedPrices = { ...bike.prices };
                                                                        if (val === undefined || isNaN(val)) delete updatedPrices['6'];
                                                                        else updatedPrices['6'] = val;
                                                                        setDbPricing(prev => prev.map(p => p.id === bike.id ? { ...p, prices: updatedPrices } : p));
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">12 Jam</label>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-24 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#004aad]"
                                                                    placeholder="N/A"
                                                                    value={bike.prices['12'] || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value ? Number(e.target.value) : undefined;
                                                                        const updatedPrices = { ...bike.prices };
                                                                        if (val === undefined || isNaN(val)) delete updatedPrices['12'];
                                                                        else updatedPrices['12'] = val;
                                                                        setDbPricing(prev => prev.map(p => p.id === bike.id ? { ...p, prices: updatedPrices } : p));
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">24 Jam</label>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-24 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#004aad]"
                                                                    placeholder="N/A"
                                                                    value={bike.prices['24'] || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value ? Number(e.target.value) : undefined;
                                                                        const updatedPrices = { ...bike.prices };
                                                                        if (val === undefined || isNaN(val)) delete updatedPrices['24'];
                                                                        else updatedPrices['24'] = val;
                                                                        setDbPricing(prev => prev.map(p => p.id === bike.id ? { ...p, prices: updatedPrices } : p));
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Toggle unit tambahan */}
                                                        <div className="flex items-center gap-2 min-w-[125px] mt-4 xl:mt-0">
                                                            <input 
                                                                type="checkbox"
                                                                id={`check-add-${bike.id}`}
                                                                className="rounded border-zinc-800 text-[#004aad] focus:ring-[#004aad] bg-zinc-900 cursor-pointer"
                                                                checked={bike.is_additional || false}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    let newCat = bike.category;
                                                                    if (checked) {
                                                                        newCat = 'unit_tambahan';
                                                                    } else {
                                                                        const staticInfo = Object.entries(catalogData).find(([cat, list]) => list.some(item => item.id === bike.id));
                                                                        if (staticInfo) {
                                                                            newCat = staticInfo[0];
                                                                        } else {
                                                                            newCat = 'super_ekonomis';
                                                                        }
                                                                    }
                                                                    setDbPricing(prev => prev.map(p => p.id === bike.id ? { ...p, is_additional: checked, category: newCat } : p));
                                                                }}
                                                            />
                                                            <label htmlFor={`check-add-${bike.id}`} className="text-xs text-zinc-400 font-bold select-none cursor-pointer">Unit Tambahan</label>
                                                        </div>

                                                        {/* Action Save button */}
                                                        <button 
                                                            onClick={() => handleSavePriceRow(bike.id, bike.prices, bike.is_additional, bike.category)}
                                                            className="bg-[#004aad] hover:bg-blue-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow transition-colors cursor-pointer w-full sm:w-auto mt-4 sm:mt-0"
                                                        >
                                                            SIMPAN
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS CREDENTIALS TAB */}
                    {activeTab === 'settings' && (
                        <div className="space-y-8 max-w-lg">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">KREDENSIAL AKSES ADMIN</h1>
                                <p className="text-zinc-500 text-sm mt-1">Ubah kata sandi akses atau username admin yang disimpan di local storage.</p>
                            </div>

                            <div className="bg-zinc-950/80 border border-zinc-900 p-8 rounded-2xl shadow-xl">
                                <form onSubmit={handleUpdateSettings} className="space-y-5">
                                    
                                    {settingsMsg.text && (
                                        <div className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
                                            settingsMsg.type === 'success' 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                        }`}>
                                            <AlertCircle size={18} />
                                            <span>{settingsMsg.text}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-zinc-400 text-sm font-semibold mb-2">Email Admin Baru (Kosongkan jika tetap)</label>
                                        <input 
                                            type="email"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                            placeholder="Masukkan email baru..."
                                            value={settingsForm.newUsername}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, newUsername: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zinc-400 text-sm font-semibold mb-2">Password Baru (Kosongkan jika tetap)</label>
                                        <input 
                                            type="password"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                            placeholder="Masukkan sandi baru..."
                                            value={settingsForm.newPassword}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-zinc-400 text-sm font-semibold mb-2">Konfirmasi Password Baru</label>
                                        <input 
                                            type="password"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                            placeholder="Ulangi sandi baru..."
                                            value={settingsForm.confirmNewPassword}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, confirmNewPassword: e.target.value })}
                                        />
                                    </div>

                                    <button type="submit" className="w-full btn py-3 font-bold tracking-wider mt-4">
                                        PERBARUI KREDENSIAL
                                    </button>
                                </form>
                            </div>

                            {/* Database settings override */}
                            <div className="bg-zinc-950/80 border border-zinc-900 p-8 rounded-2xl shadow-xl mt-6">
                                <h3 className="text-base font-bold text-white mb-4">KONEKSI DATABASE SUPABASE</h3>
                                <div className="space-y-4">
                                    <div>
                                        <span className="block text-zinc-500 text-xs font-bold uppercase">Status Koneksi</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2.5 h-2.5 rounded-full ${creds.isConfigured ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <span className="text-sm font-semibold text-zinc-300">{creds.isConfigured ? 'Terhubung (Statis)' : 'Belum Dikonfigurasi'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-zinc-500 text-xs font-bold uppercase">SUPABASE URL</span>
                                        <span className="text-sm font-mono text-zinc-400 block truncate mt-1 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800" title={creds.url}>
                                            {creds.url || 'Tidak dikonfigurasi'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                                        * Koneksi database diatur secara internal oleh developer melalui file <code>.env</code> di server.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* PREVIEW IMPORT MODAL */}
            <AnimatePresence>
                {isImportModalOpen && importPreview && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-zinc-950 border border-zinc-900 w-full max-w-4xl p-6 rounded-2xl shadow-2xl relative"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                                        <AlertTriangle className="text-blue-400" size={24} />
                                        <span>Konfirmasi Sinkronisasi Import Excel</span>
                                    </h3>
                                    <p className="text-zinc-500 text-xs mt-1">Verifikasi perubahan data di bawah ini sebelum menimpa database lokal Anda.</p>
                                </div>
                                <button 
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-900"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Warnings list */}
                            {importPreview.warnings.length > 0 && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 max-h-36 overflow-y-auto">
                                    <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <AlertTriangle size={14} />
                                        <span>Peringatan Ketidakcocokan Katalog ({importPreview.warnings.length})</span>
                                    </h4>
                                    <ul className="list-disc list-inside text-xs space-y-1">
                                        {importPreview.warnings.map((w, idx) => (
                                            <li key={idx}>{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Overview grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900">
                                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider block">Status Unit Terkini (Sheet 1)</span>
                                    <div className="text-2xl font-black text-white mt-1">{importPreview.units.length} Unit Motor</div>
                                    <p className="text-zinc-600 text-xs mt-2">Daftar motor fisik akan disinkronisasikan dengan {importPreview.units.filter(u => u.status === 'Tersedia').length} unit tersedia.</p>
                                </div>
                                <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900">
                                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider block">Riwayat Transaksi (Sheet 2)</span>
                                    <div className="text-2xl font-black text-white mt-1">{importPreview.logs.length} Log Sewa</div>
                                    <p className="text-zinc-600 text-xs mt-2">Seluruh audit log histori lama akan digantikan oleh log histori impor ini.</p>
                                </div>
                            </div>

                            {/* Warning note */}
                            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl mb-6 text-xs flex items-start gap-3">
                                <Info size={16} className="shrink-0 mt-0.5" />
                                <p className="leading-relaxed">
                                    <strong>Perhatian:</strong> Tindakan ini tidak dapat dibatalkan. Jika Anda melanjutkan, data yang saat ini disimpan di browser Anda akan sepenuhnya terhapus dan digantikan oleh file Excel ini.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 justify-end">
                                <button 
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-zinc-800"
                                >
                                    BATAL
                                </button>
                                <button 
                                    onClick={confirmImport}
                                    className="btn px-6 py-2.5 text-sm font-bold"
                                >
                                    KONFIRMASI TIMPA DATABASE
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CALENDAR DATE POPUP DETAILS MODAL */}
            <AnimatePresence>
                {selectedCalDay && (
                    <div className="fixed inset-0 z-[99] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-zinc-950 border border-zinc-900 w-full max-w-lg p-6 rounded-2xl shadow-2xl relative"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-black text-white">
                                        Detail Booking Tanggal
                                    </h3>
                                    <span className="text-[#004aad] text-sm font-bold block mt-1">
                                        {selectedCalDay.getDate()} {monthNames[selectedCalDay.getMonth()]} {selectedCalDay.getFullYear()}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setSelectedCalDay(null)}
                                    className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-900"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {calPopupData.length === 0 ? (
                                <div className="text-zinc-500 text-sm text-center py-8">
                                    Tidak ada jadwal sewa aktif pada hari ini.
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                                    {calPopupData.map((log) => {
                                        const isOverdue = log.status === 'Aktif' && isBookingOverdue(log.endDate, log.endTime);
                                        const odHours = isOverdue ? getOverdueHours(log.endDate, log.endTime) : 0;
                                        
                                        return (
                                            <div key={log.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <strong className="text-white text-sm block">{log.renterName}</strong>
                                                        <span className="text-zinc-500 text-xs font-mono">{log.phone}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase ${getStatusStyles(log.status)}`}>
                                                        {isOverdue ? `Overdue +${odHours}H` : log.status}
                                                    </span>
                                                </div>

                                                <hr className="border-zinc-800/60" />

                                                <div className="text-xs space-y-1 text-zinc-400">
                                                    <div><strong className="text-zinc-500">Unit:</strong> {log.bikeName} [{log.plate}]</div>
                                                    <div><strong className="text-zinc-500">Mulai:</strong> {log.startDate} {log.startTime}</div>
                                                    <div><strong className="text-zinc-500">Kembali:</strong> {log.endDate} {log.endTime} ({log.duration} Jam)</div>
                                                    {log.isDelivery && (
                                                        <div><strong className="text-zinc-500">Delivery:</strong> {log.deliveryZone} ({log.deliveryAddress})</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex justify-end mt-6 pt-4 border-t border-zinc-900">
                                <button 
                                    onClick={() => setSelectedCalDay(null)}
                                    className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                >
                                    TUTUP
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* RENT EXTENSION MODAL */}
            <AnimatePresence>
                {extendingLog && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-zinc-950 border border-zinc-900 w-full max-w-md p-6 rounded-2xl shadow-2xl relative"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <Clock className="text-[#004aad]" size={20} />
                                    <span>Perpanjang Durasi Sewa</span>
                                </h3>
                                <button 
                                    onClick={() => setExtendingLog(null)}
                                    className="p-1 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-900 rounded-xl p-4 mb-5 space-y-2 text-xs text-zinc-400">
                                <div className="flex justify-between">
                                    <span>Penyewa:</span>
                                    <strong className="text-zinc-200">{extendingLog.renterName}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>Motor / Plat:</span>
                                    <strong className="text-zinc-200">{extendingLog.bikeName} [{extendingLog.plate}]</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>Kembali Semula:</span>
                                    <strong className="text-zinc-300">{extendingLog.endDate} - {extendingLog.endTime}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>Durasi Semula:</span>
                                    <strong className="text-zinc-300">{extendingLog.duration} Jam</strong>
                                </div>
                            </div>

                            <form onSubmit={handleSaveExtension} className="space-y-4 text-xs text-left">
                                <div>
                                    <label className="block text-zinc-400 text-xs font-semibold mb-2">TAMBAHAN DURASI (JAM)</label>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <button 
                                            type="button"
                                            onClick={() => handleExtensionHoursChange(24, extendingLog.bikeName)}
                                            className={`py-2 rounded-lg font-bold border transition-all ${Number(extensionForm.additionalHours) === 24 ? 'bg-[#004aad] border-[#004aad] text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                                        >
                                            +1 Hari (24j)
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleExtensionHoursChange(48, extendingLog.bikeName)}
                                            className={`py-2 rounded-lg font-bold border transition-all ${Number(extensionForm.additionalHours) === 48 ? 'bg-[#004aad] border-[#004aad] text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                                        >
                                            +2 Hari (48j)
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleExtensionHoursChange(72, extendingLog.bikeName)}
                                            className={`py-2 rounded-lg font-bold border transition-all ${Number(extensionForm.additionalHours) === 72 ? 'bg-[#004aad] border-[#004aad] text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                                        >
                                            +3 Hari (72j)
                                        </button>
                                    </div>
                                    <input 
                                        type="number"
                                        min="1"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                        placeholder="Masukkan kustom jam..."
                                        value={extensionForm.additionalHours}
                                        onChange={(e) => handleExtensionHoursChange(e.target.value, extendingLog.bikeName)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-semibold mb-2">BIAYA TAMBAHAN (RP)</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad] font-mono text-sm"
                                        placeholder="Contoh: 70000"
                                        value={extensionForm.additionalFee}
                                        onChange={(e) => setExtensionForm({ ...extensionForm, additionalFee: e.target.value })}
                                        required
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full btn py-3 text-sm font-bold tracking-wider mt-4 shadow-lg shadow-blue-500/10 cursor-pointer"
                                >
                                    PROSES PERPANJANGAN
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
