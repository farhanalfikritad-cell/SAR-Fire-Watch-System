/**
 * SAR FireWatch - Dashboard Command Center Module
 */

window.DashboardModule = (function () {
  let selectedProvince = 'all';
  let selectedPriority = 'all';

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const incidents = window.SAR_DATA.getIncidents();
    const hotspots = window.SAR_DATA.getHotspots();
    const teams = window.SAR_DATA.getTeams();
    const fleet = window.SAR_DATA.getFleet();
    const currentUser = window.SAR_DATA.getCurrentUser();

    // Perhitungan Metrik KPI
    const totalHotspots = hotspots.length + 94; // Total 128 simulasi
    const activeIncidents = incidents.filter(i => i.status !== 'Selesai');
    const criticalIncidents = activeIncidents.filter(i => i.priority === 'Kritis');
    const deployedTeams = teams.filter(t => t.status === 'Bertugas');
    const threatenedVillages = incidents.filter(i => i.distanceToSettlementKm <= 2.0).length;

    // Filter incidents
    let filteredIncidents = activeIncidents;
    if (selectedProvince !== 'all') {
      filteredIncidents = filteredIncidents.filter(i => i.province.toLowerCase().includes(selectedProvince.toLowerCase()));
    }
    if (selectedPriority !== 'all') {
      filteredIncidents = filteredIncidents.filter(i => i.priority.toLowerCase() === selectedPriority.toLowerCase());
    }

    const isLive = window.SAR_DATA.isLiveMode();

    container.innerHTML = `
      <div class="space-y-6">
        <!-- OPERATIONAL STATUS BANNER -->
        ${isLive ? `
          <div class="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xl font-bold">
                🛡️
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                    MODE ASLI (LIVE AKTUAL)
                  </span>
                  <span class="text-xs text-emerald-400 font-bold">Sistem Operasi Karhutla Nasional Terpadu (BASARNAS)</span>
                </div>
                <p class="text-xs text-slate-300 mt-0.5">
                  Terhubung ke Satelit NASA FIRMS (VIIRS 375m & MODIS), Radar Cuaca BMKG, Stasiun Sensor ISPU KLHK, dan GPS Telemetri.
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3 text-xs">
              <div class="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <span class="text-slate-400">Feed Satelit & BMKG:</span>
                <span class="text-emerald-400 font-bold ml-1">● Real-Time Aktif</span>
              </div>
              <button 
                onclick="SAR_APP.toggleOperationalMode()"
                class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700">
                Ganti Mode
              </button>
            </div>
          </div>
        ` : `
          <div class="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-xl font-bold">
                ⚠️
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">DATA SIMULASI · DEMO</span>
                  <span class="text-xs text-amber-400/80">Operasional Uji Coba BASARNAS & BNPB</span>
                </div>
                <p class="text-xs text-slate-300 mt-0.5">
                  Mode latihan dan pengujian antarmuka operasi penanggulangan karhutla.
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3 text-xs">
              <button 
                onclick="SAR_APP.toggleOperationalMode()"
                class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-md shadow-emerald-600/30">
                Aktifkan Mode Asli ➔
              </button>
            </div>
          </div>
        `}

        <!-- KPI STATS CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Hotspot -->
          <div class="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition-all duration-200 shadow-md relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 text-amber-500/10 text-7xl font-black pointer-events-none group-hover:text-amber-500/20 transition-all">🔥</div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Titik Panas Terpantau</span>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded ${isLive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}">
                ${isLive ? 'LIVE FIRMS' : 'SIMULASI'}
              </span>
            </div>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-3xl font-black text-amber-400">128</span>
              <span class="text-xs text-amber-300/80">Hotspot</span>
            </div>
            <div class="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>S-NPP: 64 | NOAA-20: 48</span>
              <span class="text-red-400 font-semibold">+14 dlm 6 jam</span>
            </div>
          </div>

          <!-- Card 2: Active Incidents -->
          <div class="bg-slate-900/90 border border-slate-800 hover:border-red-500/50 rounded-xl p-4 transition-all duration-200 shadow-md relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 text-red-500/10 text-7xl font-black pointer-events-none group-hover:text-red-500/20 transition-all">🚨</div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Insiden Karhutla Aktif</span>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded ${isLive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}">
                ${isLive ? 'LIVE TERVERIFIKASI' : 'SIMULASI'}
              </span>
            </div>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-3xl font-black text-red-400">${activeIncidents.length}</span>
              <span class="text-xs text-red-300/80">Kejadian</span>
            </div>
            <div class="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span><b class="text-red-400">${criticalIncidents.length} Kritis</b> · 2 Tinggi</span>
              <span class="text-cyan-400 font-semibold">4 Ditangani</span>
            </div>
          </div>

          <!-- Card 3: Teams Deployed -->
          <div class="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-200 shadow-md relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 text-cyan-500/10 text-7xl font-black pointer-events-none group-hover:text-cyan-500/20 transition-all">🧑‍🚒</div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Tim SAR Dikerahkan</span>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded ${isLive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}">
                ${isLive ? 'GPS ON' : 'SIMULASI'}
              </span>
            </div>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-3xl font-black text-cyan-400">16</span>
              <span class="text-xs text-cyan-300/80">Regu Gabungan</span>
            </div>
            <div class="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>184 Personel Terjun</span>
              <span class="text-emerald-400 font-semibold">100% Terpantau GPS</span>
            </div>
          </div>

          <!-- Card 4: Immediate Attention (Human Threat) -->
          <div class="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-xl p-4 transition-all duration-200 shadow-md relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 text-rose-500/10 text-7xl font-black pointer-events-none group-hover:text-rose-500/20 transition-all">⚠️</div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Perlu Perhatian Segera</span>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">PRIORITAS</span>
            </div>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-3xl font-black text-rose-400">${threatenedVillages}</span>
              <span class="text-xs text-rose-300/80">Zona (<1.5 km Warga)</span>
            </div>
            <div class="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Riau (Kampar), Kalteng (Sebangau)</span>
              <span class="text-amber-400 font-semibold">585 Jiwa Diungsikan</span>
            </div>
          </div>
        </div>

        <!-- FILTER & REGION SELECTOR BAR -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-xs text-slate-400 font-semibold uppercase">Filter Wilayah:</span>
            <div class="flex flex-wrap gap-1.5" id="dash-province-filters">
              ${['all', 'Riau', 'Kalimantan Tengah', 'Sumatera Selatan', 'Kalimantan Barat', 'Jambi'].map(prov => `
                <button 
                  onclick="DashboardModule.setProvinceFilter('${prov}')"
                  class="px-3 py-1 text-xs rounded-lg font-medium transition-all ${selectedProvince === prov ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
                  ${prov === 'all' ? 'Seluruh Indonesia' : prov}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-400 font-semibold uppercase">Prioritas:</span>
            <select 
              id="dash-priority-select" 
              onchange="DashboardModule.setPriorityFilter(this.value)"
              class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500">
              <option value="all" ${selectedPriority === 'all' ? 'selected' : ''}>Semua Tingkat</option>
              <option value="kritis" ${selectedPriority === 'kritis' ? 'selected' : ''}>Kritis (Mengancam Warga)</option>
              <option value="tinggi" ${selectedPriority === 'tinggi' ? 'selected' : ''}>Tinggi (Potensi Meluas)</option>
              <option value="sedang" ${selectedPriority === 'sedang' ? 'selected' : ''}>Sedang</option>
              <option value="rendah" ${selectedPriority === 'rendah' ? 'selected' : ''}>Rendah (Pendinginan)</option>
            </select>
            <button 
              onclick="window.SAR_APP.navigate('incidents', { openCreateModal: true })" 
              class="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all">
              <span>+</span>
              <span>Lapor Kejadian</span>
            </button>
          </div>
        </div>

        <!-- MAIN OPERATIONAL TWO-COLUMN SECTION -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left 2 Cols: High Priority Incident Feed -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                Daftar Insiden Prioritas Penanganan
              </h2>
              <span class="text-xs text-slate-400">Menampilkan ${filteredIncidents.length} Kejadian</span>
            </div>

            <div class="space-y-3">
              ${filteredIncidents.map(inc => {
                let priorityBadge = 'bg-red-500/20 text-red-400 border-red-500/30';
                if (inc.priority === 'Tinggi') priorityBadge = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                if (inc.priority === 'Sedang') priorityBadge = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
                if (inc.priority === 'Rendah') priorityBadge = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

                return `
                  <div class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-cyan-300">${inc.id}</span>
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${priorityBadge}">${inc.priority}</span>
                          <span class="text-xs text-slate-400">Status: <b class="text-slate-200">${inc.status}</b></span>
                        </div>
                        <h3 class="text-base font-bold text-slate-100 mt-1">${inc.title}</h3>
                        <p class="text-xs text-slate-400">${inc.locationName}, ${inc.regency}, ${inc.province}</p>
                      </div>
                      <div class="text-right">
                        <button 
                          onclick="window.SAR_APP.showIncidentDetail('${inc.id}')"
                          class="bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-all flex items-center gap-1">
                          <span>Detail & Komando</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>

                    <!-- Risk Indicators Grid -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-1 text-xs">
                      <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                        <span class="text-slate-500 block text-[10px] uppercase">Jarak Permukiman</span>
                        <span class="font-bold ${inc.distanceToSettlementKm <= 1.0 ? 'text-red-400' : 'text-slate-200'}">
                          ${inc.distanceToSettlementKm} km (${inc.settlementName.split('(')[0]})
                        </span>
                      </div>
                      <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                        <span class="text-slate-500 block text-[10px] uppercase">Luas Terbakar</span>
                        <span class="font-bold text-amber-400">${inc.estimatedAreaHa} Hektar</span>
                      </div>
                      <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                        <span class="text-slate-500 block text-[10px] uppercase">Kedalaman Gambut</span>
                        <span class="font-bold text-slate-200">${inc.peatDepthM} meter</span>
                      </div>
                      <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                        <span class="text-slate-500 block text-[10px] uppercase">Arah Angin</span>
                        <span class="font-bold text-cyan-400">${inc.windSpeedKmh} km/j (${inc.windDirection.split(' ke ')[1] || inc.windDirection})</span>
                      </div>
                    </div>

                    <!-- Reason callout -->
                    <div class="mt-3 text-xs bg-slate-950/40 border-l-2 ${inc.priority === 'Kritis' ? 'border-red-500' : 'border-amber-500'} p-2 rounded-r text-slate-300">
                      <b class="text-slate-200">Alasan Prioritas:</b> ${inc.priorityReason}
                    </div>

                    <div class="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                      <div class="flex items-center gap-2">
                        <span>Penanggung Jawab: <b class="text-slate-200">${inc.commanderInCharge}</b></span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span>Tim Aktif: <b class="text-cyan-400">${inc.assignedTeams.length} Regu</b></span>
                        <button 
                          onclick="window.SAR_APP.navigate('map', { focusIncident: '${inc.id}' })"
                          class="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium">
                          Lihat di Peta Taktis ↗
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right 1 Col: Operational Weather, Resource Readiness, Live Ticker -->
          <div class="space-y-6">
            <!-- Weather & Fire Danger Index (BMKG) -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🌦️</span> Indeks Bahaya Kebakaran BMKG
                </h3>
                <span class="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">SIAGA TINGGI</span>
              </div>
              <div class="mt-3 space-y-2.5 text-xs">
                <div class="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg">
                  <span class="text-slate-400">Rerata Suhu Permukaan Gambut</span>
                  <span class="font-bold text-amber-400">34.8°C (Kering)</span>
                </div>
                <div class="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg">
                  <span class="text-slate-400">Kelembaban Relatif (RH)</span>
                  <span class="font-bold text-red-400">42% (Sangat Kering)</span>
                </div>
                <div class="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg">
                  <span class="text-slate-400">Hari Tanpa Hujan (HTH)</span>
                  <span class="font-bold text-red-400">18 Hari Berturut-turut</span>
                </div>
                <div class="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg">
                  <span class="text-slate-400">Indeks Standar Pencemar Udara</span>
                  <span class="font-bold text-rose-400">324 (Kategori Berbahaya)</span>
                </div>
              </div>
            </div>

            <!-- Resource Fleet Summary -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🚁</span> Kesiapan Armada & Personel
                </h3>
                <button onclick="window.SAR_APP.navigate('logistics')" class="text-[11px] text-cyan-400 hover:underline">Kelola Armada →</button>
              </div>
              <div class="mt-3 space-y-3">
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-400">Helikopter Water Bombing</span>
                    <span class="text-emerald-400 font-bold">2 Ditugaskan / 3 Tersedia</span>
                  </div>
                  <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div class="bg-cyan-500 h-full rounded-full" style="width: 66%"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-400">Truk Tangki & Rescue Carrier 4x4</span>
                    <span class="text-emerald-400 font-bold">5 Beroperasi / 6 Total</span>
                  </div>
                  <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div class="bg-emerald-500 h-full rounded-full" style="width: 83%"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-400">Personel SAR Lapangan (SRU)</span>
                    <span class="text-amber-400 font-bold">184 Bertugas / 240 Siaga</span>
                  </div>
                  <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div class="bg-amber-500 h-full rounded-full" style="width: 76%"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-400">Stok Busa Foam Pemadam Gambut</span>
                    <span class="text-cyan-400 font-bold">12.400 Liter Tersimpan</span>
                  </div>
                  <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div class="bg-cyan-400 h-full rounded-full" style="width: 90%"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Live Operations Activity Stream -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Aktivitas Operasi Terkini
                </h3>
                <span class="text-[10px] text-slate-400">Live Ticker</span>
              </div>
              <div class="mt-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                ${window.SAR_DATA.getAuditLogs().slice(0, 5).map(log => `
                  <div class="text-xs border-l-2 border-cyan-500/50 pl-2.5 py-0.5">
                    <div class="flex items-center justify-between text-[10px] text-slate-400">
                      <span class="font-bold text-slate-300">${log.user}</span>
                      <span>${new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                    </div>
                    <p class="text-slate-300 text-[11px] mt-0.5">${log.details}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function setProvinceFilter(prov) {
    selectedProvince = prov;
    render('main-content-view');
  }

  function setPriorityFilter(priority) {
    selectedPriority = priority;
    render('main-content-view');
  }

  return {
    render,
    setProvinceFilter,
    setPriorityFilter
  };
})();
