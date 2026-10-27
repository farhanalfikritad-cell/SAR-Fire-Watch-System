/**
 * SAR FireWatch - Realistic Operational Simulation Data
 * (c) 2026 BASARNAS & Pusat Operasi SAR Karhutla Terpadu
 * 
 * CATATAN PENTING: Seluruh data dalam berkas ini berlabel SIMULASI.
 * Didesain dengan koordinat nyata kawasan rawan karhutla di Indonesia
 * (Riau, Jambi, Sumsel, Kalteng, Kalbar, Kalsel) untuk keperluan evaluasi & operasional.
 */

window.SAR_DATA = (function () {
  // Mode Operasional: 'LIVE' (Mode Asli / Aktual) vs 'SIMULATION' (Simulasi Latihan)
  let operationalMode = localStorage.getItem('SAR_OPERATIONAL_MODE') || 'LIVE';
  let userDeviceLocation = null; // Menyimpan koordinat GPS fisik asli dari browser HTML5

  const ROLES = {
    ADMIN: { id: 'admin', name: 'Administrator Sistem', badge: 'Superadmin', level: 100 },
    COMMANDER: { id: 'commander', name: 'Komandan Operasi SAR (SMC)', badge: 'Komando', level: 90 },
    OPERATOR: { id: 'operator', name: 'Operator Pusat Kendali', badge: 'Pusdalops', level: 80 },
    COORDINATOR: { id: 'coordinator', name: 'Koordinator Lapangan (OSC)', badge: 'Posko Aju', level: 70 },
    PERSONNEL: { id: 'personnel', name: 'Personel SAR Lapangan (SRU)', badge: 'Lapangan', level: 50 },
    ANALYST: { id: 'analyst', name: 'Analis Data & Pelaporan', badge: 'Intelijen & SITREP', level: 60 }
  };

  let currentUser = {
    id: 'USR-001',
    name: 'Budi Santoso, S.Sos., M.M.',
    rank: 'Kolonel SAR / Direktur Operasi',
    callsign: 'Pusdalops-SMC-1',
    role: ROLES.COMMANDER,
    station: 'Pusat Kendali Operasi Nasional BASARNAS',
    avatar: '👨‍✈️'
  };

  const PROVINCES = [
    'Riau',
    'Kalimantan Tengah',
    'Sumatera Selatan',
    'Kalimantan Barat',
    'Jambi',
    'Kalimantan Selatan',
    'Aceh'
  ];

  let incidents = [
    {
      id: 'INC-2026-RI-001',
      code: 'RI-001-KMP',
      title: 'Kebakaran Lahan Gambut Dalam Rimbo Panjang',
      locationName: 'Desa Rimbo Panjang, Kec. Tambang',
      regency: 'Kabupaten Kampar',
      province: 'Riau',
      lat: 0.4418,
      lng: 101.3284,
      reportedAt: '2026-10-27T06:15:00+07:00',
      updatedAt: '2026-10-27T09:45:00+07:00',
      source: 'Satelit S-NPP VIIRS + Laporan Posko',
      sourceReliability: 'Terverifikasi 98% (Ground Check)',
      status: 'Ditangani', // Baru, Diverifikasi, Ditangani, Terkendali, Selesai
      priority: 'Kritis', // Kritis, Tinggi, Sedang, Rendah
      peatDepthM: 3.2,
      fuelType: 'Lahan Gambut Tebal + Semak Belukar',
      windSpeedKmh: 24,
      windDirection: 'Tenggara ke Barat Laut',
      windDegree: 135,
      ispuValue: 324, // Berbahaya
      distanceToSettlementKm: 0.65,
      settlementName: 'Dusun III Rimbo Panjang (120 KK)',
      vitalFacilities: ['SDN 012 Tambang (400m)', 'Gardu Induk PLN Kampar Barat (1.1km)'],
      estimatedAreaHa: 48.5,
      potentialThreatAreaHa: 120.0,
      threatenedCivilians: 480,
      evacuatedCivilians: 310,
      commanderInCharge: 'Kapten SAR Hendra Wijaya (OSC Kampar)',
      assignedTeams: ['TM-SAR-01', 'TM-MA-02', 'TM-REL-01'],
      assignedFleet: ['HELI-01', 'TRK-01', 'PMP-01'],
      priorityReason: 'Api menjalar ke arah permukiman (jarak <700m) terbawa angin kencang 24 km/jam. Titik api di kedalaman gambut >3 meter menghasilkan asap pekat beracun (ISPU 324).',
      notes: 'Fokus pemadaman di perimeter utara untuk memotong jalur rambatan menuju perumahan warga. Water bombing heli telah melakukan 14 sorties.',
      chronology: [
        { time: '2026-10-27 06:15', actor: 'Sistem FIRMS', note: 'Deteksi anomali termal 42 MW oleh satelit VIIRS S-NPP.' },
        { time: '2026-10-27 06:40', actor: 'Operator Pusdalops', note: 'Status diubah ke Diverifikasi. Notifikasi dikirim ke Posko Aju Kampar.' },
        { time: '2026-10-27 07:10', actor: 'Kapten Hendra (OSC)', note: 'Verifikasi lapangan konfirmasi karhutla gambut seluas 18 Ha. Prioritas dinaikkan menjadi KRITIS.' },
        { time: '2026-10-27 07:45', actor: 'Kolonel Budi (SMC)', note: 'Pengerahan Tim Rescue Alfa, Manggala Agni Daops Siak, serta otorisasi Heli Water Bombing Bell 412.' },
        { time: '2026-10-27 09:00', actor: 'Tim Lapangan', note: 'Evakuasi 310 warga Dusun III ke GOR Tambang selesai dilaksanakan dengan aman.' },
        { time: '2026-10-27 09:45', actor: 'Heli Unit 1', note: 'Selesai sortie ke-14 water bombing di sektor pemotongan api barat daya.' }
      ],
      decisionLogs: [
        { time: '2026-10-27 07:40', decision: 'Prioritaskan pembuatan parit basah (blocking canal) selebar 4 meter di barat desa.', author: 'Komandan Budi Santoso' },
        { time: '2026-10-27 08:30', decision: 'Tutup akses Jalan Lintas Tambang Barat sejauh 2 km akibat jarak pandang turun ke 150 meter.', author: 'Koordinator Hendra Wijaya' }
      ],
      photos: [
        { url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=600', caption: 'Penyekatan api gambut menggunakan pompa apung Mark-3 di sektor utara' },
        { url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600', caption: 'Kondisi asap pekat menyelimuti akses jalan desa' }
      ]
    },
    {
      id: 'INC-2026-KT-002',
      code: 'KT-002-PLS',
      title: 'Karhutla Kawasan Lindung Gambut Sebangau',
      locationName: 'Desa Taruna Jaya, Kec. Jabiren Raya',
      regency: 'Kabupaten Pulang Pisau',
      province: 'Kalimantan Tengah',
      lat: -2.3921,
      lng: 114.1534,
      reportedAt: '2026-10-27T05:30:00+07:00',
      updatedAt: '2026-10-27T09:20:00+07:00',
      source: 'Patroli Udara Drone FLIR & Citra BRIN',
      sourceReliability: 'Terverifikasi 95%',
      status: 'Ditangani',
      priority: 'Kritis',
      peatDepthM: 4.1,
      fuelType: 'Hutan Rawa Gambut Dalam',
      windSpeedKmh: 18,
      windDirection: 'Selatan ke Utara',
      windDegree: 180,
      ispuValue: 285,
      distanceToSettlementKm: 1.2,
      settlementName: 'Dusun Taruna Sejahtera (85 KK)',
      vitalFacilities: ['Puskesmas Pembantu Jabiren (1.8km)', 'Jembatan Trans-Kalimantan (3.5km)'],
      estimatedAreaHa: 62.0,
      potentialThreatAreaHa: 200.0,
      threatenedCivilians: 320,
      evacuatedCivilians: 195,
      commanderInCharge: 'Mayor SAR Rahmat Hidayat (OSC Pulang Pisau)',
      assignedTeams: ['TM-SAR-03', 'TM-MA-04'],
      assignedFleet: ['HELI-02', 'TRK-03', 'PMP-02'],
      priorityReason: 'Kebakaran merambat di kubah gambut Sebangau sedalam 4m dengan titik api bawah tanah (ground fire). Mendekati batas koridor satwa dan permukiman transmigran.',
      notes: 'Water bombing Kamov Ka-32 diarahkan ke inti kubah gambut yang sulit dijangkau tim darat.',
      chronology: [
        { time: '2026-10-27 05:30', actor: 'Drone Patroli', note: 'Sensor thermal mendeteksi suhu permukaan 520°C di petak 14B Sebangau.' },
        { time: '2026-10-27 06:15', actor: 'Pusdalops Palangkaraya', note: 'Status terverifikasi, mengerahkan SRU 3 dan Tim Manggala Agni Kapuas.' },
        { time: '2026-10-27 08:00', actor: 'Mayor Rahmat', note: 'Tim darat tiba di bibir kanal, mulai injeksi gambut pipa suntik.' }
      ],
      decisionLogs: [
        { time: '2026-10-27 07:15', decision: 'Dikerahkan helikopter Kamov Ka-32 dengan kapasitas bucket 5.000 liter dari Bandara Tjilik Riwut.', author: 'Komandan Budi Santoso' }
      ],
      photos: [
        { url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600', caption: 'Tim pemadam melakukan metode peat injection di kanal primer' }
      ]
    },
    {
      id: 'INC-2026-SS-003',
      code: 'SS-003-OKI',
      title: 'Titik Api Lahan Tidun Pampangan - Tulung Selapan',
      locationName: 'Kec. Tulung Selapan & Pampangan',
      regency: 'Kabupaten Ogan Komering Ilir',
      province: 'Sumatera Selatan',
      lat: -3.2845,
      lng: 105.1204,
      reportedAt: '2026-10-27T04:50:00+07:00',
      updatedAt: '2026-10-27T08:50:00+07:00',
      source: 'Sensor BRIN & Laporan MPA',
      sourceReliability: 'Terverifikasi 92%',
      status: 'Ditangani',
      priority: 'Tinggi',
      peatDepthM: 2.1,
      fuelType: 'Lahan Terbuka Gambut Bekas Tebasan',
      windSpeedKmh: 16,
      windDirection: 'Tenggara ke Barat Laut',
      windDegree: 140,
      ispuValue: 195,
      distanceToSettlementKm: 2.8,
      settlementName: 'Desa Simpang Tiga Sakti (140 KK)',
      vitalFacilities: ['SMP Negeri 2 Tulung Selapan (3.1km)'],
      estimatedAreaHa: 35.0,
      potentialThreatAreaHa: 90.0,
      threatenedCivilians: 450,
      evacuatedCivilians: 80,
      commanderInCharge: 'Iptu Dian Prasetya (Koordinator BPBD OKI)',
      assignedTeams: ['TM-SAR-02', 'TM-REL-02'],
      assignedFleet: ['TRK-02', 'PMP-03'],
      priorityReason: 'Arah asap mengarah ke koridor udara Palembang dan tol Trans Sumatera. Risiko eskalasi cepat jika angin siang meningkat.',
      notes: 'Pembasahan lahan (rewetting) memanfaatkan embung terdekat.',
      chronology: [
        { time: '2026-10-27 04:50', actor: 'Sensor BRIN', note: 'Muncul 8 hotspot berurutan di sepanjang parit lama.' },
        { time: '2026-10-27 06:30', actor: 'Tim MPA Tulung', note: 'Mulai pemadaman manual di tapal batas.' }
      ],
      decisionLogs: [
        { time: '2026-10-27 07:00', decision: 'Tambah 3 unit pompa apung tekanan tinggi untuk mengalirkan air dari Sungai Jeruju.', author: 'Iptu Dian Prasetya' }
      ],
      photos: []
    },
    {
      id: 'INC-2026-KB-004',
      code: 'KB-004-KBR',
      title: 'Karhutla Perbatasan Lahan Gambut Rasau Jaya',
      locationName: 'Desa Rasau Jaya Tiga, Kec. Rasau Jaya',
      regency: 'Kabupaten Kubu Raya',
      province: 'Kalimantan Barat',
      lat: -0.1982,
      lng: 109.3812,
      reportedAt: '2026-10-26T21:40:00+07:00',
      updatedAt: '2026-10-27T08:15:00+07:00',
      source: 'Laporan Petugas Posko',
      sourceReliability: 'Terverifikasi 90%',
      status: 'Ditangani',
      priority: 'Tinggi',
      peatDepthM: 1.8,
      fuelType: 'Semak Pakis & Belukar Gambut Kering',
      windSpeedKmh: 14,
      windDirection: 'Barat Daya ke Timur Laut',
      windDegree: 215,
      ispuValue: 180,
      distanceToSettlementKm: 1.85,
      settlementName: 'Kompleks Transmigrasi Rasau Baru (90 KK)',
      vitalFacilities: ['Radius 9 km dari Runway Bandara Supadio'],
      estimatedAreaHa: 22.0,
      potentialThreatAreaHa: 60.0,
      threatenedCivilians: 270,
      evacuatedCivilians: 45,
      commanderInCharge: 'Lettu SAR Wahyu Hidayat',
      assignedTeams: ['TM-SAR-04'],
      assignedFleet: ['TRK-04'],
      priorityReason: 'Asap berpotensi mengganggu jalur pendaratan Bandara Internasional Supadio Pontianak jika terjadi pembalikan termal pagi hari.',
      notes: 'Penyekatan parit air berhasil membatasi rambatan ke sisi timur.',
      chronology: [
        { time: '2026-10-26 21:40', actor: 'Warga Desa', note: 'Laporan nyala api di tepi parit 5.' },
        { time: '2026-10-27 01:00', actor: 'Tim Damkar Kubu Raya', note: 'Operasi pembasahan malam hari.' }
      ],
      decisionLogs: [],
      photos: []
    },
    {
      id: 'INC-2026-JB-005',
      code: 'JB-005-MJB',
      title: 'Titik Api Lahan Gambut Dekat Hutan Lindung Kumpeh',
      locationName: 'Desa Betung, Kec. Kumpeh Ilir',
      regency: 'Kabupaten Muaro Jambi',
      province: 'Jambi',
      lat: -1.4872,
      lng: 104.0152,
      reportedAt: '2026-10-27T07:10:00+07:00',
      updatedAt: '2026-10-27T09:30:00+07:00',
      source: 'Satelit NOAA-20 VIIRS',
      sourceReliability: 'Terverifikasi 88%',
      status: 'Diverifikasi',
      priority: 'Sedang',
      peatDepthM: 1.5,
      fuelType: 'Vegetasi Sekunder & Gambut Dangkal',
      windSpeedKmh: 12,
      windDirection: 'Timur ke Barat',
      windDegree: 90,
      ispuValue: 142,
      distanceToSettlementKm: 4.2,
      settlementName: 'Dusun Betung Hilir',
      vitalFacilities: ['Kawasan Hutan Lindung Gambut Kumpeh (1.5km)'],
      estimatedAreaHa: 14.5,
      potentialThreatAreaHa: 45.0,
      threatenedCivilians: 90,
      evacuatedCivilians: 0,
      commanderInCharge: 'Mayor SAR Bambang Setiawan (Jambi)',
      assignedTeams: ['TM-MA-05'],
      assignedFleet: ['TRK-05'],
      priorityReason: 'Jarak ke permukiman relatif aman (>4 km), namun titik api berdekatan dengan zona inti hutan lindung.',
      notes: 'Tim ground check sedang melakukan pemasangan sekat bakar darurat.',
      chronology: [
        { time: '2026-10-27 07:10', actor: 'NOAA-20', note: 'Hotspot terdeteksi pada radiasi 28 MW.' }
      ],
      decisionLogs: [],
      photos: []
    },
    {
      id: 'INC-2026-KS-006',
      code: 'KS-006-BJB',
      title: 'Pendinginan Bekas Karhutla Liang Anggang',
      locationName: 'Kec. Liang Anggang',
      regency: 'Kota Banjarbaru',
      province: 'Kalimantan Selatan',
      lat: -3.4512,
      lng: 114.7189,
      reportedAt: '2026-10-25T14:00:00+07:00',
      updatedAt: '2026-10-27T09:00:00+07:00',
      source: 'Patroli Terpadu Posko Banjarbaru',
      sourceReliability: 'Terverifikasi 99%',
      status: 'Terkendali',
      priority: 'Rendah',
      peatDepthM: 1.2,
      fuelType: 'Lahan Bekas Terbakar & Asap Tipis Sisa Gambut',
      windSpeedKmh: 10,
      windDirection: 'Tenggara ke Barat Laut',
      windDegree: 130,
      ispuValue: 88,
      distanceToSettlementKm: 2.1,
      settlementName: 'Kelurahan Landasan Ulin Selatan',
      vitalFacilities: ['Jalan Lingkar Luar Selatan Banjarbaru'],
      estimatedAreaHa: 18.0,
      potentialThreatAreaHa: 18.0,
      threatenedCivilians: 0,
      evacuatedCivilians: 0,
      commanderInCharge: 'Kapten SAR Denny Kurniawan',
      assignedTeams: ['TM-REL-03'],
      assignedFleet: ['PMP-04'],
      priorityReason: 'Api permukaan telah padam 100%. Dilakukan operasi pendinginan (mopping up) bara gambut bawah permukaan agar tidak menyala kembali.',
      notes: 'Penyiraman intensif terus dilakukan menggunakan pompa apung sumur bor.',
      chronology: [
        { time: '2026-10-25 14:00', actor: 'Damkar BJB', note: 'Laporan api aktif.' },
        { time: '2026-10-26 18:00', actor: 'Komandan Posko', note: 'Api permukaan berhasil dipadamkan. Masuk fase pendinginan.' }
      ],
      decisionLogs: [],
      photos: []
    },
    {
      id: 'INC-2026-AC-007',
      code: 'AC-007-NGR',
      title: 'Deteksi Titik Asap Rawang Gambut Rawa Tripa',
      locationName: 'Gampong Babah Rot, Kec. Darul Makmur',
      regency: 'Kabupaten Nagan Raya',
      province: 'Aceh',
      lat: 3.7512,
      lng: 96.6812,
      reportedAt: '2026-10-27T08:10:00+07:00',
      updatedAt: '2026-10-27T08:45:00+07:00',
      source: 'Citra Satelit Terra-MODIS',
      sourceReliability: 'Menunggu Verifikasi (Confidence 65%)',
      status: 'Baru',
      priority: 'Sedang',
      peatDepthM: 2.5,
      fuelType: 'Kawasan Konservasi Rawa Gambut Tripa',
      windSpeedKmh: 8,
      windDirection: 'Barat ke Timur',
      windDegree: 270,
      ispuValue: 110,
      distanceToSettlementKm: 5.5,
      settlementName: 'Gampong Babah Lueng',
      vitalFacilities: ['Suaka Satwa Orangutan Sumatera'],
      estimatedAreaHa: 8.0,
      potentialThreatAreaHa: 30.0,
      threatenedCivilians: 0,
      evacuatedCivilians: 0,
      commanderInCharge: 'Belum Ditetapkan',
      assignedTeams: [],
      assignedFleet: [],
      priorityReason: 'Laporan baru masuk via satelit. Menunggu verifikasi tim patroli drone Pos SAR Meulaboh.',
      notes: 'Petugas sedang dikerahkan menuju titik koordinat untuk ground check.',
      chronology: [
        { time: '2026-10-27 08:10', actor: 'Terra-MODIS', note: 'Titik panas baru terdeteksi dengan FRP 19 MW.' }
      ],
      decisionLogs: [],
      photos: []
    },
    {
      id: 'INC-2026-RI-008',
      code: 'RI-008-PLW',
      title: 'Kebakaran Belukar Gambut Teluk Meranti',
      locationName: 'Kec. Teluk Meranti',
      regency: 'Kabupaten Pelalawan',
      province: 'Riau',
      lat: 0.2812,
      lng: 102.5812,
      reportedAt: '2026-10-27T07:45:00+07:00',
      updatedAt: '2026-10-27T09:15:00+07:00',
      source: 'Laporan Masyarakat Peduli Api',
      sourceReliability: 'Terverifikasi 94%',
      status: 'Ditangani',
      priority: 'Kritis',
      peatDepthM: 3.5,
      fuelType: 'Lahan Gambut Semak Kering',
      windSpeedKmh: 20,
      windDirection: 'Tenggara ke Barat Laut',
      windDegree: 135,
      ispuValue: 290,
      distanceToSettlementKm: 0.95,
      settlementName: 'Desa Kuala Panduk (110 KK)',
      vitalFacilities: ['Jalan Akses Bono Pelalawan (800m)', 'Dermaga Penyeberangan Sungai Kampar (1.4km)'],
      estimatedAreaHa: 38.0,
      potentialThreatAreaHa: 110.0,
      threatenedCivilians: 380,
      evacuatedCivilians: 140,
      commanderInCharge: 'Kapten SAR Asep Sunarya',
      assignedTeams: ['TM-SAR-05', 'TM-MA-01'],
      assignedFleet: ['HELI-01', 'TRK-06'],
      priorityReason: 'Api mendekati permukiman Kuala Panduk dan mengancam akses transportasi darat satu-satunya menuju ibukota kecamatan.',
      notes: 'Pengerahan perahu katamaran untuk suplai air dari Sungai Kampar.',
      chronology: [
        { time: '2026-10-27 07:45', actor: 'MPA Teluk Meranti', note: 'Laporan api meloncat melintasi parit sekat.' }
      ],
      decisionLogs: [
        { time: '2026-10-27 08:30', decision: 'Evakuasi anak-anak dan lansia ke balai desa yang dilengkapi pembersih udara (air purifier).', author: 'Kapten Asep Sunarya' }
      ],
      photos: []
    }
  ];

  // 35+ Realistic Simulated Hotspot Coordinates across fire belts
  let hotspots = [
    { id: 'HS-001', lat: 0.4435, lng: 101.3251, frp: 58.4, conf: 'Tinggi (96%)', sat: 'S-NPP VIIRS', time: '09:14 WIB', tempK: 362.4, prov: 'Riau', kab: 'Kampar', incidentId: 'INC-2026-RI-001' },
    { id: 'HS-002', lat: 0.4398, lng: 101.3320, frp: 42.1, conf: 'Tinggi (94%)', sat: 'NOAA-20 VIIRS', time: '09:10 WIB', tempK: 355.2, prov: 'Riau', kab: 'Kampar', incidentId: 'INC-2026-RI-001' },
    { id: 'HS-003', lat: 0.4480, lng: 101.3190, frp: 31.8, conf: 'Sedang (82%)', sat: 'Terra MODIS', time: '08:45 WIB', tempK: 341.0, prov: 'Riau', kab: 'Kampar', incidentId: 'INC-2026-RI-001' },
    { id: 'HS-004', lat: 0.2830, lng: 102.5840, frp: 64.0, conf: 'Tinggi (98%)', sat: 'S-NPP VIIRS', time: '09:05 WIB', tempK: 374.8, prov: 'Riau', kab: 'Pelalawan', incidentId: 'INC-2026-RI-008' },
    { id: 'HS-005', lat: 0.2790, lng: 102.5780, frp: 38.5, conf: 'Tinggi (90%)', sat: 'NOAA-20 VIIRS', time: '08:50 WIB', tempK: 348.6, prov: 'Riau', kab: 'Pelalawan', incidentId: 'INC-2026-RI-008' },
    { id: 'HS-006', lat: 1.4520, lng: 101.9840, frp: 28.2, conf: 'Sedang (80%)', sat: 'S-NPP VIIRS', time: '08:15 WIB', tempK: 338.2, prov: 'Riau', kab: 'Bengkalis', incidentId: null },
    { id: 'HS-007', lat: 1.5830, lng: 101.4420, frp: 45.0, conf: 'Tinggi (92%)', sat: 'Aqua MODIS', time: '08:20 WIB', tempK: 356.1, prov: 'Riau', kab: 'Rokan Hilir', incidentId: null },
    
    // Kalteng
    { id: 'HS-008', lat: -2.3940, lng: 114.1510, frp: 72.5, conf: 'Tinggi (99%)', sat: 'S-NPP VIIRS', time: '09:12 WIB', tempK: 388.2, prov: 'Kalimantan Tengah', kab: 'Pulang Pisau', incidentId: 'INC-2026-KT-002' },
    { id: 'HS-009', lat: -2.3890, lng: 114.1570, frp: 51.0, conf: 'Tinggi (95%)', sat: 'NOAA-20 VIIRS', time: '09:08 WIB', tempK: 360.5, prov: 'Kalimantan Tengah', kab: 'Pulang Pisau', incidentId: 'INC-2026-KT-002' },
    { id: 'HS-010', lat: -2.4020, lng: 114.1480, frp: 36.4, conf: 'Sedang (85%)', sat: 'Terra MODIS', time: '08:40 WIB', tempK: 344.0, prov: 'Kalimantan Tengah', kab: 'Pulang Pisau', incidentId: 'INC-2026-KT-002' },
    { id: 'HS-011', lat: -2.1850, lng: 113.8420, frp: 30.2, conf: 'Sedang (78%)', sat: 'S-NPP VIIRS', time: '08:35 WIB', tempK: 339.5, prov: 'Kalimantan Tengah', kab: 'Palangkaraya', incidentId: null },
    { id: 'HS-012', lat: -2.8520, lng: 114.3120, frp: 44.8, conf: 'Tinggi (91%)', sat: 'Aqua MODIS', time: '08:55 WIB', tempK: 352.0, prov: 'Kalimantan Tengah', kab: 'Kapuas', incidentId: null },
    
    // Sumsel
    { id: 'HS-013', lat: -3.2820, lng: 105.1180, frp: 49.3, conf: 'Tinggi (93%)', sat: 'S-NPP VIIRS', time: '09:02 WIB', tempK: 358.4, prov: 'Sumatera Selatan', kab: 'Ogan Komering Ilir', incidentId: 'INC-2026-SS-003' },
    { id: 'HS-014', lat: -3.2870, lng: 105.1230, frp: 35.7, conf: 'Sedang (86%)', sat: 'NOAA-20 VIIRS', time: '08:48 WIB', tempK: 345.1, prov: 'Sumatera Selatan', kab: 'Ogan Komering Ilir', incidentId: 'INC-2026-SS-003' },
    { id: 'HS-015', lat: -3.4210, lng: 105.3420, frp: 29.5, conf: 'Sedang (79%)', sat: 'Terra MODIS', time: '08:10 WIB', tempK: 337.8, prov: 'Sumatera Selatan', kab: 'Ogan Komering Ilir', incidentId: null },
    { id: 'HS-016', lat: -2.7120, lng: 104.4210, frp: 22.0, conf: 'Rendah (64%)', sat: 'S-NPP VIIRS', time: '07:50 WIB', tempK: 330.2, prov: 'Sumatera Selatan', kab: 'Banyuasin', incidentId: null },
    
    // Kalbar
    { id: 'HS-017', lat: -0.1960, lng: 109.3830, frp: 38.6, conf: 'Tinggi (91%)', sat: 'S-NPP VIIRS', time: '08:58 WIB', tempK: 349.0, prov: 'Kalimantan Barat', kab: 'Kubu Raya', incidentId: 'INC-2026-KB-004' },
    { id: 'HS-018', lat: -0.2010, lng: 109.3780, frp: 27.4, conf: 'Sedang (82%)', sat: 'Aqua MODIS', time: '08:30 WIB', tempK: 339.0, prov: 'Kalimantan Barat', kab: 'Kubu Raya', incidentId: 'INC-2026-KB-004' },
    { id: 'HS-019', lat: -1.7820, lng: 110.1240, frp: 34.0, conf: 'Sedang (84%)', sat: 'NOAA-20 VIIRS', time: '08:25 WIB', tempK: 344.2, prov: 'Kalimantan Barat', kab: 'Ketapang', incidentId: null },
    { id: 'HS-020', lat: 0.8120, lng: 108.9820, frp: 25.1, conf: 'Rendah (68%)', sat: 'Terra MODIS', time: '07:45 WIB', tempK: 332.0, prov: 'Kalimantan Barat', kab: 'Sambas', incidentId: null },
    
    // Jambi
    { id: 'HS-021', lat: -1.4850, lng: 104.0170, frp: 32.5, conf: 'Sedang (88%)', sat: 'NOAA-20 VIIRS', time: '09:25 WIB', tempK: 343.8, prov: 'Jambi', kab: 'Muaro Jambi', incidentId: 'INC-2026-JB-005' },
    { id: 'HS-022', lat: -1.0250, lng: 103.5410, frp: 26.0, conf: 'Sedang (76%)', sat: 'S-NPP VIIRS', time: '08:05 WIB', tempK: 336.5, prov: 'Jambi', kab: 'Tanjung Jabung Barat', incidentId: null },
    
    // Kalsel & Aceh
    { id: 'HS-023', lat: -3.4530, lng: 114.7170, frp: 18.2, conf: 'Sedang (72%)', sat: 'Terra MODIS', time: '08:15 WIB', tempK: 328.0, prov: 'Kalimantan Selatan', kab: 'Banjarbaru', incidentId: 'INC-2026-KS-006' },
    { id: 'HS-024', lat: 3.7530, lng: 96.6790, frp: 22.8, conf: 'Rendah (65%)', sat: 'Terra MODIS', time: '08:08 WIB', tempK: 331.4, prov: 'Aceh', kab: 'Nagan Raya', incidentId: 'INC-2026-AC-007' }
  ];

  // Base camps & command posts
  let commandPosts = [
    {
      id: 'POS-01',
      name: 'Posko Induk SAR Dumai - Riau',
      type: 'Posko Utama Wilayah',
      province: 'Riau',
      lat: 1.6665,
      lng: 101.4431,
      commander: 'Letkol SAR Indra Saputra',
      phone: '0761-445889 / Frek. 156.800 MHz',
      personnelStandby: 42,
      vehiclesAvailable: 8,
      heliHeliport: true,
      fuelStockL: 12500,
      foamStockL: 3400
    },
    {
      id: 'POS-02',
      name: 'Posko Aju SAR Kampar - Rimbo Panjang',
      type: 'Posko Aju Taktis',
      province: 'Riau',
      lat: 0.4320,
      lng: 101.3150,
      commander: 'Kapten SAR Hendra Wijaya',
      phone: '0812-7788-9901 / Frek. 143.550 MHz',
      personnelStandby: 28,
      vehiclesAvailable: 5,
      heliHeliport: false,
      fuelStockL: 2800,
      foamStockL: 1200
    },
    {
      id: 'POS-03',
      name: 'Posko Induk SAR Palangkaraya - Kalteng',
      type: 'Posko Utama Wilayah',
      province: 'Kalimantan Tengah',
      lat: -2.2158,
      lng: 113.9189,
      commander: 'Kolonel SAR Tri Wibowo',
      phone: '0536-3221155 / Frek. 156.800 MHz',
      personnelStandby: 56,
      vehiclesAvailable: 12,
      heliHeliport: true,
      fuelStockL: 18000,
      foamStockL: 5000
    },
    {
      id: 'POS-04',
      name: 'Posko Aju Jabiren - Pulang Pisau',
      type: 'Posko Aju Taktis',
      province: 'Kalimantan Tengah',
      lat: -2.3650,
      lng: 114.1200,
      commander: 'Mayor SAR Rahmat Hidayat',
      phone: '0813-4455-6677 / Frek. 143.700 MHz',
      personnelStandby: 34,
      vehiclesAvailable: 6,
      heliHeliport: false,
      fuelStockL: 3200,
      foamStockL: 1600
    },
    {
      id: 'POS-05',
      name: 'Posko Siaga SAR Palembang - OKI',
      type: 'Posko Utama Wilayah',
      province: 'Sumatera Selatan',
      lat: -2.9909,
      lng: 104.7565,
      commander: 'Letkol SAR Ahmad Fauzi',
      phone: '0711-441234 / Frek. 156.800 MHz',
      personnelStandby: 38,
      vehiclesAvailable: 9,
      heliHeliport: true,
      fuelStockL: 14000,
      foamStockL: 3800
    }
  ];

  // SAR Teams & Personnel Rosters
  let teams = [
    {
      id: 'TM-SAR-01',
      name: 'Team Rescue Alfa - BASARNAS Pekanbaru',
      leader: 'Sertu Agus Pratama',
      strength: 12,
      role: 'Ground Fire Attack & Evakuasi Warga',
      speciality: 'Lahan Gambut & Evakuasi Medis',
      status: 'Bertugas', // Siap, Bertugas, Istirahat, Butuh Bantuan
      currentIncidentId: 'INC-2026-RI-001',
      lat: 0.4422,
      lng: 101.3275,
      batteryGps: 84,
      waterSupplyPercent: 65,
      oxygenRespiratorCheck: 'Normal (N95+Katrid)',
      lastCheckin: '5 menit lalu',
      equipment: ['2x Pompa Mark-3', '10 Roll Selang 1.5"', 'Tandu Evakuasi Basket', 'Tabung Oksigen Portabel']
    },
    {
      id: 'TM-MA-02',
      name: 'Manggala Agni Daops Siak - Regu 2',
      leader: 'Danregu Roni Firmansyah',
      strength: 15,
      role: 'Penyekatan Kanal & Pembuatan Parit Basah',
      speciality: 'Teknik Sekat Bakar & Peat Boring',
      status: 'Bertugas',
      currentIncidentId: 'INC-2026-RI-001',
      lat: 0.4405,
      lng: 101.3305,
      batteryGps: 91,
      waterSupplyPercent: 78,
      oxygenRespiratorCheck: 'Normal',
      lastCheckin: '12 menit lalu',
      equipment: ['3x Pompa Apung Tohatsu', 'Gergaji Mesin Chainsaw', 'Sekop Gambut', 'Nozzle Gambut Piercing']
    },
    {
      id: 'TM-REL-01',
      name: 'Masyarakat Peduli Api (MPA) Rimbo Panjang',
      leader: 'Pak Mansyur (Tokoh Masyarakat)',
      strength: 18,
      role: 'Logistik, Pandu Jalur & Evakuasi Lansia',
      speciality: 'Navigasi Kearifan Lokal & Sumur Bor',
      status: 'Bertugas',
      currentIncidentId: 'INC-2026-RI-001',
      lat: 0.4370,
      lng: 101.3240,
      batteryGps: 76,
      waterSupplyPercent: 90,
      oxygenRespiratorCheck: 'Cukup',
      lastCheckin: '8 menit lalu',
      equipment: ['Sepeda Motor Modifikasi Pompa', 'Sumur Bor Pipa Paralon', 'Dapur Umum Mandiri']
    },
    {
      id: 'TM-SAR-03',
      name: 'Team Rescue Charlie - BASARNAS Palangkaraya',
      leader: 'Serma Edi Sujarwo',
      strength: 14,
      role: 'Infiltrasi Rawa Gambut Sebangau',
      speciality: 'SAR Hutan Lebat & Navigasi GPS Rawa',
      status: 'Bertugas',
      currentIncidentId: 'INC-2026-KT-002',
      lat: -2.3910,
      lng: 114.1520,
      batteryGps: 88,
      waterSupplyPercent: 55,
      oxygenRespiratorCheck: 'Normal',
      lastCheckin: '15 menit lalu',
      equipment: ['Perahu Karet Katamaran', 'Pompa Apung Kohler', 'GPS Garmin Montana 700']
    },
    {
      id: 'TM-MA-04',
      name: 'Manggala Agni Daops Kapuas - Regu 1',
      leader: 'Danregu Yanto Supriyadi',
      strength: 15,
      role: 'Pemadaman Kepala Api Sektor Utara',
      speciality: 'Suntik Gambut Tekanan Tinggi',
      status: 'Bertugas',
      currentIncidentId: 'INC-2026-KT-002',
      lat: -2.3950,
      lng: 114.1495,
      batteryGps: 72,
      waterSupplyPercent: 40,
      oxygenRespiratorCheck: 'Peringatan Filter Kotor',
      lastCheckin: '7 menit lalu',
      equipment: ['Pipa Suntik Gambut 4 Batang', 'Pompa Tekanan 16 Bar', 'Kanal Dam Portable']
    },
    {
      id: 'TM-SAR-02',
      name: 'Team Reaksi Cepat BPBD OKI & SAR Palembang',
      leader: 'Iptu Dian Prasetya',
      strength: 16,
      role: 'Penyekatan Api Tulung Selapan',
      speciality: 'Damkar Tangki 4x4 & Pemotong Ranting',
      status: 'Bertugas',
      currentIncidentId: 'INC-2026-SS-003',
      lat: -3.2835,
      lng: 105.1195,
      batteryGps: 95,
      waterSupplyPercent: 82,
      oxygenRespiratorCheck: 'Normal',
      lastCheckin: '10 menit lalu',
      equipment: ['Truk Tangki Hino 4x4 5000L', 'Pompa Jinjing Mini-Striker']
    },
    {
      id: 'TM-SAR-04',
      name: 'Team Siaga Posko Kubu Raya',
      leader: 'Lettu SAR Wahyu Hidayat',
      strength: 10,
      role: 'Pemadaman Koridor Bandara Supadio',
      speciality: 'Proteksi Objek Vital Penerbangan',
      status: 'Siap',
      currentIncidentId: 'INC-2026-KB-004',
      lat: -0.1982,
      lng: 109.3812,
      batteryGps: 98,
      waterSupplyPercent: 100,
      oxygenRespiratorCheck: 'Siap',
      lastCheckin: '20 menit lalu',
      equipment: ['Rescue Car D-Max 4x4', 'Pompa Apung', 'Thermal Gun']
    },
    {
      id: 'TM-SAR-RES',
      name: 'Regu Cadangan Siaga Khusus (Rescue Reserve)',
      leader: 'Kapten SAR Firman Maulana',
      strength: 20,
      role: 'Bantuan Darurat Penyelamatan (SOS Unit)',
      speciality: 'Penyelamatan Heli Rappelling & Fast Response',
      status: 'Siap',
      currentIncidentId: null,
      lat: 1.6665,
      lng: 101.4431,
      batteryGps: 100,
      waterSupplyPercent: 100,
      oxygenRespiratorCheck: 'Prima',
      lastCheckin: '2 menit lalu',
      equipment: ['Peralatan Heli Rappel', 'Survival Pack 72 Jam', 'Defibrillator Portabel AED']
    }
  ];

  // Vehicles & Operational Fleet
  let fleet = [
    {
      id: 'HELI-01',
      code: 'WB-BELL-412',
      name: 'Helikopter Water Bombing Bell 412 (TNI-AU/BNPB)',
      type: 'Udara',
      category: 'Helikopter Water Bombing',
      capacity: 'Bambi Bucket 1.200 Liter',
      assignedIncidentId: 'INC-2026-RI-001',
      status: 'Ditugaskan', // Tersedia, Ditugaskan, Dalam Perjalanan, Perawatan
      location: 'Sektor Rimbo Panjang Riau',
      pilot: 'Mayor Pnb Dwi Satria',
      fuelPercent: 68,
      sortiesToday: 14,
      waterDroppedLiters: 16800,
      lastMaintenance: '2026-10-24'
    },
    {
      id: 'HELI-02',
      code: 'WB-KAMOV-32',
      name: 'Helikopter Heavy Lift Kamov Ka-32 (BNPB)',
      type: 'Udara',
      category: 'Helikopter Water Bombing Berat',
      capacity: 'Bambi Bucket 5.000 Liter',
      assignedIncidentId: 'INC-2026-KT-002',
      status: 'Ditugaskan',
      location: 'Kubah Gambut Sebangau Kalteng',
      pilot: 'Capt. Igor / Co-Pilot Kapten SAR Surya',
      fuelPercent: 54,
      sortiesToday: 8,
      waterDroppedLiters: 40000,
      lastMaintenance: '2026-10-22'
    },
    {
      id: 'PLANE-01',
      code: 'PAT-CESSNA-208',
      name: 'Pesawat Patroli Cessna Grand Caravan (Thermal Cam)',
      type: 'Udara',
      category: 'Pesawat Pemantau & Drone FLIR Relay',
      capacity: 'Sensor Optik & Thermal Multi-Spectral',
      assignedIncidentId: null,
      status: 'Tersedia',
      location: 'Bandara Sultan Syarif Kasim II Pekanbaru',
      pilot: 'Kapten Pnb Rizky Akbar',
      fuelPercent: 92,
      sortiesToday: 2,
      waterDroppedLiters: 0,
      lastMaintenance: '2026-10-25'
    },
    {
      id: 'TRK-01',
      code: 'RC-4X4-ISUZU-01',
      name: 'Truk Tangki Karhutla Isuzu NPS 4x4 5000L',
      type: 'Darat',
      category: 'Truk Tangki Off-Road Gambut',
      capacity: '5.000 Liter Air + 200L Foam',
      assignedIncidentId: 'INC-2026-RI-001',
      status: 'Ditugaskan',
      location: 'Posko Aju Rimbo Panjang',
      driver: 'Serda Doni',
      fuelPercent: 75,
      waterDroppedLiters: 15000,
      lastMaintenance: '2026-10-18'
    },
    {
      id: 'TRK-02',
      code: 'RC-CARRIER-02',
      name: 'Rescue Carrier All-Terrain Amphibious (ARGO 8x8)',
      type: 'Darat',
      category: 'Kendaraan Amfibi Gambut Terisolir',
      capacity: '6 Personel + 500kg Kargo Medis',
      assignedIncidentId: 'INC-2026-RI-001',
      status: 'Ditugaskan',
      location: 'Area Rawa Gambut Dalam Sektor 2',
      driver: 'Praka Ilham',
      fuelPercent: 82,
      waterDroppedLiters: 0,
      lastMaintenance: '2026-10-20'
    },
    {
      id: 'TRK-03',
      code: 'TRK-TANGKI-HINO',
      name: 'Truk Tangki Karhutla Hino 4x4 5000L',
      type: 'Darat',
      category: 'Truk Tangki Suplai',
      capacity: '5.000 Liter Air',
      assignedIncidentId: 'INC-2026-KT-002',
      status: 'Ditugaskan',
      location: 'Desa Taruna Jaya Pulang Pisau',
      driver: 'Serka Budiarto',
      fuelPercent: 70,
      waterDroppedLiters: 10000,
      lastMaintenance: '2026-10-15'
    },
    {
      id: 'BOAT-01',
      code: 'RIB-KATAMARAN',
      name: 'Perahu Karet Katamaran Rawa Mesin 40PK',
      type: 'Air',
      category: 'Perahu Patroli Kanal Gambut',
      capacity: '8 Personel / Suplai Pompa Mark-3',
      assignedIncidentId: 'INC-2026-RI-008',
      status: 'Ditugaskan',
      location: 'Sungai Kampar Hilir',
      driver: 'Koptu Syarif',
      fuelPercent: 88,
      waterDroppedLiters: 0,
      lastMaintenance: '2026-10-19'
    }
  ];

  // Evacuation Shelters & Public Safety Zones
  let shelters = [
    {
      id: 'SHT-01',
      name: 'Tempat Pengungsian Mandiri GOR Tambang',
      regency: 'Kabupaten Kampar',
      province: 'Riau',
      lat: 0.4285,
      lng: 101.3050,
      capacityPersons: 450,
      currentOccupants: 310,
      vulnerableStats: {
        infants: 48,
        children: 86,
        elderly: 54,
        pregnant: 12,
        disabilities: 6
      },
      healthPostAvailable: true,
      medicCount: 6,
      airPurifierCleanRooms: 3,
      foodWaterSupplyDays: 4,
      status: 'Aktif Menampung',
      safeRouteDescription: 'Melalui Jalan Desa Sektor Barat yang bebas asap. Jangan melintasi Jl. Utama Rimbo Panjang.',
      incidentId: 'INC-2026-RI-001'
    },
    {
      id: 'SHT-02',
      name: 'Balai Warga Transmigrasi Jabiren',
      regency: 'Kabupaten Pulang Pisau',
      province: 'Kalimantan Tengah',
      lat: -2.3580,
      lng: 114.1080,
      capacityPersons: 280,
      currentOccupants: 195,
      vulnerableStats: {
        infants: 26,
        children: 52,
        elderly: 38,
        pregnant: 8,
        disabilities: 3
      },
      healthPostAvailable: true,
      medicCount: 4,
      airPurifierCleanRooms: 2,
      foodWaterSupplyDays: 5,
      status: 'Aktif Menampung',
      safeRouteDescription: 'Menyusuri sisi barat tanggul irigasi primer menuju jalan trans.',
      incidentId: 'INC-2026-KT-002'
    },
    {
      id: 'SHT-03',
      name: 'Aula Pertemuan Kantor Camat Tulung Selapan',
      regency: 'Kabupaten OKI',
      province: 'Sumatera Selatan',
      lat: -3.2500,
      lng: 105.0800,
      capacityPersons: 300,
      currentOccupants: 80,
      vulnerableStats: {
        infants: 12,
        children: 24,
        elderly: 18,
        pregnant: 4,
        disabilities: 2
      },
      healthPostAvailable: true,
      medicCount: 3,
      airPurifierCleanRooms: 1,
      foodWaterSupplyDays: 6,
      status: 'Siaga Tampung',
      safeRouteDescription: 'Akses jalan poros beraspal, jarak pandang masih aman 800m.',
      incidentId: 'INC-2026-SS-003'
    }
  ];

  // Operational Communications & Logs
  let comms = [
    {
      id: 'MSG-001',
      time: '09:42 WIB',
      channel: 'Pusdalops-National',
      sender: 'Kolonel Budi Santoso (SMC)',
      role: 'Komandan Operasi',
      type: 'BROADCAST',
      text: 'PERHATIAN SELURUH POSKO: Prioritas utama hari ini adalah perlindungan pemukiman warga di Rimbo Panjang (Riau) dan Sebangau (Kalteng). Lakukan pemotongan api di perimeter terdekat dengan rumah warga.',
      verified: true
    },
    {
      id: 'MSG-002',
      time: '09:35 WIB',
      channel: 'INC-2026-RI-001',
      sender: 'Kapten Hendra Wijaya (OSC Kampar)',
      role: 'Koordinator Lapangan',
      type: 'OPERATIONAL',
      text: 'Lapor Komandan, pemadaman sektor utara Dusun III terbantu oleh sortie water bombing Bell 412. Sebanyak 310 warga sudah aman di GOR Tambang. Membutuhkan tambahan 5 roll selang 1.5 inci untuk suplai parit basah.',
      verified: true
    },
    {
      id: 'MSG-003',
      time: '09:28 WIB',
      channel: 'INC-2026-RI-001',
      sender: 'Sertu Agus Pratama (SRU 1)',
      role: 'Personel SAR',
      type: 'FIELD_REPORT',
      text: 'Tim Rescue Alfa sedang menyambung pipa pompa Mark-3 di kedalaman gambut 3 meter. Suhu bara tanah masih terpantau 380°C. Akses air kanal primer cukup melimpah.',
      verified: true
    },
    {
      id: 'MSG-004',
      time: '09:15 WIB',
      channel: 'INC-2026-KT-002',
      sender: 'Mayor Rahmat Hidayat (OSC Pulang Pisau)',
      role: 'Koordinator Lapangan',
      type: 'OPERATIONAL',
      text: 'Kamov Ka-32 telah menjatuhkan 8 water bomb (40.000 liter). Api bawah tanah kubah gambut belum sepenuhnya padam, kami terus lakukan peat injection dengan 4 tombak suntik.',
      verified: true
    },
    {
      id: 'MSG-005',
      time: '08:50 WIB',
      channel: 'Radio-Log-VHF',
      sender: 'Radio Monitor Posko Dumai',
      role: 'Operator Radio',
      type: 'RADIO_LOG',
      text: 'VHF Ch 16 (156.800 MHz): Konfirmasi helikopter patroli Cessna Grand Caravan telah mendarat kembali di Pekanbaru setelah merekam video thermal FLIR.',
      verified: true
    }
  ];

  // Sensor & External Data Feed Integrations
  let dataSources = [
    {
      id: 'DS-01',
      name: 'NASA FIRMS (S-NPP & NOAA-20 VIIRS 375m)',
      category: 'Satelit Penginderaan Jauh',
      status: 'Terhubung (Online)',
      latencySec: 42,
      lastSync: '2 menit lalu',
      qualityScore: '98% (Sangat Baik)',
      recordCount: '128 Hotspot Terdeteksi',
      icon: '🛰️'
    },
    {
      id: 'DS-02',
      name: 'Sistem Pemantauan Karhutla BRIN / LAPAN',
      category: 'Katalog Anomali Termal Nasional',
      status: 'Terhubung (Online)',
      latencySec: 65,
      lastSync: '5 menit lalu',
      qualityScore: '95% (Baik)',
      recordCount: '48 Titik Terverifikasi Algoritma',
      icon: '🌐'
    },
    {
      id: 'DS-03',
      name: 'Radar Cuaca & AWS BMKG Stasiun Klimatologi',
      category: 'Meteorologi & Indeks Kekeringan',
      status: 'Terhubung (Online)',
      latencySec: 30,
      lastSync: '1 menit lalu',
      qualityScore: '99% (Sangat Baik)',
      recordCount: 'Kecepatan Angin 10-24 km/j, HTH >15 Hari',
      icon: '💨'
    },
    {
      id: 'DS-04',
      name: 'Stasiun Pemantau Kualitas Udara KLHK (ISPU)',
      category: 'Pencemaran Partikulat PM2.5',
      status: 'Terhubung (Online)',
      latencySec: 120,
      lastSync: '4 menit lalu',
      qualityScore: '92% (Normal)',
      recordCount: '3 Stasiun Kategori Berbahaya (ISPU >300)',
      icon: '😷'
    },
    {
      id: 'DS-05',
      name: 'Sistem Pelacakan GPS Armada & Personel BASARNAS',
      category: 'Telemetri Real-Time & SOS',
      status: 'Terhubung (Online)',
      latencySec: 15,
      lastSync: '30 detik lalu',
      qualityScore: '100% (Real-Time)',
      recordCount: '16 Unit Aktif Memancarkan Koordinat',
      icon: '📡'
    }
  ];

  // Audit Logs
  let auditLogs = [
    {
      id: 'AUD-001',
      timestamp: '2026-10-27T09:45:10+07:00',
      user: 'Budi Santoso (Kolonel SAR)',
      role: 'Komandan Operasi',
      action: 'UPDATE_INCIDENT_STATUS',
      details: 'Memperbarui status INC-2026-RI-001 ke DITANGANI dan menyetujui sortie ke-14 Heli Water Bombing.',
      ipAddress: '10.24.1.101',
      immutableHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    {
      id: 'AUD-002',
      timestamp: '2026-10-27T09:20:00+07:00',
      user: 'Rian Andika',
      role: 'Operator Pusat Kendali',
      action: 'DISPATCH_TEAM',
      details: 'Menugaskan Tim Rescue Alfa ke sektor pemotongan parit barat Dusun III Rimbo Panjang.',
      ipAddress: '10.24.1.105',
      immutableHash: 'sha256-a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0'
    },
    {
      id: 'AUD-003',
      timestamp: '2026-10-27T09:00:15+07:00',
      user: 'Hendra Wijaya (Kapten SAR)',
      role: 'Koordinator Lapangan',
      action: 'EVACUATION_REPORT',
      details: 'Memperbarui data pengungsi GOR Tambang menjadi 310 jiwa (termasuk 54 lansia dan 48 balita).',
      ipAddress: '192.168.4.12',
      immutableHash: 'sha256-9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba9876543210'
    },
    {
      id: 'AUD-004',
      timestamp: '2026-10-27T08:12:00+07:00',
      user: 'Sistem Otomatis (FIRMS-Sync)',
      role: 'System Service',
      action: 'INGEST_HOTSPOTS',
      details: 'Mengimpor 14 titik panas baru satelit S-NPP VIIRS di wilayah Sumatera dan Kalimantan.',
      ipAddress: '127.0.0.1 (Internal Service)',
      immutableHash: 'sha256-88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589'
    }
  ];

  return {
    ROLES,
    PROVINCES,
    getCurrentUser: () => currentUser,
    setCurrentUserRole: (roleKey) => {
      if (ROLES[roleKey]) {
        currentUser.role = ROLES[roleKey];
        // Log to audit
        auditLogs.unshift({
          id: 'AUD-' + String(auditLogs.length + 1).padStart(3, '0'),
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          role: currentUser.role.name,
          action: 'SWITCH_USER_ROLE',
          details: `Pengguna beralih peran ke: ${currentUser.role.name}`,
          ipAddress: '10.24.1.101',
          immutableHash: 'sha256-' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
        });
        return true;
      }
      return false;
    },
    getIncidents: () => incidents,
    getIncidentById: (id) => incidents.find(i => i.id === id),
    addIncident: (newInc) => {
      incidents.unshift(newInc);
      auditLogs.unshift({
        id: 'AUD-' + String(auditLogs.length + 1).padStart(3, '0'),
        timestamp: new Date().toISOString(),
        user: currentUser.name,
        role: currentUser.role.name,
        action: 'CREATE_INCIDENT',
        details: `Membuat laporan insiden baru: [${newInc.id}] ${newInc.title}`,
        ipAddress: '10.24.1.101',
        immutableHash: 'sha256-' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
      });
      return newInc;
    },
    updateIncidentStatus: (id, newStatus, decisionNote) => {
      const inc = incidents.find(i => i.id === id);
      if (inc) {
        const oldStatus = inc.status;
        inc.status = newStatus;
        inc.updatedAt = new Date().toISOString();
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        inc.chronology.unshift({
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: currentUser.name + ` (${currentUser.role.badge})`,
          note: `Status diubah dari ${oldStatus} menjadi ${newStatus}. ${decisionNote || ''}`
        });
        if (decisionNote) {
          inc.decisionLogs.unshift({
            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
            decision: decisionNote,
            author: currentUser.name
          });
        }
        auditLogs.unshift({
          id: 'AUD-' + String(auditLogs.length + 1).padStart(3, '0'),
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          role: currentUser.role.name,
          action: 'UPDATE_STATUS',
          details: `Memperbarui status insiden ${id} dari ${oldStatus} ke ${newStatus}`,
          ipAddress: '10.24.1.101',
          immutableHash: 'sha256-' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
        });
        return true;
      }
      return false;
    },
    getHotspots: () => hotspots,
    getCommandPosts: () => commandPosts,
    getTeams: () => teams,
    updateTeamStatus: (teamId, newStatus) => {
      const t = teams.find(item => item.id === teamId);
      if (t) {
        t.status = newStatus;
        t.lastCheckin = 'Baru saja';
        auditLogs.unshift({
          id: 'AUD-' + String(auditLogs.length + 1).padStart(3, '0'),
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          role: currentUser.role.name,
          action: 'UPDATE_TEAM_STATUS',
          details: `Mengubah kesiapan ${t.name} menjadi ${newStatus}`,
          ipAddress: '10.24.1.101',
          immutableHash: 'sha256-' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
        });
        return true;
      }
      return false;
    },
    getFleet: () => fleet,
    getShelters: () => shelters,
    getComms: () => comms,
    addCommsMessage: (channel, text, type = 'OPERATIONAL') => {
      const newMsg = {
        id: 'MSG-' + String(comms.length + 1).padStart(3, '0'),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        channel: channel || 'Pusdalops-National',
        sender: currentUser.name + ` (${currentUser.role.badge})`,
        role: currentUser.role.name,
        type: type,
        text: text,
        verified: true
      };
      comms.unshift(newMsg);
      return newMsg;
    },
    getDataSources: () => dataSources,
    getAuditLogs: () => auditLogs,
    triggerSOS: (callerName, locationCoords, notes) => {
      const sosId = 'SOS-' + Date.now().toString().slice(-4);
      const sosMsg = {
        id: 'MSG-' + String(comms.length + 1).padStart(3, '0'),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        channel: 'EMERGENCY-SOS',
        sender: `🚨 SINYAL DISTRESS [${sosId}]`,
        role: 'Panggilan Darurat Lapangan',
        type: 'SOS_ALERT',
        text: `DARURAT: Petugas lapangan ${callerName || currentUser.name} memancarkan suar SOS di koordinat ${locationCoords || '0.4418, 101.3284'}. Catatan: ${notes || 'Kondisi bahaya, terperangkap asap tebal / butuh evakuasi segera!'}`,
        verified: true
      };
      comms.unshift(sosMsg);
      auditLogs.unshift({
        id: 'AUD-' + String(auditLogs.length + 1).padStart(3, '0'),
        timestamp: new Date().toISOString(),
        user: callerName || currentUser.name,
        role: 'SAR Field Emergency',
        action: 'TRIGGER_SOS_BEACON',
        details: `Sinyal darurat dipancarkan di lokasi ${locationCoords || 'Rimbo Panjang'}`,
        ipAddress: '10.24.1.999 (GPS SOS Transponder)',
        immutableHash: 'sha256-EMERGENCY-' + Math.random().toString(16).substring(2)
      });
      return sosId;
    },
    // Manajemen Mode Operasional (Mode Asli / Live vs Mode Simulasi)
    getOperationalMode: () => operationalMode,
    isLiveMode: () => operationalMode === 'LIVE',
    setOperationalMode: (newMode) => {
      if (['LIVE', 'SIMULATION'].includes(newMode)) {
        operationalMode = newMode;
        localStorage.setItem('SAR_OPERATIONAL_MODE', newMode);
        auditLogs.unshift({
          id: 'AUD-' + String(auditLogs.length + 1).padStart(3, '0'),
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          role: currentUser.role.name,
          action: 'SWITCH_OPERATIONAL_MODE',
          details: `Mengalihkan sistem ke: ${newMode === 'LIVE' ? 'MODE OPERASIONAL AKTUAL (RESMI)' : 'MODE SIMULASI LATIHAN'}`,
          ipAddress: '10.24.1.101',
          immutableHash: 'sha256-' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
        });
        return true;
      }
      return false;
    },
    setUserDeviceLocation: (lat, lng, accuracy = 5) => {
      userDeviceLocation = { lat, lng, accuracy, updatedAt: new Date().toISOString() };
    },
    getUserDeviceLocation: () => userDeviceLocation
  };
})();
