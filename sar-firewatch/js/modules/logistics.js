/**
 * SAR FireWatch - Fleet & Logistics Operations Module
 */

window.LogisticsModule = (function () {
  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const fleet = window.SAR_DATA.getFleet();
    const commandPosts = window.SAR_DATA.getCommandPosts();
    const isLive = window.SAR_DATA.isLiveMode();

    container.innerHTML = `
      <div class="space-y-6">
        <!-- HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-100 uppercase tracking-wider">Armada & Logistik Operasi</h1>
              ${isLive ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">● STATUS RESMI LOGISTIK</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">DATA SIMULASI</span>'}
            </div>
            <p class="text-xs text-slate-400 mt-1">Pengelolaan helikopter water bombing, armada amfibi, tangki karhutla, dan stok logistik darurat</p>
          </div>

          <button 
            onclick="LogisticsModule.openRequestModal()"
            class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all">
            <span>📦</span>
            <span>Permintaan Logistik Darurat</span>
          </button>
        </div>

        <!-- FLEET STATUS CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${fleet.map(f => {
            let statusBadge = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            if (f.status === 'Tersedia') statusBadge = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            if (f.status === 'Perawatan') statusBadge = 'bg-red-500/20 text-red-400 border-red-500/30';

            return `
              <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition-all">
                <div class="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-400">${f.code}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBadge}">${f.status}</span>
                    </div>
                    <h3 class="text-sm font-bold text-slate-100 mt-1">${f.name}</h3>
                    <p class="text-xs text-slate-400">${f.category} (${f.type})</p>
                  </div>
                </div>

                <div class="mt-3 space-y-2 text-xs">
                  <div class="flex justify-between bg-slate-950/60 p-2 rounded">
                    <span class="text-slate-400">Kapasitas / Alat:</span>
                    <span class="font-bold text-slate-200">${f.capacity}</span>
                  </div>

                  <div class="flex justify-between bg-slate-950/60 p-2 rounded">
                    <span class="text-slate-400">Operator / Pilot:</span>
                    <span class="font-bold text-cyan-300">${f.pilot || f.driver}</span>
                  </div>

                  <div class="flex justify-between bg-slate-950/60 p-2 rounded">
                    <span class="text-slate-400">Bahan Bakar:</span>
                    <span class="font-bold ${f.fuelPercent < 40 ? 'text-red-400' : 'text-emerald-400'}">${f.fuelPercent}%</span>
                  </div>

                  ${f.type === 'Udara' ? `
                    <div class="flex justify-between bg-slate-950/60 p-2 rounded">
                      <span class="text-slate-400">Sorties Hari Ini:</span>
                      <span class="font-bold text-amber-400">${f.sortiesToday} Sorties (${f.waterDroppedLiters.toLocaleString()} L Air)</span>
                    </div>
                  ` : ''}

                  <div class="text-[11px] text-slate-400 pt-1">
                    📍 <b>Lokasi:</b> ${f.location}
                  </div>
                </div>

                <div class="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  ${f.assignedIncidentId ? `
                    <span class="text-slate-400">Tugas: <b class="text-cyan-400">${f.assignedIncidentId}</b></span>
                  ` : `
                    <span class="text-emerald-400">Standby di Pangkalan</span>
                  `}
                  <button 
                    onclick="alert('Otorisasi Armada: Otorisasi jadwal penerbangan dan pengisian bahan bakar telah terverifikasi.');"
                    class="text-xs text-slate-400 hover:text-cyan-400">
                    Log Pemeliharaan ↗
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- LOGISTICS STOCKS AT COMMAND POSTS -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 class="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>⛽</span> Inventaris & Stok Logistik di Posko SAR Utama
            </h2>
            <span class="text-xs text-slate-400">Update Tiap 30 Menit</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            ${commandPosts.map(cp => `
              <div class="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs">
                <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 class="font-bold text-cyan-300 text-sm">${cp.name}</h4>
                  <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">${cp.type}</span>
                </div>
                <div class="mt-3 space-y-2">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Bahan Bakar (Avtur & Solar):</span>
                    <span class="font-bold text-amber-400">${cp.fuelStockL.toLocaleString()} Liter</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Busa Pemadam Gambut (Foam):</span>
                    <span class="font-bold text-cyan-400">${cp.foamStockL.toLocaleString()} Liter</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Fasilitas Helipad:</span>
                    <span class="font-bold ${cp.heliHeliport ? 'text-emerald-400' : 'text-slate-500'}">
                      ${cp.heliHeliport ? 'Tersedia & Aktif' : 'Tidak Ada'}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Personel Siaga:</span>
                    <span class="font-bold text-slate-200">${cp.personnelStandby} Anggota</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function openRequestModal() {
    const item = prompt('Masukkan jenis barang / kebutuhan logistik yang diminta:\n(Contoh: 5 Roll Selang 1.5", 200 Liter Busa Foam, 50 Box Masker Respirator N95)');
    if (item) {
      alert(`Permintaan Logistik [${item}] telah dicatat dan diteruskan ke bagian Perbekalan BASARNAS & BNPB.`);
    }
  }

  return {
    render,
    openRequestModal
  };
})();
