/**
 * SAR FireWatch - SITREP Generator & Operational Analytics Module
 */

window.SitrepModule = (function () {
  let selectedIncidentId = 'ALL';

  function render(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (options.incidentId) {
      selectedIncidentId = options.incidentId;
    }

    const incidents = window.SAR_DATA.getIncidents();
    const teams = window.SAR_DATA.getTeams();
    const fleet = window.SAR_DATA.getFleet();
    const currentUser = window.SAR_DATA.getCurrentUser();
    const isLive = window.SAR_DATA.isLiveMode();

    container.innerHTML = `
      <div class="space-y-6">
        <!-- HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-100 uppercase tracking-wider">Laporan Situasi Operasi (SITREP) & Analitik</h1>
              ${isLive ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">● DOKUMEN RESMI PUSDALOPS</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">DATA SIMULASI</span>'}
            </div>
            <p class="text-xs text-slate-400 mt-1">Standar pelaporan Incident Situation Report BASARNAS & BNPB untuk pimpinan operasi</p>
          </div>

          <div class="flex items-center gap-2">
            <button 
              onclick="SitrepModule.exportCSV()"
              class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all">
              <span>📊</span>
              <span>Ekspor Excel / CSV</span>
            </button>
            <button 
              onclick="SitrepModule.printSITREP()"
              class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all">
              <span>🖨️</span>
              <span>Cetak / PDF Dokumen</span>
            </button>
          </div>
        </div>

        <!-- ANALYTICS CARDS (RESPONSE TIME & SUCCESS RATE) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span class="text-slate-400 text-[11px] uppercase font-semibold">Rerata Respons Time Laporan</span>
            <div class="text-2xl font-black text-emerald-400 mt-1">24 Menit</div>
            <span class="text-[10px] text-slate-500">Dari satelit ke pengerahan darat</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span class="text-slate-400 text-[11px] uppercase font-semibold">Efisiensi Water Bombing</span>
            <div class="text-2xl font-black text-cyan-400 mt-1">56.800 Liter</div>
            <span class="text-[10px] text-slate-500">22 Sorties Berhasil Hari Ini</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span class="text-slate-400 text-[11px] uppercase font-semibold">Tingkat Penyelamatan Warga</span>
            <div class="text-2xl font-black text-amber-400 mt-1">585 Jiwa</div>
            <span class="text-[10px] text-emerald-400">0 Korban Jiwa Terlaporkan</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span class="text-slate-400 text-[11px] uppercase font-semibold">Penurunan Titik Api Aktif</span>
            <div class="text-2xl font-black text-purple-400 mt-1">-32%</div>
            <span class="text-[10px] text-purple-300">Dibandingkan 48 jam lalu</span>
          </div>
        </div>

        <!-- INCIDENT SELECTOR FOR SITREP -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-400 font-bold uppercase">Pilih Ruang Lingkup SITREP:</span>
            <select 
              id="sitrep-scope-select"
              onchange="SitrepModule.changeScope(this.value)"
              class="bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-cyan-500">
              <option value="ALL" ${selectedIncidentId === 'ALL' ? 'selected' : ''}>SITREP NASIONAL (Ringkasan Seluruh Indonesia)</option>
              ${incidents.map(inc => `
                <option value="${inc.id}" ${selectedIncidentId === inc.id ? 'selected' : ''}>[${inc.id}] ${inc.title}</option>
              `).join('')}
            </select>
          </div>

          <button 
            onclick="SitrepModule.copyToClipboard()"
            class="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
            <span>📋 Salin Ringkasan Teks</span>
          </button>
        </div>

        <!-- STANDARDIZED SITREP DOCUMENT PREVIEW -->
        <div id="printable-sitrep" class="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-200 space-y-6">
          <!-- DOC HEADER -->
          <div class="border-b-2 border-slate-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-red-600/30">
                SAR
              </div>
              <div>
                <h2 class="text-base font-black uppercase tracking-wider text-white">BADAN NASIONAL PENCARIAN DAN PERTOLONGAN (BASARNAS)</h2>
                <p class="text-xs font-bold text-cyan-400 font-mono">INCIDENT SITUATION REPORT (SITREP) - OPERASI KARHUTLA</p>
                <p class="text-[10px] text-slate-400">
                  ${window.SAR_DATA.isLiveMode() ? 'KLASIFIKASI: DOKUMEN OPERASIONAL RESMI · PUSDALOPS NASIONAL BASARNAS' : 'KLASIFIKASI: DOKUMEN LATIHAN OPERASI · SIMULASI'}
                </p>
              </div>
            </div>

            <div class="text-right text-xs font-mono">
              <div class="text-slate-400">NOMOR REGISTER:</div>
              <div class="font-bold text-white">SITREP-KH/2026/X/027-01</div>
              <div class="text-[11px] text-cyan-400 mt-1">WAKTU: ${new Date().toLocaleString('id-ID')} WIB</div>
            </div>
          </div>

          ${selectedIncidentId === 'ALL' ? renderNationalSitrepContent(incidents, teams, fleet) : renderSpecificIncidentSitrepContent(selectedIncidentId)}

          <!-- SIGNATURE BLOCK -->
          <div class="pt-6 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span class="text-slate-500 text-[10px] uppercase block">Dibuat Oleh:</span>
              <span class="font-bold text-slate-300">${currentUser.name}</span>
              <span class="block text-slate-400 text-[11px]">${currentUser.role.name} (${currentUser.callsign})</span>
            </div>
            <div class="text-right">
              <span class="text-slate-500 text-[10px] uppercase block">Mengetahui Komandan Operasi:</span>
              <span class="font-bold text-white">Kolonel SAR Budi Santoso, S.Sos., M.M.</span>
              <span class="block text-slate-400 text-[11px]">SAR Mission Coordinator (SMC)</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderNationalSitrepContent(incidents, teams, fleet) {
    const active = incidents.filter(i => i.status !== 'Selesai');
    const critical = incidents.filter(i => i.priority === 'Kritis');

    return `
      <!-- SECTION 1: RINGKASAN SITUASI NASIONAL -->
      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">1. SITUASI OPERASIONAL NASIONAL</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Tercatat sebanyak <b>128 titik panas (hotspot)</b> terpantau satelit penginderaan jauh (S-NPP & NOAA-20 VIIRS) di wilayah Sumatera dan Kalimantan. Saat ini terkonfirmasi <b>${active.length} insiden karhutla aktif</b> yang ditangani tim gabungan BASARNAS, Manggala Agni, BPBD, TNI-Polri, dan Relawan MPA.
        </p>
        <p class="text-xs text-slate-300 leading-relaxed mt-2">
          Prioritas tertinggi (Status Kritis) tertuju pada <b>${critical.length} wilayah pemukiman berisiko langsung</b> di Kabupaten Kampar (Riau) dan Kabupaten Pulang Pisau (Kalimantan Tengah) dengan total 585 jiwa telah berhasil dievakuasi ke titik kumpul aman.
        </p>
      </div>

      <!-- SECTION 2: SUMBER DAYA & PENGERAHAN -->
      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">2. PENGERAHAN KEKUATAN & LOGISTIK</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div>
            <span class="text-slate-500 text-[10px] uppercase block">Personel Lapangan</span>
            <span class="font-bold text-slate-100 text-sm">184 Orang</span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] uppercase block">Water Bombing</span>
            <span class="font-bold text-cyan-400 text-sm">2 Heli Aktif (22 Sorties)</span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] uppercase block">Truk Tangki & Carrier</span>
            <span class="font-bold text-slate-100 text-sm">5 Unit Offroad</span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] uppercase block">Ketersediaan Foam</span>
            <span class="font-bold text-amber-400 text-sm">12.400 Liter</span>
          </div>
        </div>
      </div>

      <!-- SECTION 3: KENDALA OPERASIONAL -->
      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">3. KENDALA DAN HAMBATAN LAPANGAN</h3>
        <ul class="list-disc list-inside text-xs text-slate-300 space-y-1">
          <li>Kedalaman kubah gambut mencapai 3.2 - 4.1 meter menyebabkan bara api bawah tanah (sub-surface fire) terus menjalar meski permukaan basah.</li>
          <li>Keterbatasan akses jalan darat di rimbo pedalaman menuntut dukungan perahu katamaran dan water bombing intensif.</li>
          <li>Jarak pandang (visibility) di sejumlah sektor menurun hingga di bawah 200 meter akibat asap pekat (ISPU >300).</li>
        </ul>
      </div>

      <!-- SECTION 4: RENCANA TINDAK LANJUT -->
      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">4. RENCANA OPERASI SELANJUTNYA (RO-NEXT)</h3>
        <ul class="list-decimal list-inside text-xs text-slate-300 space-y-1">
          <li>Melanjutkan pemotongan jalur api (blocking canal) pada sektor barat Desa Rimbo Panjang untuk menjamin batas aman permukiman.</li>
          <li>Rotasi personel lapangan yang telah bertugas lebih dari 8 jam di area paparan asap pekat guna mencegah keracunan gas CO.</li>
          <li>Optimalisasi helikopter Kamov Ka-32 untuk pengeboman air kapasitas 5.000 liter di inti kubah gambut Sebangau.</li>
        </ul>
      </div>
    `;
  }

  function renderSpecificIncidentSitrepContent(incidentId) {
    const inc = window.SAR_DATA.getIncidentById(incidentId);
    if (!inc) return '<p class="text-xs text-red-400">Insiden tidak ditemukan.</p>';

    return `
      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">1. INFORMASI SPESIFIK KEJADIAN: [${inc.id}]</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
          <div><b class="text-slate-400">Nama Lokasi:</b> <span class="text-slate-200 block">${inc.locationName}</span></div>
          <div><b class="text-slate-400">Wilayah:</b> <span class="text-slate-200 block">${inc.regency}, ${inc.province}</span></div>
          <div><b class="text-slate-400">Koordinat:</b> <span class="text-cyan-400 block">${inc.lat}, ${inc.lng}</span></div>
          <div><b class="text-slate-400">Status Penanganan:</b> <span class="text-amber-400 block font-bold">${inc.status} (${inc.priority})</span></div>
        </div>
      </div>

      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">2. ANALISIS DAMPAK & ANCAMAN</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          ${inc.priorityReason} Luas area terbakar saat ini diperkirakan mencapai <b>${inc.estimatedAreaHa} Hektar</b> dengan kedalaman gambut <b>${inc.peatDepthM} Meter</b>. Jarak api ke permukiman terdekat adalah <b>${inc.distanceToSettlementKm} km</b> (${inc.settlementName}). Sebanyak <b>${inc.evacuatedCivilians} dari ${inc.threatenedCivilians} jiwa</b> telah diamankan ke posko pengungsian terdekat.
        </p>
      </div>

      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">3. TINDAKAN DAN KEPUTUSAN KOMANDO YANG TELAH DILAKUKAN</h3>
        <div class="space-y-1.5 text-xs text-slate-300">
          ${inc.decisionLogs.map(dec => `
            <div class="p-2 bg-slate-950/40 rounded border border-slate-800/60">
              <span class="text-cyan-400 font-bold">[${dec.time}] ${dec.author}:</span> ${dec.decision}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function changeScope(newScope) {
    selectedIncidentId = newScope;
    render('main-content-view');
  }

  function printSITREP() {
    window.print();
  }

  function copyToClipboard() {
    const el = document.getElementById('printable-sitrep');
    if (!el) return;
    navigator.clipboard.writeText(el.innerText).then(() => {
      alert('Teks SITREP berhasil disalin ke clipboard!');
    }).catch(() => {
      alert('Gagal menyalin teks secara otomatis.');
    });
  }

  function exportCSV() {
    const incidents = window.SAR_DATA.getIncidents();
    let csv = 'ID Insiden,Judul,Provinsi,Kabupaten,Status,Prioritas,Luas (Ha),Gambut (m),Warga Terancam,Dievakuasi,Komandan\n';
    incidents.forEach(i => {
      csv += `"${i.id}","${i.title}","${i.province}","${i.regency}","${i.status}","${i.priority}",${i.estimatedAreaHa},${i.peatDepthM},${i.threatenedCivilians},${i.evacuatedCivilians},"${i.commanderInCharge}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAR-FireWatch-SITREP-Data-${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    render,
    changeScope,
    printSITREP,
    copyToClipboard,
    exportCSV
  };
})();
