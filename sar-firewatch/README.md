# SAR FireWatch — Forest Fire Monitoring & SAR Operations Dashboard

Platform pemantauan dan pengelolaan operasi kebakaran hutan dan lahan (Karhutla) terpadu yang dirancang untuk mendukung **Badan Nasional Pencarian dan Pertolongan (BASARNAS)**, Komandan Operasi SAR, Operator Pusat Kendali (Pusdalops), Koordinator Posko Aju, serta Tim Lapangan (SRU).

---

> ⚠️ **CATATAN DATA SIMULASI**  
> Seluruh data titik panas (*hotspot*), koordinat kejadian, armada, dan penugasan personel dalam aplikasi ini berlabel **SIMULASI OPERASIONAL RESMI** untuk keperluan evaluasi antarmuka, pengujian alur taktis komando, dan simulasi kesiapsiagaan bencana.

---

## 🌟 Modul & Fitur Utama

1. **Dashboard Command Center**
   - Ringkasan KPI: 128 Titik Panas Terpantau, 24 Insiden Aktif, 16 Tim Ditugaskan, 5 Zona Prioritas Warga.
   - Filter cepat menurut provinsi (Riau, Kalteng, Sumsel, Kalbar, Jambi), status kejadian, dan prioritas ancaman.
   - Indeks Bahaya Kebakaran BMKG (suhu gambut, RH kelembaban, hari tanpa hujan HTH, dan ISPU udara).
   - Feed aktivitas operasi real-time (*live ticker*).

2. **Live Fire Map (Peta Karhutla Interaktif)**
   - Lapisan taktis lengkap:
     - 🔥 **Hotspot Satelit** (NASA FIRMS & BRIN - SNPP/NOAA-20 VIIRS & MODIS)
     - 🚨 **Insiden Karhutla Terverifikasi**
     - ⭕ **Batas Perkiraan Terbakar & Radius Ancaman Asap**
     - 🏕️ **Posko Induk & Posko Aju SAR**
     - 🚒 **Posisi GPS Real-Time Tim SAR & Armada Lapangan**
     - 🏥 **Tempat Pengungsian (Shelter) & Fasilitas Kesehatan**
     - 💨 **Vektor Arah & Kecepatan Angin BMKG**
   - Pemilihan peta: *Tactical Dark Navy*, *Satelit Citra Udara Resolusi Tinggi*, dan *Topografi/OSM*.
   - Fitur **Ukur Jarak Taktis (Measurement Tool)** untuk menghitung jarak km, estimasi waktu tempuh helikopter (*water bombing*), dan armada darat *off-road*.
   - Ekspor data koordinat langsung dalam format **GeoJSON standar**.

3. **Manajemen Insiden Terpadu**
   - Pencarian, penyaringan tingkat keparahan, dan pendaftaran insiden baru.
   - **Pencegahan Duplikasi**: Algoritma deteksi dini kejadian dalam radius < 3 km.
   - Halaman detail komprehensif: riwayat kronologi (*audit trail*), penanggung jawab (OSC/SMC), foto bukti kondisi lapangan, dan jurnal keputusan komando.
   - Perubahan status berjenjang: `Baru` ➔ `Diverifikasi` ➔ `Ditangani` ➔ `Terkendali` ➔ `Selesai`.

4. **Sistem Rekomendasi Prioritas & Peringatan Dini (DSS Engine)**
   - Rekomendasi berbasis kalkulasi risiko objektif:
     - Jarak api ke permukiman penduduk (< 1.0 km = Kritis)
     - Arah angin menuju permukiman padat
     - Kedalaman kubah gambut (> 3 meter = kebakaran bawah tanah ekstrem)
     - Konsentrasi partikulat asap beracun (ISPU > 300)
     - Keberadaan infrastruktur vital (gardu PLN, sekolah, rumah sakit, bandara)
   - Transparansi alasan penetapan prioritas dan indikator ketidakpastian data satelit.

5. **Pelacakan Personel & Tim SAR (Resource Tracking)**
   - Status kesiapan regu: *Siap (Standby)*, *Bertugas (Deployed)*, *Istirahat*, dan *Butuh Bantuan*.
   - Telemetri status: daya baterai GPS, ketersediaan suplai air pemadaman, dan kondisi masker respirator.
   - Tombol **Panggilan Darurat Lapangan (SOS Distress Beacon)** untuk evakuasi personel darurat.

6. **Kendaraan & Logistik Armada**
   - Status armada udara (*Helikopter Water Bombing Bell 412, Kamov Ka-32, Cessna Patroli FLIR*).
   - Armada darat amfibi *ARGO 8x8*, truk tangki *Isuzu NPS 4x4 5000L*, dan perahu katamaran kanal rawa.
   - Monitoring stok busa pemadam (*foam concentrate*), bahan bakar avtur/solar, dan pompa apung Mark-3.

7. **Komunikasi Operasi & Radio Log**
   - Kanal komunikasi per insiden, kanal broadcast nasional Pusdalops, dan kanal darurat SOS.
   - Log siaran frekuensi radio SAR (VHF 156.800 MHz Ch 16 & frekuensi taktis darat).
   - Pengiriman pesan taktis yang tercatat ke dalam buku jurnal operasi.

8. **Evakuasi & Keselamatan Masyarakat**
   - Pemetaan titik kumpul, GOR, dan tempat evakuasi sementara (shelter).
   - Pencatatan populasi rentan: balita/bayi, lansia, ibu hamil, dan penyandang disabilitas.
   - Penyusunan pesan diseminasi peringatan dini masyarakat.

9. **Incident Situation Report (SITREP) & Analitik**
   - Generator dokumen resmi **SITREP BASARNAS/BNPB** (Format Register `SITREP-KH/2026/X/027`).
   - Ekspor data laporan ke format **Excel / CSV** dan cetak langsung (*print-to-PDF*).
   - Analitik waktu respons laporan dan efisiensi pengeboman air.

10. **Pengaturan, RBAC & Jejak Audit (Audit Trail)**
    - Penggantian peran pengguna instan (*Role-Based Access Control*):
      - 👑 **Komandan Operasi SAR (SMC)**
      - 🖥️ **Operator Pusat Kendali**
      - 🦺 **Koordinator Lapangan (OSC)**
      - 🚒 **Personel SAR Lapangan (SRU)**
      - 📊 **Analis Data & Pelaporan**
      - ⚙️ **Administrator Sistem**
    - Buku jurnal operasi tak terhapuskan dengan kode integritas **SHA-256**.

11. **Mode Lapangan Khusus Ponsel (Field Mobile Mode)**
    - Tampilan sentuh ramah sarung tangan (*glove-friendly buttons*).
    - Koordinat GPS target ukuran besar dan mudah terbaca di bawah terik matahari.
    - Lapor cepat kondisi fisik gambut dengan penyimpanan lokal (*offline queue*).

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi dibangun dengan arsitektur web modern yang sangat ringan, tanpa ketergantungan build kompleks:

### Opsi 1: Menjalankan Server Lokal (Disarankan)
Klik dua kali berkas:
```cmd
run-app.bat
```
Atau jalankan melalui command line / terminal:
```cmd
& "C:\Users\mco-user\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js
```
Lalu buka peramban Anda di: **`http://localhost:3000`**

### Opsi 2: Membuka Langsung di Browser
Buka berkas **`index.html`** langsung menggunakan Google Chrome, Microsoft Edge, atau Mozilla Firefox.

---

## 📁 Struktur Berkas

```
sar-firewatch/
├── index.html               # Halaman utama aplikasi SPA
├── server.js                # Server HTTP Node.js lokal
├── run-app.bat              # Script satu klik peluncur aplikasi di Windows
├── README.md                # Dokumentasi & panduan operasional
├── css/
│   └── styles.css           # Styling command center, tema navy, radar & leaflet markers
└── js/
    ├── app.js               # Pengendali navigasi utama, router, dan jam operasional
    ├── data.js              # Database simulasi operasional Indonesia terpusat
    ├── map.js               # Tactical Map GIS Engine (Leaflet & fallback Canvas Vector)
    └── modules/
        ├── dashboard.js     # Modul Command Center Dashboard
        ├── incidents.js     # Modul Manajemen Insiden Karhutla
        ├── priorityEngine.js# Algoritma Decision Support System (DSS)
        ├── personnel.js     # Modul Tim SAR & Telemetri Personel
        ├── logistics.js     # Modul Armada Water Bombing & Logistik
        ├── comms.js         # Modul Pesan & Komunikasi Radio VHF
        ├── evacuation.js    # Modul Keselamatan Warga & Shelter
        ├── sitrep.js        # Generator SITREP Resmi & Analitik
        ├── dataSources.js   # Sensor Satelit & Mutu Integritas Data
        ├── auditLog.js      # Pengaturan Pengguna, RBAC & Audit Hash
        └── fieldMode.js     # Antarmuka Khusus Petugas di Ponsel
```

---

*Dikembangkan untuk kesiapsiagaan operasi penyelamatan dan perlindungan masyarakat dari bencana kebakaran hutan dan lahan di Indonesia.*
