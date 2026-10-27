/**
 * SAR FireWatch - Settings, RBAC & Audit Trail Module
 */

window.AuditLogModule = (function () {
  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const auditLogs = window.SAR_DATA.getAuditLogs();
    const currentUser = window.SAR_DATA.getCurrentUser();
    const roles = window.SAR_DATA.ROLES;
    const isLive = window.SAR_DATA.isLiveMode();

    container.innerHTML = `
      <div class="space-y-6">
        <!-- HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-100 uppercase tracking-wider">Pengaturan, RBAC & Jejak Audit</h1>
              ${isLive ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">● OPERASIONAL AKTUAL</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">DATA SIMULASI</span>'}
            </div>
            <p class="text-xs text-slate-400 mt-1">Manajemen hak akses berbasis peran (RBAC) dan catatan kronologi tindakan operasional tidak terhapuskan</p>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 text-cyan-400 border border-slate-700">
              SHA-256 IMMUTABLE LOGGING: AKTIF
            </span>
          </div>
        </div>

        <!-- ACTIVE USER RBAC SWITCHER -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-2xl">
                ${currentUser.avatar}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-slate-100">${currentUser.name}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    ${currentUser.role.badge}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">${currentUser.rank} · ${currentUser.station}</p>
              </div>
            </div>

            <!-- Role Selector -->
            <div class="flex items-center gap-3">
              <span class="text-xs text-slate-400 font-semibold uppercase">Ubah Peran (Simulasi RBAC):</span>
              <select 
                onchange="AuditLogModule.handleRoleSwitch(this.value)"
                class="bg-slate-950 border border-cyan-500/50 text-cyan-300 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none">
                <option value="COMMANDER" ${currentUser.role.id === 'commander' ? 'selected' : ''}>👑 Komandan Operasi SAR (SMC)</option>
                <option value="OPERATOR" ${currentUser.role.id === 'operator' ? 'selected' : ''}>🖥️ Operator Pusat Kendali</option>
                <option value="COORDINATOR" ${currentUser.role.id === 'coordinator' ? 'selected' : ''}>🦺 Koordinator Lapangan (OSC)</option>
                <option value="PERSONNEL" ${currentUser.role.id === 'personnel' ? 'selected' : ''}>🚒 Personel SAR Lapangan (SRU)</option>
                <option value="ANALYST" ${currentUser.role.id === 'analyst' ? 'selected' : ''}>📊 Analis Data & Pelaporan</option>
                <option value="ADMIN" ${currentUser.role.id === 'admin' ? 'selected' : ''}>⚙️ Administrator Sistem</option>
              </select>
            </div>
          </div>

          <!-- RBAC ROLES PERMISSION MATRIX -->
          <div class="mt-4">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Matriks Hak Akses Peran Operasional:</h4>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-300">
                <thead class="bg-slate-950/60 uppercase text-[10px] text-slate-500">
                  <tr>
                    <th class="p-2.5">Peran</th>
                    <th class="p-2.5">Tingkat</th>
                    <th class="p-2.5">Buat Insiden</th>
                    <th class="p-2.5">Ubah Status / Tutup</th>
                    <th class="p-2.5">Tugaskan Tim & Armada</th>
                    <th class="p-2.5">Buat SITREP</th>
                    <th class="p-2.5">Audit Log</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 font-medium">
                  <tr class="${currentUser.role.id === 'admin' ? 'bg-cyan-500/10' : ''}">
                    <td class="p-2.5 font-bold text-slate-100">Administrator</td>
                    <td class="p-2.5 text-slate-400">Tingkat 100</td>
                    <td class="p-2.5 text-emerald-400">✓ Penuh</td>
                    <td class="p-2.5 text-emerald-400">✓ Penuh</td>
                    <td class="p-2.5 text-emerald-400">✓ Penuh</td>
                    <td class="p-2.5 text-emerald-400">✓ Penuh</td>
                    <td class="p-2.5 text-emerald-400">✓ Kelola</td>
                  </tr>
                  <tr class="${currentUser.role.id === 'commander' ? 'bg-cyan-500/10' : ''}">
                    <td class="p-2.5 font-bold text-slate-100">Komandan Operasi (SMC)</td>
                    <td class="p-2.5 text-slate-400">Tingkat 90</td>
                    <td class="p-2.5 text-emerald-400">✓ Ya</td>
                    <td class="p-2.5 text-emerald-400">✓ Otoritas Mutlak</td>
                    <td class="p-2.5 text-emerald-400">✓ Otorisasi Heli & Tim</td>
                    <td class="p-2.5 text-emerald-400">✓ Tandatangani</td>
                    <td class="p-2.5 text-slate-300">Melihat</td>
                  </tr>
                  <tr class="${currentUser.role.id === 'operator' ? 'bg-cyan-500/10' : ''}">
                    <td class="p-2.5 font-bold text-slate-100">Operator Pusat Kendali</td>
                    <td class="p-2.5 text-slate-400">Tingkat 80</td>
                    <td class="p-2.5 text-emerald-400">✓ Ya</td>
                    <td class="p-2.5 text-cyan-400">✓ Verifikasi Awal</td>
                    <td class="p-2.5 text-cyan-400">✓ Teruskan Tugas</td>
                    <td class="p-2.5 text-slate-300">Draft</td>
                    <td class="p-2.5 text-slate-300">Melihat</td>
                  </tr>
                  <tr class="${currentUser.role.id === 'coordinator' ? 'bg-cyan-500/10' : ''}">
                    <td class="p-2.5 font-bold text-slate-100">Koordinator Lapangan (OSC)</td>
                    <td class="p-2.5 text-slate-400">Tingkat 70</td>
                    <td class="p-2.5 text-emerald-400">✓ Ya</td>
                    <td class="p-2.5 text-cyan-400">✓ Sektor Lokal</td>
                    <td class="p-2.5 text-cyan-400">✓ Regu Sendiri</td>
                    <td class="p-2.5 text-slate-300">Input Data</td>
                    <td class="p-2.5 text-slate-500">-</td>
                  </tr>
                  <tr class="${currentUser.role.id === 'personnel' ? 'bg-cyan-500/10' : ''}">
                    <td class="p-2.5 font-bold text-slate-100">Personel SAR Lapangan (SRU)</td>
                    <td class="p-2.5 text-slate-400">Tingkat 50</td>
                    <td class="p-2.5 text-cyan-400">Lapor Lapangan</td>
                    <td class="p-2.5 text-slate-500">-</td>
                    <td class="p-2.5 text-slate-500">-</td>
                    <td class="p-2.5 text-slate-500">-</td>
                    <td class="p-2.5 text-slate-500">-</td>
                  </tr>
                  <tr class="${currentUser.role.id === 'analyst' ? 'bg-cyan-500/10' : ''}">
                    <td class="p-2.5 font-bold text-slate-100">Analis Data & Pelaporan</td>
                    <td class="p-2.5 text-slate-400">Tingkat 60</td>
                    <td class="p-2.5 text-slate-500">-</td>
                    <td class="p-2.5 text-slate-500">-</td>
                    <td class="p-2.5 text-slate-500">-</td>
                    <td class="p-2.5 text-emerald-400">✓ Olah & Ekspor</td>
                    <td class="p-2.5 text-slate-300">Audit Data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- IMMUTABLE AUDIT TRAIL LOG -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 class="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span>📜</span> Buku Jurnal Operasi & Audit Log Tak Terhapuskan
              </h3>
              <p class="text-xs text-slate-400">Setiap perubahan status, perintah penugasan, dan tindakan komando dicatat dengan stempel waktu terverifikasi</p>
            </div>
            <span class="text-xs text-slate-400">${auditLogs.length} Entri Log</span>
          </div>

          <div class="overflow-x-auto mt-4">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="p-3">Waktu & ID</th>
                  <th class="p-3">Pengguna & Peran</th>
                  <th class="p-3">Jenis Tindakan</th>
                  <th class="p-3">Detail Aktivitas</th>
                  <th class="p-3 font-mono text-[10px]">Hash Integritas (SHA-256)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-medium">
                ${auditLogs.map(log => `
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <td class="p-3">
                      <span class="font-mono text-cyan-400 font-bold block">${log.id}</span>
                      <span class="text-[10px] text-slate-400">${new Date(log.timestamp).toLocaleString('id-ID')}</span>
                    </td>
                    <td class="p-3">
                      <span class="font-bold text-slate-200 block">${log.user}</span>
                      <span class="text-[10px] text-slate-400">${log.role} (IP: ${log.ipAddress})</span>
                    </td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        ${log.action}
                      </span>
                    </td>
                    <td class="p-3 text-slate-300">
                      ${log.details}
                    </td>
                    <td class="p-3 font-mono text-[10px] text-slate-500 max-w-xs truncate" title="${log.immutableHash}">
                      ${log.immutableHash}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function handleRoleSwitch(roleKey) {
    if (window.SAR_DATA.setCurrentUserRole(roleKey)) {
      alert(`Peran operasional berhasil beralih ke: ${window.SAR_DATA.getCurrentUser().role.name}`);
      // Refresh entire app UI header and active view
      window.SAR_APP.updateHeaderUser();
      render('main-content-view');
    }
  }

  return {
    render,
    handleRoleSwitch
  };
})();
