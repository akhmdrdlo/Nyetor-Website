const prices = {
    general: {
        beat_deluxe: 100000,
        vario_125: 120000,
        nmax: 150000,
        pcx: 160000
    },
    student: { // Example discount for students (Mock Data)
        beat_deluxe: 90000,
        vario_125: 110000,
        nmax: 140000,
        pcx: 150000
    }
};

const form = document.getElementById('bookingForm');
const bikeSelect = document.getElementById('bikeSelect');
const durationSelect = document.getElementById('duration');
const helmetCheck = document.getElementById('helmetExtra');
const totalDisplay = document.getElementById('totalDisplay');

// Calculation Logic
function calculateTotal() {
    const selectedBike = bikeSelect.value;
    const duration = parseInt(durationSelect.value);
    const hasHelmet = helmetCheck.checked;
    
    if (!selectedBike) return 0;
    
    // Get Base Price (Assuming General for now logic)
    // TODO: Switch based on userType (Mahasiswa vs Umum)
    let basePrice = prices.general[selectedBike] || 100000;
    
    // Duration Logic (Example: Base is 24h, 12h is 60? or flat?)
    // Using flat rates for prototype logic:
    // If 12h -> 70% of 24h? Or just flat.
    // User data implies "Cost" in table. Let's assume the dropdown "data-price" is the base (24h).
    let currentPrice = parseInt(bikeSelect.options[bikeSelect.selectedIndex].getAttribute('data-price') || 0);

    // Simple multiplier logic test
    if (duration === 12) currentPrice = currentPrice * 0.7; // Discount for 12h
    if (duration === 48) currentPrice = currentPrice * 2;   // 2 Days

    // Addons
    if (hasHelmet) currentPrice += 10000;

    return Math.round(currentPrice);
}

function updateDisplay() {
    const total = calculateTotal();
    totalDisplay.innerText = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total);
}

form.addEventListener('change', updateDisplay);

// Form Submission & PDF Generation
let submitted = false;

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 1. Generate Invoice Data
    const name = document.getElementById('fullName').value;
    const phone = document.getElementById('whatsapp').value;
    const bike = bikeSelect.options[bikeSelect.selectedIndex].text;
    const total = calculateTotal();
    const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total);
    
    // Fill Invoice Template
    document.getElementById('inv-name').innerText = name;
    document.getElementById('inv-phone').innerText = phone;
    document.getElementById('inv-sign-name').innerText = name;
    document.getElementById('inv-date').innerText = `Bandung, ${new Date().toLocaleDateString('id-ID')}`;
    document.getElementById('inv-total').innerText = formattedTotal;
    
    // Generate Invoice Items Rows
    const tbody = document.getElementById('invoice-items');
    tbody.innerHTML = `
        <tr>
            <td>1</td>
            <td>
                <strong>Rental ${durationSelect.options[durationSelect.selectedIndex].text}</strong><br>
                <small>${bike}</small>
            </td>
            <td style="text-align: right;">${formattedTotal}</td>
        </tr>
    `;
    
    if (helmetCheck.checked) {
         tbody.innerHTML += `
        <tr>
            <td>2</td>
            <td><strong>Tambahan Helm</strong></td>
            <td style="text-align: right;">IDR 10.000</td>
        </tr>`;
    }

    // 2. Generate PDF
    const element = document.getElementById('invoice-container');
    const opt = {
        margin:       0,
        filename:     `Invoice_Nyetor_${name.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
        // 3. Show Success & Set WhatsApp Link
        const message = `Halo Admin Nyetor, saya sudah booking atas nama ${name}. Lampiran invoice sudah saya download. Mohon dicek.`;
        const waUrl = `https://wa.me/6287818747396?text=${encodeURIComponent(message)}`;
        document.getElementById('waLink').href = waUrl;
        
        document.getElementById('successModal').classList.add('active');
        
        // 4. Submit to Google Form (Invisible)
        // Check if config is ready (mock logic)
        // const googleFormUrl = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse";
        // form.action = googleFormUrl;
        // form.target = "hidden_iframe";
        // submitted = true;
        // form.submit();
        
        // Since we can't really submit without IDs, we stop here for prototype
        console.log("Invoice Generated. Form submission pending Google Entry IDs.");
    });
});
