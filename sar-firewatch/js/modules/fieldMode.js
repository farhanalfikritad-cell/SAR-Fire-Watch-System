/**
 * SAR FireWatch - Field Operations Mobile UI Module (Tampilan Petugas Lapangan)
 */

window.FieldModeModule = (function () {
  let offlineQueue = [];

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentUser = window.SAR_DATA.getCurrentUser();
    const teams = window.SAR_DATA.getTeams();
    const myTeam = teams[0]; // SRU 1 default
    const inc = window.SAR_DATA.getIncidentById(myTeam.currentIncidentId) || window.SAR_DATA.getIncidents()[0];

    container.innerHTML = `
      <div class="max-w-md mx-auto space-y-4">
        <!-- MOBILE TOP BAR SIMULATION -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-slate-100 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs font-mono font-bold uppercase text-cyan-400">Pusat Lapangan SAR</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
                📶 Sinyal: Kuat (4G/Radio)
              </span>
              <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                🔋 84%
              </span>
            </div>
          </div>

          <!-- USER CALLSIGN -->
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-black">${currentUser.name}</div>
              <div class="text-xs text-slate-400 font-mono">CALLSIGN: ${currentUser.callsign} · ${myTeam.name}</div>
            </div>
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              ${myTeam.status}
            </span>
          </div>
        </div>

        <!-- BIG PANIC / SOS BUTTON -->
        <button 
          onclick="FieldModeModule.triggerSOS()"
          class="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-95 text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-red-600/40 border-2 border-red-400/50 transition-all uppercase tracking-wider">
          <span class="text-2xl animate-bounce">🚨</span>
          <span>SINYAL DARURAT LAPANGAN (SOS)</span>
        </button>

        <!-- CURRENT ASSIGNED MISSION CARD -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Penugasan Aktif Anda</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
              PRIORITAS: ${inc.priority}
            </span>
          </div>

          <div>
            <h3 class="text-sm font-bold text-slate-100">${inc.title}</h3>
            <p class="text-slate-400 text-[11px] mt-0.5">📍 ${inc.locationName}, ${inc.regency}</p>
          </div>

          <!-- GPS BIG READOUT -->
          <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center font-mono">
            <span class="text-[10px] text-slate-500 block uppercase">Koordinat Lokasi Target</span>
            <span class="text-base font-black text-cyan-400 tracking-wider">LAT ${inc.lat.toFixed(4)}° | LNG ${inc.lng.toFixed(4)}°</span>
          </div>

          <!-- TARGET PARAMETERS -->
          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <span class="text-slate-500 block">Jarak Warga:</span>
              <span class="font-bold text-red-400">${inc.distanceToSettlementKm} km (${inc.settlementName})</span>
            </div>
            <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <span class="text-slate-500 block">Arah Angin:</span>
              <span class="font-bold text-cyan-400">${inc.windSpeedKmh} km/j (${inc.windDirection.split(' ke ')[1] || inc.windDirection})</span>
            </div>
          </div>

          <div class="pt-2 flex gap-2">
            <button 
              onclick="FieldModeModule.updateTeamReadiness('Bertugas')"
              class="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs transition-all">
              ⚡ Konfirmasi Bertugas
            </button>
            <button 
              onclick="FieldModeModule.updateTeamReadiness('Siap')"
              class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition-all">
              ✓ Selesai / Siap
            </button>
          </div>
        </div>

        <!-- QUICK FIELD SITUATION REPORT FORM -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Lapor Cepat Kondisi Lapangan</span>
            <span class="text-[10px] text-emerald-400 font-semibold">Tersimpan Lokal Otomatis</span>
          </div>

          <form onsubmit="FieldModeModule.handleQuickReport(event)" class="space-y-3">
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Status Lapangan Terkini *</label>
              <select id="field-report-type" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100">
                <option value="Perkembangan Pemadaman">🔥 Perkembangan Pemadaman / Penyekatan Parit</option>
                <option value="Kondisi Asap & ISPU">💨 Peningkatan Ketebalan Asap / Jarak Pandang</option>
                <option value="Evakuasi Warga Selesai">🏘️ Warga Selesai Dipindahkan ke Shelter</option>
                <option value="Kebutuhan Logistik Tambahan">📦 Minta Tambahan Pompa / Selang / Masker</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Catatan Lapangan & Kondisi Fisik Gambut *</label>
              <textarea id="field-report-notes" required rows="3" placeholder="Contoh: Parit sekat barat selesai digali sepanjang 300m. Suplai air dari kanal mencukupi..." 
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"></textarea>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span>📷 Foto Lapangan: <b>2 Terlampir</b></span>
              <button type="button" onclick="alert('Kamera Telepon: Foto citra termal dan titik sekat berhasil diambil.');" class="text-cyan-400 font-bold hover:underline">
                + Ambil Foto
              </button>
            </div>

            <button 
              type="submit" 
              class="w-full bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2">
              <span>📡 Kirim Laporan Lapangan ke Pusdalops</span>
            </button>
          </form>
        </div>

        <!-- OFFLINE QUEUE BADGE -->
        <div class="text-center text-[11px] text-slate-500 pb-4">
          <span>Mode Offline Ready: Laporan tersimpan di storage lokal jika terjadi blank spot sinyal hutan.</span>
        </div>
      </div>
    `;
  }

  function triggerSOS() {
    PersonnelModule.triggerEmergencySOS();
  }

  function updateTeamReadiness(status) {
    const t = window.SAR_DATA.getTeams()[0];
    window.SAR_DATA.updateTeamStatus(t.id, status);
    alert(`Status tim Anda berhasil diperbarui menjadi: ${status}`);
    render('main-content-view');
  }

  function handleQuickReport(e) {
    e.preventDefault();
    const type = document.getElementById('field-report-type').value;
    const notes = document.getElementById('field-report-notes').value;
    const currentUser = window.SAR_DATA.getCurrentUser();

    window.SAR_DATA.addCommsMessage('INC-2026-RI-001', `[LAPORAN LAPANGAN - ${type}] ${notes}`, 'FIELD_REPORT');
    alert('Laporan lapangan berhasil dikirim ke Pusat Kendali Operasi!');
    document.getElementById('field-report-notes').value = '';
    render('main-content-view');
  }

  return {
    render,
    triggerSOS,
    updateTeamReadiness,
    handleQuickReport
  };
})();
