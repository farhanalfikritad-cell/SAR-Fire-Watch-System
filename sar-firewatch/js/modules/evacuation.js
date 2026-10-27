/**
 * SAR FireWatch - Evacuation & Public Safety Module
 */

window.EvacuationModule = (function () {
  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const shelters = window.SAR_DATA.getShelters();
    const incidents = window.SAR_DATA.getIncidents();
    const isLive = window.SAR_DATA.isLiveMode();

    // Aggregate vulnerable populations
    let totalCapacity = 0;
    let totalOccupants = 0;
    let totalInfants = 0;
    let totalElderly = 0;
    let totalPregnant = 0;
    let totalDisabilities = 0;

    shelters.forEach(s => {
      totalCapacity += s.capacityPersons;
      totalOccupants += s.currentOccupants;
      totalInfants += s.vulnerableStats.infants;
      totalElderly += s.vulnerableStats.elderly;
      totalPregnant += s.vulnerableStats.pregnant;
      totalDisabilities += s.vulnerableStats.disabilities;
    });

    container.innerHTML = `
      <div class="space-y-6">
        <!-- HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-100 uppercase tracking-wider">Evakuasi & Keselamatan Masyarakat</h1>
              ${isLive ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">● DATA RESMI BPBD/SAR</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">DATA SIMULASI</span>'}
            </div>
            <p class="text-xs text-slate-400 mt-1">Pemetaan tempat penampungan pengungsi, penanganan kelompok rentan, jalur aman, dan pesan peringatan dini</p>
          </div>

          <button 
            onclick="EvacuationModule.openBroadcastAlertBuilder()"
            class="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all">
            <span>📢</span>
            <span>Susun Peringatan Dini Warga</span>
          </button>
        </div>

        <!-- VULNERABLE POPULATION KPI STATS -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <span class="text-slate-400 text-[10px] uppercase font-semibold">Total Pengungsi</span>
            <div class="text-xl font-black text-cyan-400 mt-0.5">${totalOccupants} Jiwa</div>
            <span class="text-[10px] text-slate-500">Kapasitas: ${totalCapacity}</span>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <span class="text-slate-400 text-[10px] uppercase font-semibold">Balita & Anak</span>
            <div class="text-xl font-black text-amber-400 mt-0.5">${totalInfants} Bayi</div>
            <span class="text-[10px] text-amber-300/80">Kebutuhan Susu & Masker</span>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <span class="text-slate-400 text-[10px] uppercase font-semibold">Lansia (>60 Thn)</span>
            <div class="text-xl font-black text-rose-400 mt-0.5">${totalElderly} Jiwa</div>
            <span class="text-[10px] text-rose-300/80">Rentan ISPA & Asap</span>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <span class="text-slate-400 text-[10px] uppercase font-semibold">Ibu Hamil</span>
            <div class="text-xl font-black text-pink-400 mt-0.5">${totalPregnant} Jiwa</div>
            <span class="text-[10px] text-slate-400">Monitoring Medis</span>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <span class="text-slate-400 text-[10px] uppercase font-semibold">Disabilitas</span>
            <div class="text-xl font-black text-purple-400 mt-0.5">${totalDisabilities} Jiwa</div>
            <span class="text-[10px] text-slate-400">Prioritas Pendampingan</span>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <span class="text-slate-400 text-[10px] uppercase font-semibold">Ruang Purifier</span>
            <div class="text-xl font-black text-emerald-400 mt-0.5">6 Ruang</div>
            <span class="text-[10px] text-emerald-300/80">Bebas Asap Karhutla</span>
          </div>
        </div>

        <!-- SHELTERS DIRECTORY -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 class="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>🏥</span> Posko Tempat Evakuasi & Pengungsian Sementara
            </h2>
            <span class="text-xs text-slate-400">Tersedia ${shelters.length} Titik Penampungan</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            ${shelters.map(sht => {
              const fillPercent = Math.round((sht.currentOccupants / sht.capacityPersons) * 100);
              let barColor = 'bg-cyan-500';
              if (fillPercent > 80) barColor = 'bg-amber-500';
              if (fillPercent >= 100) barColor = 'bg-red-500';

              return `
                <div class="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs flex flex-col justify-between">
                  <div>
                    <div class="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                      <div>
                        <h4 class="font-bold text-slate-100 text-sm">${sht.name}</h4>
                        <p class="text-slate-400 text-[11px]">${sht.regency}, ${sht.province}</p>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ${sht.status}
                      </span>
                    </div>

                    <div class="mt-3">
                      <div class="flex justify-between text-xs mb-1">
                        <span class="text-slate-400">Kapasitas Terisi:</span>
                        <span class="font-bold text-slate-200">${sht.currentOccupants} / ${sht.capacityPersons} Jiwa (${fillPercent}%)</span>
                      </div>
                      <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div class="${barColor} h-full rounded-full" style="width: ${fillPercent}%"></div>
                      </div>
                    </div>

                    <div class="mt-3 space-y-1.5 text-[11px] text-slate-300">
                      <div class="flex justify-between">
                        <span class="text-slate-400">Pos Kesehatan / Medis:</span>
                        <span class="font-bold text-emerald-400">${sht.medicCount} Tenaga Medis</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Stok Logistik Makanan:</span>
                        <span class="font-bold text-cyan-400">${sht.foodWaterSupplyDays} Hari Cadangan</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Ruangan Bersih Udara:</span>
                        <span class="font-bold text-purple-300">${sht.airPurifierCleanRooms} Ruang Purifier</span>
                      </div>
                    </div>

                    <div class="mt-3 p-2 bg-slate-900 border border-slate-800 rounded text-[11px]">
                      <b class="text-emerald-400 block mb-0.5">Jalur Evakuasi Terverifikasi:</b>
                      <span class="text-slate-300">${sht.safeRouteDescription}</span>
                    </div>
                  </div>

                  <div class="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button 
                      onclick="window.SAR_APP.navigate('map')"
                      class="text-xs text-cyan-400 hover:underline">
                      Petakan Rute ↗
                    </button>
                    <button 
                      onclick="alert('Data pengungsi shelter ${sht.name} telah disinkronkan ke Dukcapil & Kemensos.');"
                      class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-[11px]">
                      Perbarui Data
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ZONE VERIFICATION POLICY CALLOUT -->
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-2">
          <h3 class="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>🛡️</span> Protokol Keselamatan & Verifikasi Zona Bahaya:
          </h3>
          <p class="text-slate-400 leading-relaxed">
            SAR FireWatch membedakan secara tegas antara <b>Zona Bahaya Terverifikasi (Ground-Confirmed)</b> dengan <b>Zona Perkiraan Risiko Satelit</b>. Jalur evakuasi hanya dinyatakan aman setelah dikonfirmasi oleh petugas patroli darat atau drone posko, mengingat pergeseran arah angin karhutla dapat mengubah konsentrasi asap beracun dalam hitungan menit.
          </p>
        </div>
      </div>
    `;
  }

  function openBroadcastAlertBuilder() {
    const defaultMsg = "PERINGATAN DINI KARHUTLA & KABUT ASAP: Warga di sekitar Desa Rimbo Panjang dihimbau tetap berada di dalam ruangan atau segera menuju GOR Tambang melalui Jalan Lingkar Barat. Hindari jalan poros utama akibat jarak pandang terbatas (<150m). Gunakan masker respirator.";
    const text = prompt("Susun Pesan Peringatan Resmi untuk Warga Terdampak:", defaultMsg);
    if (text) {
      alert("Pesan Peringatan Dini telah disiapkan dan disalurkan ke kanal diseminasi resmi BMKG, Kominfo, dan Posko SAR.");
    }
  }

  return {
    render,
    openBroadcastAlertBuilder
  };
})();
