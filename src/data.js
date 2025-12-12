export const catalogData = {
    super_ekonomis: [
        {
            id: "mio_m3",
            name: "YAMAHA MIO M3",
            image: "/mio.png",
            prices: { 6: 35000, 12: 45000, 24: 70000 },
            features: ["Include Sarung Tangan"]
        },
        {
            id: "vario_kzr",
            name: "HONDA VARIO KZR",
            image: "/vario_kzr.png",
            prices: { 3: 30000, 6: 35000, 12: 55000, 24: 85000 },
            features: []
        },
        {
            id: "beat_pop",
            name: "HONDA BEAT POP",
            image: "/beat_pop.png",
            prices: { 3: 35000, 6: 40000, 12: 60000, 24: 90000 },
            features: ["Include Sarung Tangan"]
        }
    ],
    ekonomis: [
        {
            id: "genio",
            name: "HONDA GENIO 2022",
            image: "/genio2022.png",
            prices: { 3: 40000, 6: 45000, 12: 65000, 24: 105000 },
            features: ["Include Sarung Tangan"]
        },
        {
            id: "beat_street",
            name: "HONDA BEAT STREET / BEAT 2018 *",
            image: "/beat_streetnew.png",
            prices: { 3: 40000, 6: 45000, 12: 65000, 24: 105000 },
            features: []
        },
        {
            id: "beat_deluxe",
            name: "HONDA BEAT DELUXE",
            image: "/beat_deluxe.png",
            prices: { 3: 40000, 6: 45000, 12: 65000, 24: 110000 },
            features: ["Include Sarung Tangan"]
        },
        {
            id: "scoopy_2023",
            name: "HONDA SCOOPY 2023",
            image: "/scoopy2023.png",
            prices: { 3: 45000, 6: 50000, 12: 70000, 24: 110000 },
            features: ["Include Sarung Tangan"]
        }
    ],
    silver: [
        {
            id: "scoopy_keyless",
            name: "ALLNEW SCOOPY KEYLESS 2025",
            image: "/scoopy_keyless.png",
            prices: { 3: 45000, 6: 50000, 12: 75000, 24: 115000 },
            features: []
        },
        {
            id: "gear_matic",
            name: "YAMAHA GEAR MATIC",
            image: "/gear_matic.png",
            prices: { 3: 45000, 6: 50000, 12: 75000, 24: 120000 },
            features: ["Include Sarung Tangan"]
        },
        {
            id: "vario_led_old",
            name: "VARIO LED OLD",
            image: "/vario_ledOld.png", // Using led150 as placeholder for old led or closest match
            prices: { 3: 50000, 6: 55000, 12: 75000, 24: 125000 },
            features: []
        },
        {
            id: "vario_led_new",
            name: "VARIO LED NEW",
            image: "/vario_led_new.png",
            prices: { 3: 50000, 6: 55000, 12: 80000, 24: 130000 },
            features: []
        },
        {
            id: "vario_150_keyless",
            name: "VARIO 150CC KEYLESS",
            image: "/vario_led150.png",
            prices: { 3: 55000, 6: 60000, 12: 80000, 24: 135000 },
            features: ["Include Sarung Tangan"]
        }
    ],
    gold: [
        {
            id: "pcx_vario160",
            name: "HONDA PCX / VARIO 160 *",
            image: "/pcxnew.png",
            prices: { 3: 55000, 6: 60000, 12: 85000, 24: 140000 },
            features: []
        },
        {
            id: "nmax_old",
            name: "YAMAHA NMAX OLD 2019",
            image: "/nmax.png",
            prices: { 3: 55000, 6: 60000, 12: 85000, 24: 145000 },
            features: []
        },
        {
            id: "nmax_keyless",
            name: "YAMAHA NMAX KEYLESS",
            image: "/nmax_keyless.png",
            prices: { 3: 55000, 6: 65000, 12: 90000, 24: 150000 },
            features: []
        }
    ],
    accessories: [
        {
            id: "helm_bogo",
            name: "HELM BOGO",
            image: "/bogo.png",
            prices: { 12: 15000, 24: 20000 },
            features: ["Dapat 2 Helm jika sewa motor"]
        },
        {
            id: "helm_ink_gmt",
            name: "HELM INK & GMT",
            image: "/ink_gmt.png",
            prices: { 12: 12000, 24: 22000 },
            features: []
        },
        {
            id: "helm_alv",
            name: "HELM ALV",
            image: "/alv.png",
            prices: { 12: 20000, 24: 25000 },
            features: []
        },
        {
            id: "backpack",
            name: "SEWA BACKPACK",
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400", // Keep Unsplash for Backpack as file not found
            prices: { 12: 15000, 24: 20000 },
            features: ["Kapasitas Besar"]
        }
    ],
    // CHRISTMAS SPECIAL CATALOG (Dec 23 - Jan 3)
    christmas: [
        {
            id: "mio_m3_xmas",
            name: "YAMAHA MIO M3",
            image: "/mio.png",
            prices: { 12: 60000, 24: 80000 },
            features: []
        },
        {
            id: "vario_kzr_xmas",
            name: "HONDA VARIO KZR",
            image: "/vario_kzr.png",
            prices: { 6: 50000, 12: 65000, 24: 100000 },
            features: []
        },
        {
            id: "beat_pop_xmas",
            name: "HONDA BEAT POP",
            image: "/beat_pop.png",
            prices: { 6: 50000, 12: 70000, 24: 105000 },
            features: []
        },
        {
            id: "xride_xmas",
            name: "YAMAHA XRIDE",
            image: "/mio.png", // Placeholder using Mio as Xride similar/same brand if img missing
            prices: { 6: 55000, 12: 70000, 24: 110000 },
            features: []
        },
        {
            id: "gear_matic_xmas",
            name: "YAMAHA GEAR MATIC",
            image: "/gear_matic.png",
            prices: { 6: 60000, 12: 75000, 24: 115000 },
            features: []
        },
        {
            id: "genio_xmas",
            name: "HONDA GENIO",
            image: "/genio2022.png",
            prices: { 6: 65000, 12: 75000, 24: 120000 },
            features: []
        },
        {
            id: "beat_deluxe_xmas",
            name: "HONDA BEAT DELUXE",
            image: "/beat_deluxe.png",
            prices: { 6: 65000, 12: 80000, 24: 125000 },
            features: []
        },
        {
            id: "scoopy_2023_xmas",
            name: "HONDA SCOOPY 2023",
            image: "/scoopy2023.png",
            prices: { 6: 70000, 12: 85000, 24: 130000 },
            features: []
        },
        {
            id: "scoopy_keyless_xmas",
            name: "ALLNEW SCOOPY KEYLESS 2025",
            image: "/scoopy_keyless.png",
            prices: { 6: 70000, 12: 85000, 24: 135000 },
            features: []
        },
        {
            id: "vario_led_old_xmas",
            name: "VARIO LED OLD",
            image: "/vario_ledOld.png",
            prices: { 6: 70000, 12: 90000, 24: 140000 },
            features: []
        },
        {
            id: "vario_led_new_xmas",
            name: "VARIO LED NEW",
            image: "/vario_led_new.png",
            prices: { 6: 70000, 12: 90000, 24: 145000 },
            features: []
        },
        {
            id: "vario_150_keyless_xmas",
            name: "VARIO 150CC KEYLESS",
            image: "/vario_led150.png",
            prices: { 6: 75000, 12: 95000, 24: 150000 },
            features: []
        },
        {
            id: "pcx_xmas",
            name: "HONDA PCX",
            image: "/pcx.png",
            prices: { 6: 75000, 12: 95000, 24: 155000 },
            features: []
        },
        {
            id: "nmax_old_xmas",
            name: "YAMAHA NMAX OLD 2019",
            image: "/nmax.png",
            prices: { 6: 85000, 12: 100000, 24: 155000 },
            features: []
        },
        {
            id: "nmax_keyless_xmas",
            name: "YAMAHA NMAX KEYLESS 2021",
            image: "/nmax_keyless.png",
            prices: { 6: 85000, 12: 100000, 24: 155000 },
            features: []
        }
    ]
};
