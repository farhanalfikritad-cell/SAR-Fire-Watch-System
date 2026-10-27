/**
 * SAR FireWatch - Personnel & SAR Teams Module
 */

window.PersonnelModule = (function () {
  let selectedStatus = 'all';

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const teams = window.SAR_DATA.getTeams();
    const currentUser = window.SAR_DATA.getCurrentUser();
    const canManageTeams = currentUser.role.level >= 70;
    const isLive = window.SAR_DATA.isLiveMode();

    let filtered = teams;
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    container.innerHTML = `
      <div class="space-y-6">
        <!-- HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-100 uppercase tracking-wider">Pelacakan Personel & Tim SAR</h1>
              ${isLive ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">● TELEMETRI GPS AKTUAL</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">DATA SIMULASI</span>'}
            </div>
            <p class="text-xs text-slate-400 mt-1">Status kesiapan, koordinat GPS telemetri, dan penugasan regu penyelamat di lapangan</p>
          </div>

          <div class="flex items-center gap-3">
            <button 
              onclick="PersonnelModule.triggerEmergencySOS()"
              class="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-red-600/30 animate-pulse transition-all">
              <span>🚨</span>
              <span>Panggilan Darurat SOS Lapangan</span>
            </button>
          </div>
        </div>

        <!-- KPI SUMMARY BAR -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <span class="text-slate-400 text-[11px] uppercase font-semibold">Total Regu Terdaftar</span>
            <div class="text-2xl font-black text-cyan-400 mt-1">${teams.length} Unit</div>
            <span class="text-[10px] text-slate-500">184 Personel Lapangan</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <span class="text-slate-400 text-[11px] uppercase font-semibold">Sedang Bertugas</span>
            <div class="text-2xl font-black text-amber-400 mt-1">${teams.filter(t => t.status === 'Bertugas').length} Regu</div>
            <span class="text-[10px] text-amber-300/80">Operasi Pemadaman & Evakuasi</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <span class="text-slate-400 text-[11px] uppercase font-semibold">Siaga di Posko</span>
            <div class="text-2xl font-black text-emerald-400 mt-1">${teams.filter(t => t.status === 'Siap').length} Regu</div>
            <span class="text-[10px] text-emerald-300/80">Siap Dikerahkan (Standby)</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <span class="text-slate-400 text-[11px] uppercase font-semibold">GPS Telemetri</span>
            <div class="text-2xl font-black text-cyan-400 mt-1">100%</div>
            <span class="text-[10px] text-emerald-400">Semua Unit Memancarkan Sinyal</span>
          </div>
        </div>

        <!-- FILTER TAB -->
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span class="text-xs text-slate-400 font-semibold mr-2">Filter Kesiapan:</span>
          ${['all', 'Bertugas', 'Siap', 'Istirahat', 'Butuh Bantuan'].map(st => `
            <button 
              onclick="PersonnelModule.filterStatus('${st}')"
              class="px-3 py-1 text-xs rounded-lg font-medium transition-all ${selectedStatus === st ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
              ${st === 'all' ? 'Semua Regu' : st}
            </button>
          `).join('')}
        </div>

        <!-- ROSTER CARDS GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${filtered.map(tm => {
            let statusBadge = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
            if (tm.status === 'Siap') statusBadge = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            if (tm.status === 'Butuh Bantuan') statusBadge = 'bg-red-500 text-white font-bold animate-pulse';

            return `
              <div class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-md transition-all">
                <div class="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono font-bold text-xs bg-slate-800 text-cyan-300 px-2 py-0.5 rounded">${tm.id}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusBadge}">${tm.status}</span>
                    </div>
                    <h3 class="text-sm font-bold text-slate-100 mt-1">${tm.name}</h3>
                    <p class="text-xs text-slate-400">${tm.role} (${tm.strength} Personel)</p>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-500 block">Komandan Regu:</span>
                    <span class="text-xs font-bold text-slate-200">${tm.leader}</span>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2 mt-3 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div>
                    <span class="text-[10px] text-slate-500 uppercase block">Baterai GPS</span>
                    <span class="font-bold text-slate-200">${tm.batteryGps}%</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-500 uppercase block">Suplai Air</span>
                    <span class="font-bold ${tm.waterSupplyPercent < 50 ? 'text-amber-400' : 'text-cyan-400'}">${tm.waterSupplyPercent}%</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-500 uppercase block">Respirator</span>
                    <span class="font-bold text-emerald-400">${tm.oxygenRespiratorCheck}</span>
                  </div>
                </div>

                <div class="mt-3 text-xs text-slate-300 space-y-1">
                  <p><b class="text-slate-400">Spesialisasi:</b> ${tm.speciality}</p>
                  <p><b class="text-slate-400">Peralatan:</b> ${tm.equipment.join(', ')}</p>
                  <p class="text-slate-500 text-[11px]">📍 Koordinat GPS: ${tm.lat.toFixed(4)}, ${tm.lng.toFixed(4)} (Cek: ${tm.lastCheckin})</p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    ${tm.currentIncidentId ? `
                      <span class="text-xs text-slate-400">Ditugaskan: <button onclick="window.SAR_APP.showIncidentDetail('${tm.currentIncidentId}')" class="text-cyan-400 font-bold hover:underline">${tm.currentIncidentId}</button></span>
                    ` : `
                      <span class="text-xs text-emerald-400 font-semibold">Siaga di Posko Induk</span>
                    `}
                  </div>

                  <div class="flex items-center gap-2">
                    ${canManageTeams ? `
                      <button 
                        onclick="PersonnelModule.openAssignModal('${tm.id}')"
                        class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs border border-slate-700">
                        Tugaskan / Pindah Status
                      </button>
                    ` : ''}
                    <button 
                      onclick="window.SAR_APP.navigate('map')"
                      class="text-cyan-400 hover:text-cyan-300 text-xs font-semibold">
                      Peta ↗
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function filterStatus(status) {
    selectedStatus = status;
    render('main-content-view');
  }

  function openAssignModal(teamId) {
    const t = window.SAR_DATA.getTeams().find(x => x.id === teamId);
    if (!t) return;

    const incidents = window.SAR_DATA.getIncidents();
    const newStatus = prompt(`Ubah Status Kesiapan Tim ${t.name}:\nPilihan: Siap, Bertugas, Istirahat, Butuh Bantuan`, t.status);
    if (newStatus && ['Siap', 'Bertugas', 'Istirahat', 'Butuh Bantuan'].includes(newStatus)) {
      window.SAR_DATA.updateTeamStatus(teamId, newStatus);
      alert(`Kesiapan ${t.name} berhasil diubah menjadi: ${newStatus}`);
      render('main-content-view');
    }
  }

  function triggerEmergencySOS() {
    const confirmSOS = confirm('APAKAH ANDA YAKIN INGIN MEMANCARKAN SUAR DARURAT LAPANGAN (SOS DISTRESS)?\n\nPusat kendali dan seluruh helikopter akan segera memprioritaskan evakuasi ke koordinat Anda.');
    if (confirmSOS) {
      const sosId = window.SAR_DATA.triggerSOS(
        window.SAR_DATA.getCurrentUser().name,
        '0.4418, 101.3284 (Riau - Sektor Rimbo Panjang)',
        'Personel terperangkap kepungan asap pekat di sektor barat kanal gambut.'
      );
      alert(`🚨 SUAR DARURAT TERPANCAR [${sosId}]\n\nSinyal telah dikirimkan ke frekuensi darurat Pusdalops Nasional dan seluruh armada SAR.`);
      window.SAR_APP.navigate('comms');
    }
  }

  return {
    render,
    filterStatus,
    openAssignModal,
    triggerEmergencySOS
  };
})();
