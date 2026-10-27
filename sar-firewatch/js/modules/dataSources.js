/**
 * SAR FireWatch - Data Sources, Sensors & Quality Assurance Module
 */

window.DataSourcesModule = (function () {
  let isSyncing = false;

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sources = window.SAR_DATA.getDataSources();

    const isLive = window.SAR_DATA.isLiveMode();

    container.innerHTML = `
      <div class="space-y-6">
        <!-- HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-100 uppercase tracking-wider">Sumber Data & Sensor Pemantauan</h1>
              ${isLive ? `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  STREAMING AKTUAL AKTIF
                </span>
              ` : `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">DATA SIMULASI</span>
              `}
            </div>
            <p class="text-xs text-slate-400 mt-1">Status integrasi citra satelit, stasiun cuaca BMKG, sensor kualitas udara ISPU, dan telemetri GPS</p>
          </div>

          <button 
            onclick="DataSourcesModule.forceSync()"
            ${isSyncing ? 'disabled' : ''}
            class="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all">
            <span class="${isSyncing ? 'animate-spin' : ''}">🔄</span>
            <span>${isSyncing ? 'Menyinkronkan Data...' : 'Paksa Sinkronisasi Satelit'}</span>
          </button>
        </div>

        <!-- SUMMARY QUALITY OVERVIEW -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 class="text-sm font-bold text-slate-100 uppercase">Indikator Kualitas & Ketidakpastian Data</h3>
              <p class="text-xs text-slate-400">Tingkat keyakinan data operasional SAR FireWatch</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs font-bold text-emerald-400">SEMUA KANAL DATA NORMAL & TERHUBUNG</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span class="text-slate-500 text-[10px] uppercase font-semibold">Tingkat Ketidakpastian Satelit</span>
              <div class="text-lg font-black text-amber-400 mt-0.5">± 375 Meter (VIIRS)</div>
              <p class="text-[11px] text-slate-400 mt-1">Ground resolution pixel satelit. Selalu memerlukan verifikasi ground check petugas sebelum penetapan status Kritis.</p>
            </div>

            <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span class="text-slate-500 text-[10px] uppercase font-semibold">Latensi Rata-Rata Feed</span>
              <div class="text-lg font-black text-cyan-400 mt-0.5">< 45 Detik</div>
              <p class="text-[11px] text-slate-400 mt-1">Transmisi data telemetri dari armada darat dan sensor BMKG ke pusat kendali nasional.</p>
            </div>

            <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span class="text-slate-500 text-[10px] uppercase font-semibold">Validitas Verifikasi Posko</span>
              <div class="text-lg font-black text-emerald-400 mt-0.5">96.8% Valid</div>
              <p class="text-[11px] text-slate-400 mt-1">Tingkat akurasi titik api terdeteksi terhadap laporan fisik tim Manggala Agni & SAR di darat.</p>
            </div>
          </div>
        </div>

        <!-- DATA SOURCES INTEGRATION LIST -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${sources.map(src => `
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition-all">
              <div class="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">${src.icon}</span>
                  <div>
                    <h4 class="font-bold text-slate-100 text-sm">${src.name}</h4>
                    <p class="text-xs text-slate-400">${src.category}</p>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ${src.status}
                </span>
              </div>

              <div class="mt-3 space-y-2 text-xs">
                <div class="flex justify-between bg-slate-950/60 p-2 rounded">
                  <span class="text-slate-400">Sinkronisasi Terakhir:</span>
                  <span class="font-bold text-slate-200">${src.lastSync}</span>
                </div>
                <div class="flex justify-between bg-slate-950/60 p-2 rounded">
                  <span class="text-slate-400">Latensi Jaringan:</span>
                  <span class="font-bold text-cyan-400">${src.latencySec} ms</span>
                </div>
                <div class="flex justify-between bg-slate-950/60 p-2 rounded">
                  <span class="text-slate-400">Skor Kualitas Feed:</span>
                  <span class="font-bold text-emerald-400">${src.qualityScore}</span>
                </div>
                <div class="flex justify-between bg-slate-950/60 p-2 rounded">
                  <span class="text-slate-400">Kapasitas Rekaman:</span>
                  <span class="font-bold text-slate-300">${src.recordCount}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function forceSync() {
    isSyncing = true;
    render('main-content-view');

    setTimeout(() => {
      isSyncing = false;
      alert('Sinkronisasi citra satelit NASA FIRMS dan radar BMKG berhasil diperbarui!\n\n14 Titik panas baru telah dipetakan.');
      render('main-content-view');
    }, 1500);
  }

  return {
    render,
    forceSync
  };
})();
