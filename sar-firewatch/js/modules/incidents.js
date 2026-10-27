/**
 * SAR FireWatch - Incident Management Module
 */

window.IncidentsModule = (function () {
  let searchKeyword = '';
  let filterStatus = 'all';
  let filterPriority = 'all';
  let activeDetailIncidentId = null;

  function render(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (options.focusIncident) {
      activeDetailIncidentId = options.focusIncident;
    }

    if (activeDetailIncidentId) {
      renderIncidentDetail(container, activeDetailIncidentId);
      return;
    }

    renderIncidentList(container);

    if (options.openCreateModal) {
      setTimeout(openCreateModal, 100);
    }
  }

  function renderIncidentList(container) {
    const incidents = window.SAR_DATA.getIncidents();
    const currentUser = window.SAR_DATA.getCurrentUser();
    const isLive = window.SAR_DATA.isLiveMode();

    // Filter logic
    let list = incidents.filter(inc => {
      const matchSearch = searchKeyword === '' || 
        inc.id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        inc.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        inc.locationName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        inc.regency.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        inc.province.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchStatus = filterStatus === 'all' || inc.status.toLowerCase() === filterStatus.toLowerCase();
      const matchPriority = filterPriority === 'all' || inc.priority.toLowerCase() === filterPriority.toLowerCase();

      return matchSearch && matchStatus && matchPriority;
    });

    container.innerHTML = `
      <div class="space-y-6">
        <!-- HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-100 uppercase tracking-wider">Manajemen Insiden Karhutla</h1>
              ${isLive ? `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  OPERASIONAL AKTUAL
                </span>
              ` : `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">DATA SIMULASI</span>
              `}
            </div>
            <p class="text-xs text-slate-400 mt-1">Katalog penanganan kejadian kebakaran hutan dan lahan terintegrasi seluruh Indonesia</p>
          </div>

          <div class="flex items-center gap-3">
            <button 
              onclick="IncidentsModule.openCreateModal()"
              class="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all">
              <span class="text-sm font-black">+</span>
              <span>Laporkan Insiden Baru</span>
            </button>
          </div>
        </div>

        <!-- SEARCH & FILTER BAR -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div class="relative flex-1">
            <input 
              type="text" 
              placeholder="Cari ID insiden, desa, kabupaten, atau kata kunci..." 
              value="${searchKeyword}"
              oninput="IncidentsModule.handleSearch(this.value)"
              class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 pl-8">
            <span class="absolute left-2.5 top-2.5 text-slate-500 text-xs">🔍</span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <select 
              onchange="IncidentsModule.handleFilterStatus(this.value)"
              class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500">
              <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>Semua Status</option>
              <option value="Baru" ${filterStatus === 'Baru' ? 'selected' : ''}>Baru Dilaporkan</option>
              <option value="Diverifikasi" ${filterStatus === 'Diverifikasi' ? 'selected' : ''}>Diverifikasi Posko</option>
              <option value="Ditangani" ${filterStatus === 'Ditangani' ? 'selected' : ''}>Sedang Ditangani</option>
              <option value="Terkendali" ${filterStatus === 'Terkendali' ? 'selected' : ''}>Terkendali / Pendinginan</option>
              <option value="Selesai" ${filterStatus === 'Selesai' ? 'selected' : ''}>Selesai / Padam</option>
            </select>

            <select 
              onchange="IncidentsModule.handleFilterPriority(this.value)"
              class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500">
              <option value="all" ${filterPriority === 'all' ? 'selected' : ''}>Semua Prioritas</option>
              <option value="Kritis" ${filterPriority === 'Kritis' ? 'selected' : ''}>Kritis (Ancaman Warga)</option>
              <option value="Tinggi" ${filterPriority === 'Tinggi' ? 'selected' : ''}>Tinggi</option>
              <option value="Sedang" ${filterPriority === 'Sedang' ? 'selected' : ''}>Sedang</option>
              <option value="Rendah" ${filterPriority === 'Rendah' ? 'selected' : ''}>Rendah</option>
            </select>
          </div>
        </div>

        <!-- TABLE OF INCIDENTS -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="p-3">ID & Judul Kejadian</th>
                  <th class="p-3">Lokasi & Koordinat</th>
                  <th class="p-3">Prioritas</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Ancaman Warga</th>
                  <th class="p-3">Tim Ditugaskan</th>
                  <th class="p-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-medium">
                ${list.length === 0 ? `
                  <tr>
                    <td colspan="7" class="p-8 text-center text-slate-500">
                      Tidak ada insiden karhutla yang cocok dengan kriteria pencarian Anda.
                    </td>
                  </tr>
                ` : list.map(inc => {
                  let priorityBadge = 'bg-red-500/20 text-red-400 border-red-500/30';
                  if (inc.priority === 'Tinggi') priorityBadge = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                  if (inc.priority === 'Sedang') priorityBadge = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
                  if (inc.priority === 'Rendah') priorityBadge = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

                  let statusBadge = 'bg-slate-800 text-slate-300';
                  if (inc.status === 'Ditangani') statusBadge = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
                  if (inc.status === 'Diverifikasi') statusBadge = 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
                  if (inc.status === 'Terkendali') statusBadge = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
                  if (inc.status === 'Baru') statusBadge = 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';

                  return `
                    <tr class="hover:bg-slate-800/40 transition-colors">
                      <td class="p-3">
                        <div class="flex items-center gap-1.5">
                          <span class="font-mono font-bold text-cyan-400">${inc.id}</span>
                          <span class="text-[10px] text-slate-500">(${inc.source.split(' ')[0]})</span>
                        </div>
                        <div class="font-bold text-slate-100 text-xs mt-0.5">${inc.title}</div>
                        <div class="text-[11px] text-slate-400">Luas: ${inc.estimatedAreaHa} Ha | Gambut: ${inc.peatDepthM}m</div>
                      </td>
                      <td class="p-3">
                        <div class="text-slate-200">${inc.locationName}</div>
                        <div class="text-slate-400 text-[11px]">${inc.regency}, ${inc.province}</div>
                        <div class="font-mono text-[10px] text-slate-500">${inc.lat.toFixed(4)}, ${inc.lng.toFixed(4)}</div>
                      </td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${priorityBadge}">${inc.priority}</span>
                      </td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge}">${inc.status}</span>
                      </td>
                      <td class="p-3">
                        <div class="font-bold ${inc.distanceToSettlementKm <= 1.0 ? 'text-red-400' : 'text-slate-200'}">
                          ${inc.distanceToSettlementKm} km ke pemukiman
                        </div>
                        <div class="text-[10px] text-slate-400">${inc.threatenedCivilians} Jiwa Terancam</div>
                      </td>
                      <td class="p-3">
                        <div class="font-semibold text-cyan-400">${inc.assignedTeams.length} Regu</div>
                        <div class="text-[10px] text-slate-400">${inc.assignedFleet.length} Armada</div>
                      </td>
                      <td class="p-3 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <button 
                            onclick="IncidentsModule.viewDetail('${inc.id}')"
                            class="bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded text-xs font-semibold border border-slate-700 transition-all">
                            Detail ➔
                          </button>
                          <button 
                            onclick="window.SAR_APP.navigate('map', { focusIncident: '${inc.id}' })"
                            class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs border border-slate-700 transition-all"
                            title="Tampilkan di Peta">
                            🗺️
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderIncidentDetail(container, incidentId) {
    const inc = window.SAR_DATA.getIncidentById(incidentId);
    if (!inc) {
      activeDetailIncidentId = null;
      renderIncidentList(container);
      return;
    }

    const currentUser = window.SAR_DATA.getCurrentUser();
    const canChangeStatus = currentUser.role.level >= 70; // Komandan, Pusdalops, Koordinator

    container.innerHTML = `
      <div class="space-y-6">
        <!-- BREADCRUMB & BACK BUTTON -->
        <div class="flex items-center justify-between">
          <button 
            onclick="IncidentsModule.backToList()"
            class="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-all">
            <span>← Kembali ke Daftar Insiden</span>
          </button>

          <div class="flex items-center gap-2">
            <button 
              onclick="window.SAR_APP.navigate('map', { focusIncident: '${inc.id}' })"
              class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
              <span>🗺️ Tampilkan di Peta Taktis</span>
            </button>
            <button 
              onclick="window.SAR_APP.navigate('sitrep', { incidentId: '${inc.id}' })"
              class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-600/30">
              <span>📄 Buat Dokumen SITREP</span>
            </button>
          </div>
        </div>

        <!-- HEADER CARD -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-1 rounded font-mono font-black bg-slate-800 text-cyan-400 text-xs tracking-wider">${inc.id}</span>
                <span class="px-2.5 py-1 rounded text-xs font-bold uppercase ${inc.priority === 'Kritis' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}">${inc.priority}</span>
                <span class="px-2.5 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">${inc.status}</span>
                <span class="text-xs text-slate-400">Dilaporkan: <b>${new Date(inc.reportedAt).toLocaleString('id-ID')}</b></span>
              </div>
              <h1 class="text-xl font-bold text-slate-100 mt-2">${inc.title}</h1>
              <p class="text-xs text-slate-300 mt-1">📍 ${inc.locationName}, ${inc.regency}, ${inc.province} (Koordinat: ${inc.lat}, ${inc.lng})</p>
            </div>

            <!-- ACTION CONTROLS FOR COMMANDERS -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              ${canChangeStatus ? `
                <select 
                  id="detail-status-select" 
                  onchange="IncidentsModule.handleStatusChangePrompt('${inc.id}', this.value)"
                  class="bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none">
                  <option value="" disabled selected>⚡ Ubah Status Penanganan...</option>
                  <option value="Baru" ${inc.status === 'Baru' ? 'disabled' : ''}>Baru</option>
                  <option value="Diverifikasi" ${inc.status === 'Diverifikasi' ? 'disabled' : ''}>Diverifikasi</option>
                  <option value="Ditangani" ${inc.status === 'Ditangani' ? 'disabled' : ''}>Ditangani</option>
                  <option value="Terkendali" ${inc.status === 'Terkendali' ? 'disabled' : ''}>Terkendali (Pendinginan)</option>
                  <option value="Selesai" ${inc.status === 'Selesai' ? 'disabled' : ''}>Selesai / Ditutup</option>
                </select>
              ` : `
                <span class="text-[11px] text-slate-500 italic bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">Hanya Komandan / Koordinator yang berhak mengubah status</span>
              `}
            </div>
          </div>

          <!-- KEY METRICS ROW -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 text-xs">
            <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span class="text-slate-500 block text-[10px] uppercase font-semibold">Jarak Permukiman</span>
              <span class="font-bold text-red-400 text-sm">${inc.distanceToSettlementKm} km</span>
              <span class="text-[10px] text-slate-400 block">${inc.settlementName}</span>
            </div>

            <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span class="text-slate-500 block text-[10px] uppercase font-semibold">Warga Terancam</span>
              <span class="font-bold text-amber-400 text-sm">${inc.threatenedCivilians} Jiwa</span>
              <span class="text-[10px] text-emerald-400 block">${inc.evacuatedCivilians} Dievakuasi</span>
            </div>

            <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span class="text-slate-500 block text-[10px] uppercase font-semibold">Luas Terbakar</span>
              <span class="font-bold text-slate-200 text-sm">${inc.estimatedAreaHa} Ha</span>
              <span class="text-[10px] text-slate-400 block">Potensi: ${inc.potentialThreatAreaHa} Ha</span>
            </div>

            <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span class="text-slate-500 block text-[10px] uppercase font-semibold">Kedalaman Gambut</span>
              <span class="font-bold text-slate-200 text-sm">${inc.peatDepthM} Meter</span>
              <span class="text-[10px] text-rose-400 block">Bara Tanah Aktif</span>
            </div>

            <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span class="text-slate-500 block text-[10px] uppercase font-semibold">Kualitas Udara ISPU</span>
              <span class="font-bold text-purple-400 text-sm">${inc.ispuValue}</span>
              <span class="text-[10px] text-purple-300 block">Kategori Berbahaya</span>
            </div>

            <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span class="text-slate-500 block text-[10px] uppercase font-semibold">Kecepatan Angin</span>
              <span class="font-bold text-cyan-400 text-sm">${inc.windSpeedKmh} km/j</span>
              <span class="text-[10px] text-cyan-300 block">${inc.windDirection}</span>
            </div>
          </div>

          <!-- REASON & ANALYSIS -->
          <div class="mt-4 p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-xs">
            <h4 class="font-bold text-red-300 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <span>⚠️</span> Analisis Prioritas & Ancaman Operasi:
            </h4>
            <p class="text-slate-300 mt-1 leading-relaxed">${inc.priorityReason}</p>
          </div>
        </div>

        <!-- 2-COL DETAILS: LEFT = CHRONOLOGY & DECISIONS, RIGHT = TEAMS & LOGISTICS & PHOTOS -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- LEFT: CHRONOLOGY & COMMAND DECISIONS -->
          <div class="space-y-6">
            <!-- Decision Log -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 class="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <span>🎖️</span> Catatan Keputusan Komando
                </h3>
                <button 
                  onclick="IncidentsModule.openDecisionModal('${inc.id}')"
                  class="bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-400 text-[11px] font-semibold px-2.5 py-1 rounded border border-slate-700 transition-all">
                  + Tambah Keputusan
                </button>
              </div>

              <div class="mt-3 space-y-3">
                ${inc.decisionLogs.length === 0 ? `
                  <p class="text-xs text-slate-500 italic py-2">Belum ada keputusan komando yang dicatat untuk insiden ini.</p>
                ` : inc.decisionLogs.map(dec => `
                  <div class="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs">
                    <div class="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800/60">
                      <span class="font-bold text-cyan-400">${dec.author}</span>
                      <span>${dec.time} WIB</span>
                    </div>
                    <p class="text-slate-200 mt-1.5 font-medium leading-relaxed">${dec.decision}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Chronology Audit Trail -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 class="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <span>📜</span> Kronologi Perubahan Status & Laporan Lapangan
                </h3>
                <span class="text-[10px] text-slate-400">${inc.chronology.length} Catatan</span>
              </div>

              <div class="mt-4 relative pl-4 border-l-2 border-slate-800 space-y-4">
                ${inc.chronology.map(item => `
                  <div class="relative text-xs">
                    <div class="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-slate-900"></div>
                    <div class="flex items-center gap-2 text-[10px] text-slate-400">
                      <span class="font-bold text-slate-300">${item.actor}</span>
                      <span>·</span>
                      <span>${item.time}</span>
                    </div>
                    <p class="text-slate-300 mt-0.5 leading-relaxed">${item.note}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- RIGHT: TEAMS DEPLOYED, FLEET, AND PHOTOS -->
          <div class="space-y-6">
            <!-- Assigned Teams -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 class="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <span>🧑‍🚒</span> Personel & Tim SAR Terjun
                </h3>
                <button 
                  onclick="window.SAR_APP.navigate('personnel')"
                  class="text-[11px] text-cyan-400 hover:underline">Kelola Tim →</button>
              </div>

              <div class="mt-3 space-y-2">
                ${inc.assignedTeams.map(teamId => {
                  const t = window.SAR_DATA.getTeams().find(x => x.id === teamId);
                  if (!t) return '';
                  return `
                    <div class="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs flex items-center justify-between">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-slate-200">${t.name}</span>
                          <span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-400">${t.id}</span>
                        </div>
                        <p class="text-slate-400 text-[11px] mt-0.5">${t.role} (${t.strength} Anggota - Komandan: ${t.leader})</p>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Bertugas' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}">
                        ${t.status}
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Assigned Fleet -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 class="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <span>🚒</span> Armada Water Bombing & Logistik
                </h3>
                <button 
                  onclick="window.SAR_APP.navigate('logistics')"
                  class="text-[11px] text-cyan-400 hover:underline">Kelola Armada →</button>
              </div>

              <div class="mt-3 space-y-2">
                ${inc.assignedFleet.map(fleetId => {
                  const f = window.SAR_DATA.getFleet().find(x => x.id === fleetId);
                  if (!f) return '';
                  return `
                    <div class="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs flex items-center justify-between">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-slate-200">${f.name}</span>
                          <span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-400">${f.code}</span>
                        </div>
                        <p class="text-slate-400 text-[11px] mt-0.5">${f.capacity} · Lokasi: ${f.location}</p>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400">
                        ${f.status}
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Field Photos -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 class="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <span>📷</span> Dokumentasi Kondisi Lapangan
                </h3>
                <button 
                  onclick="alert('Fitur Unggah Foto Lapangan: Tersimpan lokal dan tersinkronisasi ke server.');"
                  class="text-[11px] text-cyan-400 hover:underline">+ Unggah Foto</button>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-3">
                ${inc.photos && inc.photos.length > 0 ? inc.photos.map(p => `
                  <div class="bg-slate-950 rounded-lg overflow-hidden border border-slate-800 group">
                    <img src="${p.url}" alt="${p.caption}" class="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300">
                    <p class="p-2 text-[10px] text-slate-400 line-clamp-2">${p.caption}</p>
                  </div>
                `).join('') : `
                  <div class="col-span-2 py-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
                    Belum ada lampiran foto untuk insiden ini.
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function handleSearch(val) {
    searchKeyword = val;
    renderIncidentList(document.getElementById('main-content-view'));
  }

  function handleFilterStatus(val) {
    filterStatus = val;
    renderIncidentList(document.getElementById('main-content-view'));
  }

  function handleFilterPriority(val) {
    filterPriority = val;
    renderIncidentList(document.getElementById('main-content-view'));
  }

  function viewDetail(id) {
    activeDetailIncidentId = id;
    render('main-content-view');
  }

  function backToList() {
    activeDetailIncidentId = null;
    render('main-content-view');
  }

  function handleStatusChangePrompt(incidentId, newStatus) {
    const reason = prompt(`Masukkan alasan atau instruksi komando perubahan status insiden ${incidentId} menjadi [${newStatus}]:`, 'Verifikasi kondisi lapangan dan hasil pemadaman');
    if (reason !== null) {
      window.SAR_DATA.updateIncidentStatus(incidentId, newStatus, reason);
      alert(`Status insiden berhasil diperbarui menjadi ${newStatus}!`);
      render('main-content-view');
    }
  }

  function openDecisionModal(incidentId) {
    const decision = prompt(`Masukkan Catatan Keputusan Komando Baru untuk insiden [${incidentId}]:`);
    if (decision) {
      const inc = window.SAR_DATA.getIncidentById(incidentId);
      if (inc) {
        inc.decisionLogs.unshift({
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          decision: decision,
          author: window.SAR_DATA.getCurrentUser().name
        });
        alert('Keputusan Komando berhasil dicatat!');
        render('main-content-view');
      }
    }
  }

  /**
   * Modal Lapor Insiden Baru
   */
  function openCreateModal() {
    const modalEl = document.getElementById('global-modal-container');
    if (!modalEl) return;

    modalEl.innerHTML = `
      <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
          <button 
            onclick="document.getElementById('global-modal-container').innerHTML = ''"
            class="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold">✕</button>

          <div class="flex items-center gap-2 pb-3 border-b border-slate-800">
            <span class="text-xl">🚨</span>
            <div>
              <h2 class="text-base font-bold text-slate-100 uppercase tracking-wider">Formulir Laporan Insiden Karhutla Baru</h2>
              <p class="text-xs text-slate-400">Pusat Kendali Operasi Terpadu SAR BASARNAS (Mode Simulasi)</p>
            </div>
          </div>

          <form id="new-incident-form" onsubmit="IncidentsModule.submitNewIncident(event)" class="mt-4 space-y-4 text-xs">
            <div>
              <label class="block text-slate-300 font-semibold mb-1">Judul / Deskripsi Singkat Kejadian *</label>
              <input type="text" id="inc-title" required placeholder="Contoh: Kebakaran Gambut Perbatasan Desa Rawa Baru" 
                class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-semibold mb-1">Provinsi *</label>
                <select id="inc-province" required class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500">
                  <option value="Riau">Riau</option>
                  <option value="Kalimantan Tengah">Kalimantan Tengah</option>
                  <option value="Sumatera Selatan">Sumatera Selatan</option>
                  <option value="Kalimantan Barat">Kalimantan Barat</option>
                  <option value="Jambi">Jambi</option>
                  <option value="Kalimantan Selatan">Kalimantan Selatan</option>
                </select>
              </div>
              <div>
                <label class="block text-slate-300 font-semibold mb-1">Kabupaten / Kota *</label>
                <input type="text" id="inc-regency" required placeholder="Contoh: Kabupaten Kampar" 
                  class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-semibold mb-1">Nama Desa & Kecamatan *</label>
                <input type="text" id="inc-location-name" required placeholder="Contoh: Desa Bukit Ranah, Kec. Kampar" 
                  class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500">
              </div>
              <div>
                <label class="block text-slate-300 font-semibold mb-1">Sumber Informasi Laporan *</label>
                <select id="inc-source" required class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500">
                  <option value="Laporan Petugas Lapangan">Laporan Petugas Posko / Lapangan</option>
                  <option value="Satelit S-NPP VIIRS">Satelit S-NPP VIIRS</option>
                  <option value="Satelit NOAA-20">Satelit NOAA-20</option>
                  <option value="Laporan Masyarakat Peduli Api (MPA)">Laporan Masyarakat / MPA</option>
                  <option value="Patroli Udara Drone">Patroli Udara Drone FLIR</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Latitude *</label>
                <input type="number" step="0.0001" id="inc-lat" required value="0.4120" 
                  class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100">
              </div>
              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Longitude *</label>
                <input type="number" step="0.0001" id="inc-lng" required value="101.3500" 
                  class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100">
              </div>
              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Jarak Warga (km) *</label>
                <input type="number" step="0.1" id="inc-dist-settlement" required value="0.9" oninput="IncidentsModule.updateRiskPreview()"
                  class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100">
              </div>
              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Gambut (meter)</label>
                <input type="number" step="0.1" id="inc-peat" value="2.5" oninput="IncidentsModule.updateRiskPreview()"
                  class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100">
              </div>
            </div>

            <!-- Priority & Risk Preview via PriorityEngine -->
            <div id="create-risk-preview-box" class="p-3 bg-slate-950 rounded-xl border border-cyan-500/40">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400">Rekomendasi Prioritas (DSS Engine):</span>
                <span id="preview-priority-badge" class="px-2 py-0.5 rounded font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">KRITIS</span>
              </div>
              <p id="preview-priority-reason" class="text-[11px] text-slate-300 mt-1">Jarak api < 1.0 km ke permukiman warga dan kedalaman gambut > 2.0 meter.</p>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button 
                type="button" 
                onclick="document.getElementById('global-modal-container').innerHTML = ''"
                class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
              <button 
                type="submit" 
                class="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30">Simpan Laporan Kejadian</button>
            </div>
          </form>
        </div>
      </div>
    `;

    updateRiskPreview();
  }

  function updateRiskPreview() {
    const distEl = document.getElementById('inc-dist-settlement');
    const peatEl = document.getElementById('inc-peat');
    const badgeEl = document.getElementById('preview-priority-badge');
    const reasonEl = document.getElementById('preview-priority-reason');

    if (!distEl || !badgeEl) return;

    const dist = parseFloat(distEl.value) || 5.0;
    const peat = parseFloat(peatEl.value) || 0;

    const evalResult = window.PriorityEngine.evaluateIncidentRisk({
      distanceToSettlementKm: dist,
      peatDepthM: peat,
      threatenedCivilians: dist < 1.5 ? 200 : 0
    });

    badgeEl.innerText = evalResult.recommendedPriority;
    badgeEl.className = `px-2 py-0.5 rounded font-bold uppercase ${evalResult.priorityClass}`;
    reasonEl.innerText = evalResult.reasons.join(' ') || evalResult.urgencyDescription;
  }

  function submitNewIncident(e) {
    e.preventDefault();
    const title = document.getElementById('inc-title').value;
    const province = document.getElementById('inc-province').value;
    const regency = document.getElementById('inc-regency').value;
    const locationName = document.getElementById('inc-location-name').value;
    const source = document.getElementById('inc-source').value;
    const lat = parseFloat(document.getElementById('inc-lat').value);
    const lng = parseFloat(document.getElementById('inc-lng').value);
    const dist = parseFloat(document.getElementById('inc-dist-settlement').value);
    const peat = parseFloat(document.getElementById('inc-peat').value);

    // Duplication Check: Cek apakah ada insiden dalam radius 3 km
    const existing = window.SAR_DATA.getIncidents();
    const duplicate = existing.find(i => {
      const dLat = Math.abs(i.lat - lat);
      const dLng = Math.abs(i.lng - lng);
      return (dLat < 0.03 && dLng < 0.03); // Sekitar ~3.3 km
    });

    if (duplicate) {
      const proceed = confirm(`PERINGATAN DUPLIKASI:\n\nTerdeteksi insiden yang sudah tercatat di area sekitar (${duplicate.id}: ${duplicate.title}).\n\nApakah Anda tetap ingin mendaftarkan insiden ini sebagai kejadian baru?`);
      if (!proceed) return;
    }

    const evalResult = window.PriorityEngine.evaluateIncidentRisk({
      distanceToSettlementKm: dist,
      peatDepthM: peat,
      threatenedCivilians: dist < 1.5 ? 150 : 0
    });

    const newInc = {
      id: `INC-2026-${province.substring(0, 2).toUpperCase()}-${String(existing.length + 1).padStart(3, '0')}`,
      code: `${province.substring(0, 2).toUpperCase()}-NEW`,
      title,
      locationName,
      regency,
      province,
      lat,
      lng,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source,
      sourceReliability: 'Laporan Baru (Verifikasi 85%)',
      status: 'Baru',
      priority: evalResult.recommendedPriority,
      peatDepthM: peat,
      fuelType: 'Lahan Gambut & Belukar',
      windSpeedKmh: 14,
      windDirection: 'Tenggara ke Barat',
      windDegree: 120,
      ispuValue: 160,
      distanceToSettlementKm: dist,
      settlementName: 'Permukiman Terdekat (' + dist + ' km)',
      vitalFacilities: [],
      estimatedAreaHa: 12.0,
      potentialThreatAreaHa: 35.0,
      threatenedCivilians: dist < 1.5 ? 180 : 0,
      evacuatedCivilians: 0,
      commanderInCharge: window.SAR_DATA.getCurrentUser().name,
      assignedTeams: [],
      assignedFleet: [],
      priorityReason: evalResult.reasons.join(' '),
      notes: 'Laporan baru dibuat melalui dashboard operasi.',
      chronology: [
        { time: new Date().toISOString().replace('T', ' ').substring(0, 16), actor: window.SAR_DATA.getCurrentUser().name, note: 'Laporan insiden baru berhasil didaftarkan.' }
      ],
      decisionLogs: [],
      photos: []
    };

    window.SAR_DATA.addIncident(newInc);
    document.getElementById('global-modal-container').innerHTML = '';
    alert(`Laporan insiden ${newInc.id} berhasil disimpan ke sistem operasi!`);
    viewDetail(newInc.id);
  }

  return {
    render,
    handleSearch,
    handleFilterStatus,
    handleFilterPriority,
    viewDetail,
    backToList,
    handleStatusChangePrompt,
    openDecisionModal,
    openCreateModal,
    updateRiskPreview,
    submitNewIncident
  };
})();
