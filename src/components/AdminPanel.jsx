import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Info
} from 'lucide-react';
import { catalogData, SHIPPING_ZONES } from '../data';

// Native & Fallback Hashing Helpers for database-free encryption
const getHashes = async (text) => {
    // 1. Native SHA-256 Hash
    let nativeHash = '';
    try {
        if (window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            nativeHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
    } catch (e) {
        console.warn("Native crypto subtle not available, using fallback", e);
    }
    
    // 2. Simple fallback hash for non-HTTPS / non-secure contexts
    let fallbackHash = 5381;
    for (let i = 0; i < text.length; i++) {
        fallbackHash = ((fallbackHash << 5) + fallbackHash) + text.charCodeAt(i);
    }
    const fallbackStr = 'fallback_' + (fallbackHash >>> 0).toString(16);

    return { native: nativeHash, fallback: fallbackStr };
};

// Default Credentials
const DEFAULT_USER_HASHES = { native: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', fallback: 'fallback_f12fc8e' }; // "admin"
const DEFAULT_PASS_HASHES = { native: '70ee29669a9898e23a6f837c4608e3f9111cd70c9b14dd69f75d4a1e7b5ef575', fallback: 'fallback_96abb98f' }; // "nyetoradmin"

export default function AdminPanel({ onClose }) {
    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState('');

    // Admin Dashboard Active Tab
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'fleet' | 'booking' | 'logs' | 'backup'

    // Database States
    const [fleet, setFleet] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isLoadingXlsx, setIsLoadingXlsx] = useState(false);

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

    // Load initial states from LocalStorage or sync with static catalog
    useEffect(() => {
        // Auth status persistence (session storage is appropriate for basic security)
        const sessionAuth = sessionStorage.getItem('nyetor_admin_session');
        if (sessionAuth === 'true') {
            setIsLoggedIn(true);
        }

        // Load Fleet
        const storedFleet = localStorage.getItem('nyetor_admin_units');
        if (storedFleet) {
            setFleet(JSON.parse(storedFleet));
        } else {
            // Load from catalogData
            const initialFleet = [];
            let index = 1;
            Object.entries(catalogData).forEach(([category, bikes]) => {
                if (category === 'accessories' || category === 'seasonal' || category === 'warlok') return;
                bikes.forEach((bike) => {
                    if (!initialFleet.some(f => f.bikeId === bike.id)) {
                        initialFleet.push({
                            id: `${bike.id}_${Date.now()}_${index}`,
                            bikeId: bike.id,
                            name: bike.name,
                            plate: `D ${1000 + index} NYT`,
                            color: 'Hitam',
                            status: 'Tersedia',
                            note: ''
                        });
                        index++;
                    }
                });
            });
            setFleet(initialFleet);
            localStorage.setItem('nyetor_admin_units', JSON.stringify(initialFleet));
        }

        // Load Booking logs
        const storedLogs = localStorage.getItem('nyetor_admin_logs');
        if (storedLogs) {
            setLogs(JSON.parse(storedLogs));
        }
    }, []);

    // Save helpers
    const saveFleet = (updatedFleet) => {
        setFleet(updatedFleet);
        localStorage.setItem('nyetor_admin_units', JSON.stringify(updatedFleet));
    };

    const saveLogs = (updatedLogs) => {
        setLogs(updatedLogs);
        localStorage.setItem('nyetor_admin_logs', JSON.stringify(updatedLogs));
    };

    // Handle Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError('');

        const inputUserHashes = await getHashes(usernameInput.trim());
        const inputPassHashes = await getHashes(passwordInput);

        const storedUserHash = localStorage.getItem('nyetor_admin_user_hash') || DEFAULT_USER_HASHES.native;
        const storedUserFallback = localStorage.getItem('nyetor_admin_user_fallback') || DEFAULT_USER_HASHES.fallback;
        const storedPassHash = localStorage.getItem('nyetor_admin_pass_hash') || DEFAULT_PASS_HASHES.native;
        const storedPassFallback = localStorage.getItem('nyetor_admin_pass_fallback') || DEFAULT_PASS_HASHES.fallback;

        const isUserValid = (inputUserHashes.native === storedUserHash) || (inputUserHashes.fallback === storedUserFallback);
        const isPassValid = (inputPassHashes.native === storedPassHash) || (inputPassHashes.fallback === storedPassFallback);

        if (isUserValid && isPassValid) {
            setIsLoggedIn(true);
            sessionStorage.setItem('nyetor_admin_session', 'true');
        } else {
            setAuthError('Username atau Password salah!');
        }
    };

    // Handle Logout
    const handleLogout = () => {
        setIsLoggedIn(false);
        sessionStorage.removeItem('nyetor_admin_session');
    };

    // Change Password
    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setSettingsMsg({ text: '', type: 'success' });

        const currentPassHashes = await getHashes(settingsForm.currentPassword);
        const storedPassHash = localStorage.getItem('nyetor_admin_pass_hash') || DEFAULT_PASS_HASHES.native;
        const storedPassFallback = localStorage.getItem('nyetor_admin_pass_fallback') || DEFAULT_PASS_HASHES.fallback;

        const isCurrentValid = (currentPassHashes.native === storedPassHash) || (currentPassHashes.fallback === storedPassFallback);
        if (!isCurrentValid) {
            setSettingsMsg({ text: 'Password saat ini salah!', type: 'error' });
            return;
        }

        if (settingsForm.newPassword !== settingsForm.confirmNewPassword) {
            setSettingsMsg({ text: 'Konfirmasi password baru tidak cocok!', type: 'error' });
            return;
        }

        if (settingsForm.newUsername.trim()) {
            const userHashes = await getHashes(settingsForm.newUsername.trim());
            localStorage.setItem('nyetor_admin_user_hash', userHashes.native);
            localStorage.setItem('nyetor_admin_user_fallback', userHashes.fallback);
        }

        if (settingsForm.newPassword) {
            const passHashes = await getHashes(settingsForm.newPassword);
            localStorage.setItem('nyetor_admin_pass_hash', passHashes.native);
            localStorage.setItem('nyetor_admin_pass_fallback', passHashes.fallback);
        }

        setSettingsMsg({ text: 'Kredensial berhasil diperbarui!', type: 'success' });
        setSettingsForm({
            currentPassword: '',
            newUsername: '',
            newPassword: '',
            confirmNewPassword: ''
        });
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
    const handleSaveBooking = (e) => {
        e.preventDefault();
        const { renterName, whatsapp, unitId, startDate, startTime, duration, isDelivery, deliveryZonePrice, deliveryAddress, deliveryStaff, customRentalFee, guarantees, customGuarantee } = bookingForm;

        if (!renterName || !whatsapp || !unitId || !startDate || !startTime) {
            alert('Harap isi semua field utama penyewaan!');
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

        const newLog = {
            id: transactionId,
            renterName,
            phone: whatsapp,
            unitId,
            bikeName: selectedUnit.name,
            plate: selectedUnit.plate,
            color: selectedUnit.color || 'Hitam',
            guarantees: activeGuarantees,
            startDate,
            startTime,
            duration: Number(duration),
            endDate,
            endTime,
            status: 'Aktif',
            isDelivery,
            deliveryZone: zoneLabel,
            deliveryAddress: isDelivery ? deliveryAddress : '',
            deliveryStaff: isDelivery ? deliveryStaff : '',
            rentalFee: baseRate,
            deliveryFee: delFee,
            totalRevenue: total,
            createdAt: new Date().toISOString()
        };

        // Update logs
        saveLogs([newLog, ...logs]);

        // Update motor status to "Terbooking" if the booking starts immediately or is active currently
        const startTimestamp = new Date(`${startDate}T${startTime}`).getTime();
        const endTimestamp = new Date(`${endDate}T${endTime}`).getTime();
        const currentTimestamp = Date.now();

        if (currentTimestamp >= startTimestamp && currentTimestamp <= endTimestamp) {
            const updatedFleet = fleet.map(u => {
                if (u.id === unitId) {
                    return { ...u, status: 'Terbooking' };
                }
                return u;
            });
            saveFleet(updatedFleet);
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
        alert('Booking penyewaan berhasil dicatat!');
        setActiveTab('logs');
    };

    // End/Resolve active booking
    const handleResolveBooking = (logId) => {
        const targetLog = logs.find(l => l.id === logId);
        if (!targetLog) return;

        if (window.confirm(`Apakah Anda yakin penyewaan oleh ${targetLog.renterName} sudah selesai dan unit motor sudah dikembalikan?`)) {
            // Update logs status
            const updatedLogs = logs.map(l => {
                if (l.id === logId) return { ...l, status: 'Selesai' };
                return l;
            });
            saveLogs(updatedLogs);

            // Update motor status to "Tersedia" if it is currently "Terbooking"
            const updatedFleet = fleet.map(u => {
                if (u.id === targetLog.unitId && u.status === 'Terbooking') {
                    return { ...u, status: 'Tersedia' };
                }
                return u;
            });
            saveFleet(updatedFleet);
        }
    };

    // Fleet management: add new physical unit
    const handleAddFleetUnit = (e) => {
        e.preventDefault();
        const { bikeId, plate, color, status, note } = newUnitForm;
        
        if (!bikeId || !plate) {
            alert('Harap pilih jenis motor dan isi plat nomor!');
            return;
        }

        // Get variant details from catalog
        let catalogName = '';
        Object.values(catalogData).forEach(bikes => {
            const found = bikes.find(b => b.id === bikeId);
            if (found) catalogName = found.name;
        });

        const newUnit = {
            id: `${bikeId}_${Date.now()}`,
            bikeId,
            name: catalogName,
            plate: plate.trim().toUpperCase(),
            color: color.trim() || 'Hitam',
            status,
            note: note.trim()
        };

        saveFleet([...fleet, newUnit]);
        setNewUnitForm({ bikeId: '', plate: '', color: '', status: 'Tersedia', note: '' });
        alert('Unit motor baru berhasil ditambahkan!');
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

    const handleSaveUnitEdit = (id) => {
        if (!editForm.plate.trim()) {
            alert('Plat nomor tidak boleh kosong!');
            return;
        }

        // If status changed, warn active booking conflicts
        const prevUnit = fleet.find(u => u.id === id);
        const hasActiveLog = logs.some(l => l.unitId === id && l.status === 'Aktif');

        if (prevUnit.status === 'Terbooking' && editForm.status !== 'Terbooking' && hasActiveLog) {
            const proceed = window.confirm('Peringatan: Motor ini masih memiliki penyewaan yang sedang aktif. Mengubah status unit akan memutus sinkronisasi harian. Lanjutkan?');
            if (!proceed) return;
        }

        const updatedFleet = fleet.map(u => {
            if (u.id === id) {
                return {
                    ...u,
                    plate: editForm.plate.trim().toUpperCase(),
                    color: editForm.color.trim(),
                    status: editForm.status,
                    note: editForm.note.trim()
                };
            }
            return u;
        });

        saveFleet(updatedFleet);
        setEditingUnitId(null);
    };

    const handleDeleteUnit = (id) => {
        const hasActiveLog = logs.some(l => l.unitId === id && l.status === 'Aktif');
        if (hasActiveLog) {
            alert('Gagal menghapus! Unit motor ini sedang memiliki transaksi sewa aktif.');
            return;
        }

        if (window.confirm('Apakah Anda yakin ingin menghapus unit motor ini secara permanen dari armada?')) {
            const updatedFleet = fleet.filter(u => u.id !== id);
            saveFleet(updatedFleet);
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

    const confirmImport = () => {
        if (!importPreview) return;
        saveFleet(importPreview.units);
        saveLogs(importPreview.logs);
        setIsImportModalOpen(false);
        setImportPreview(null);
        alert('Data berhasil di-import dan disinkronkan!');
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
                        {authError && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg flex items-center gap-2 text-sm">
                                <AlertTriangle size={18} className="shrink-0 animate-bounce" />
                                <span>{authError}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-zinc-300 text-sm font-semibold mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-zinc-500" size={18} />
                                <input 
                                    type="text" 
                                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#004aad] focus:ring-1 focus:ring-[#004aad] transition-all text-sm"
                                    placeholder="Masukkan username..."
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

    // MAIN ADMIN PANEL VIEW
    return (
        <div className="fixed inset-0 z-50 bg-[#07070a] text-zinc-300 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="bg-zinc-950 border-b border-zinc-900 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <img src="/Nyetor Logo Transparent.png" alt="Nyetor Logo" className="h-10 brightness-200" />
                    <div className="h-6 w-[1px] bg-zinc-800" />
                    <span className="text-[#004aad] font-black tracking-widest text-sm uppercase">DATABASE CONTROL PANEL</span>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose} 
                        className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Halaman Utama
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all p-2 rounded-lg"
                        title="Keluar"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            {/* Sidebar & content container */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-zinc-950/50 border-r border-zinc-900 flex flex-col justify-between shrink-0 p-4">
                    <nav className="space-y-1">
                        <button 
                            onClick={() => setActiveTab('summary')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'summary' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'}`}
                        >
                            <BarChart2 size={18} />
                            <span>Dashboard & Kalender</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('fleet')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'fleet' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'}`}
                        >
                            <Wrench size={18} />
                            <span>Pengelolaan Armada</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('booking')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'booking' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'}`}
                        >
                            <Plus size={18} />
                            <span>Input Booking Form</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('logs')}
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
                            onClick={() => setActiveTab('backup')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'backup' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'}`}
                        >
                            <FileSpreadsheet size={18} />
                            <span>Database Excel (XLSX)</span>
                        </button>
                    </nav>

                    <div className="border-t border-zinc-900 pt-4">
                        <button 
                            onClick={() => setActiveTab('settings')}
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

                            {/* Logs list table */}
                            <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-zinc-900">
                                    <h3 className="text-base font-bold text-white">Daftar Transaksi ({logs.length} Tercatat)</h3>
                                </div>

                                {logs.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500 text-sm">Belum ada transaksi penyewaan yang dicatat.</div>
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
                                                {logs.map((log) => {
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
                                        <label className="block text-zinc-400 text-sm font-semibold mb-2">Password Saat Ini (Wajib) *</label>
                                        <input 
                                            type="password"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#004aad]"
                                            placeholder="Masukkan sandi saat ini untuk validasi..."
                                            value={settingsForm.currentPassword}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <hr className="border-zinc-900" />

                                    <div>
                                        <label className="block text-zinc-400 text-sm font-semibold mb-2">Username Baru (Kosongkan jika tetap)</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-700 focus:outline-none focus:border-[#004aad]"
                                            placeholder="Masukkan username baru..."
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
        </div>
    );
}
