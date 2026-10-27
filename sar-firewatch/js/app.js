/**
 * SAR FireWatch - Core Application & Navigation Controller
 */

window.SAR_APP = (function () {
  let currentView = 'dashboard';
  let sidebarCollapsed = false;

  const NAV_ITEMS = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', subtitle: 'Ringkasan situasi operasi' },
    { id: 'map', name: 'Live Fire Map', icon: '🗺️', subtitle: 'Peta titik panas & insiden' },
    { id: 'incidents', name: 'Manajemen Insiden', icon: '🚨', subtitle: 'Data kejadian & penanganan' },
    { id: 'personnel', name: 'Personel & Tim SAR', icon: '🧑‍🚒', subtitle: 'Penugasan & kesiapan tim' },
    { id: 'logistics', name: 'Kendaraan & Logistik', icon: '🚁', subtitle: 'Armada & kebutuhan lapangan' },
    { id: 'comms', name: 'Komunikasi Operasi', icon: '📻', subtitle: 'Pesan, siaran & radio log' },
    { id: 'evacuation', name: 'Evakuasi & Keselamatan', icon: '🏥', subtitle: 'Warga, jalur & shelter' },
    { id: 'sitrep', name: 'Laporan & Analitik', icon: '📄', subtitle: 'SITREP & ekspor data' },
    { id: 'datasources', name: 'Sumber Data', icon: '🛰️', subtitle: 'Integrasi, validasi & sensor' },
    { id: 'audit', name: 'Pengaturan & Audit', icon: '⚙️', subtitle: 'Akun, hak akses & aktivitas' },
    { id: 'field', name: 'Mode Lapangan (Mobile)', icon: '📱', subtitle: 'Khusus personel di lapangan' }
  ];

  function init() {
    renderSidebar();
    updateHeaderUser();
    updateHeaderModeBadge();
    startOperationalClocks();

    // Default route
    navigate('dashboard');
  }

  function updateHeaderModeBadge() {
    const isLive = window.SAR_DATA.isLiveMode();
    const btn = document.getElementById('header-mode-badge');
    const text = document.getElementById('header-mode-text');
    if (!btn || !text) return;

    if (isLive) {
      btn.className = 'text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30';
      text.innerText = 'MODE ASLI (LIVE AKTUAL)';
    } else {
      btn.className = 'text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30';
      text.innerText = 'MODE SIMULASI (DEMO)';
    }
  }

  function toggleOperationalMode() {
    const isCurrentlyLive = window.SAR_DATA.isLiveMode();
    const nextMode = isCurrentlyLive ? 'SIMULATION' : 'LIVE';
    
    if (nextMode === 'LIVE') {
      window.SAR_DATA.setOperationalMode('LIVE');
      alert('🟢 MODE OPERASIONAL ASLI (LIVE PRODUKSI) DIAKTIFKAN!\n\nSistem beralih ke saluran data operasional riil: sensor BMKG, satelit NASA FIRMS, dan pelacakan GPS fisik.');
    } else {
      window.SAR_DATA.setOperationalMode('SIMULATION');
      alert('🟡 MODE SIMULASI LATIHAN DIAKTIFKAN.\nData insiden dan pergerakan armada kembali ke skenario latihan.');
    }

    updateHeaderModeBadge();
    navigate(currentView);
  }

  function renderSidebar() {
    const navContainer = document.getElementById('sidebar-nav-list');
    const mobileContainer = document.getElementById('mobile-nav-list');
    if (!navContainer) return;

    const navHtml = NAV_ITEMS.map(item => `
      <li>
        <button 
          onclick="SAR_APP.navigate('${item.id}')"
          id="nav-btn-${item.id}"
          class="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${currentView === item.id ? 'bg-cyan-600/30 text-white border border-cyan-500/50 shadow-md shadow-cyan-600/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}">
          <span class="text-base">${item.icon}</span>
          <div class="flex-1 truncate">
            <div class="font-bold text-slate-200 leading-tight">${item.name}</div>
            <div class="text-[10px] text-slate-500 truncate">${item.subtitle}</div>
          </div>
          ${item.id === 'incidents' ? '<span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">24</span>' : ''}
          ${item.id === 'map' ? '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>' : ''}
        </button>
      </li>
    `).join('');

    navContainer.innerHTML = navHtml;
    if (mobileContainer) mobileContainer.innerHTML = navHtml;
  }

  function navigate(viewId, params = {}) {
    currentView = viewId;
    renderSidebar();

    // Close mobile drawer if open
    const mobileDrawer = document.getElementById('mobile-sidebar');
    if (mobileDrawer) mobileDrawer.classList.add('hidden');

    const viewContainer = document.getElementById('main-content-view');
    if (!viewContainer) return;

    // Reset container scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (viewId) {
      case 'dashboard':
        window.DashboardModule.render('main-content-view');
        break;
      case 'map':
        renderMapView(viewContainer, params);
        break;
      case 'incidents':
        window.IncidentsModule.render('main-content-view', params);
        break;
      case 'personnel':
        window.PersonnelModule.render('main-content-view');
        break;
      case 'logistics':
        window.LogisticsModule.render('main-content-view');
        break;
      case 'comms':
        window.CommsModule.render('main-content-view');
        break;
      case 'evacuation':
        window.EvacuationModule.render('main-content-view');
        break;
      case 'sitrep':
        window.SitrepModule.render('main-content-view', params);
        break;
      case 'datasources':
        window.DataSourcesModule.render('main-content-view');
        break;
      case 'audit':
        window.AuditLogModule.render('main-content-view');
        break;
      case 'field':
        window.FieldModeModule.render('main-content-view');
        break;
      default:
        window.DashboardModule.render('main-content-view');
    }
  }

  function renderMapView(container, params = {}) {
    container.innerHTML = `
      <div class="relative w-full h-[calc(100vh-140px)] min-h-[580px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
        <!-- TOP MAP TOOLBAR -->
        <div class="bg-slate-900/95 backdrop-blur border-b border-slate-800 p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 z-10 text-xs">
          <!-- Google Maps Basemap selector -->
          <div class="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span class="text-cyan-400 font-bold px-1 flex items-center gap-1 text-[11px]">
              <span>🌍</span> GOOGLE MAPS:
            </span>
            <select 
              id="map-basemap-select"
              onchange="TacticalMap.switchBasemap(this.value)"
              class="bg-slate-900 border border-slate-700 text-slate-100 font-semibold rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500">
              <option value="googleHybrid" selected>Google Satelit Hybrid (Live)</option>
              <option value="googleRoadmap">Google Peta Jalan (Roadmap)</option>
              <option value="googleTerrain">Google Terrain (Topografi)</option>
              <option value="googleTraffic">Google Live Traffic (Lalu Lintas)</option>
              <option value="dark">Tactical Dark Navy</option>
              <option value="satellite">ESRI Satelit</option>
              <option value="osm">OpenStreetMap</option>
            </select>
          </div>

          <!-- Region Jump -->
          <div class="flex items-center gap-1.5">
            <span class="text-slate-400 font-medium text-[11px] hidden sm:inline">Wilayah:</span>
            <select 
              onchange="TacticalMap.jumpToRegion(this.value)"
              class="bg-slate-950 border border-slate-700 text-cyan-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none">
              <option value="riau">Riau (Rimbo Panjang)</option>
              <option value="kalteng">Kalteng (Sebangau)</option>
              <option value="sumsel">Sumsel (OKI)</option>
              <option value="kalbar">Kalbar (Kubu Raya)</option>
              <option value="jambi">Jambi (Kumpeh)</option>
              <option value="indonesia">Seluruh Indonesia</option>
            </select>
          </div>

          <!-- Real-Time Stream Controls -->
          <div class="flex items-center gap-1.5">
            <button 
              id="toggle-live-gps-btn"
              onclick="TacticalMap.toggleRealTimeStream()"
              class="px-2.5 py-1.5 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              title="Aktifkan / Jeda Telemetri GPS Real-Time">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Real-Time: AKTIF</span>
            </button>

            <button 
              onclick="TacticalMap.focusUnit('LIVE-HELI-01')"
              class="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 font-semibold transition-all"
              title="Ikuti Helikopter Water Bombing Bell 412">
              <span>🚁</span>
              <span class="hidden md:inline">Lacak Heli</span>
            </button>

            <button 
              id="btn-gps-device"
              onclick="TacticalMap.locateUserDevice()"
              class="bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-blue-500/50 flex items-center gap-1 font-semibold transition-all"
              title="Kunci Posisi Koordinat GPS Fisik Perangkat Anda">
              <span>📍</span>
              <span class="hidden md:inline">GPS Riil Saya</span>
            </button>

            <button 
              onclick="TacticalMap.openCurrentInGoogleMaps()"
              class="bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 font-semibold transition-all"
              title="Buka Koordinat Ini di Aplikasi Google Maps Resmi">
              <span>🌐</span>
              <span class="hidden md:inline">Buka Google Maps™</span>
            </button>
          </div>

          <!-- Tools: Measure & Export -->
          <div class="flex items-center gap-1.5">
            <button 
              id="measure-btn"
              onclick="SAR_APP.toggleMapMeasure()"
              class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 font-semibold">
              <span>📐</span>
              <span class="hidden sm:inline">Ukur</span>
            </button>
            <button 
              onclick="TacticalMap.exportGeoJSON()"
              class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md shadow-cyan-600/30">
              <span>💾</span>
              <span class="hidden sm:inline">Ekspor</span>
            </button>
          </div>
        </div>

        <!-- LIVE TELEMETRY STREAM BAR -->
        <div id="map-live-telemetry-hud" class="bg-slate-950/90 border-b border-slate-800 px-3 py-1.5 text-xs text-slate-300 flex items-center justify-between overflow-x-auto whitespace-nowrap">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="font-bold text-slate-100">LIVE GPS STREAM:</span>
            <span class="text-cyan-300 font-mono font-bold">WB-BELL-412 (TNI-AU/BNPB)</span>
            <span class="text-slate-400">|</span>
            <span class="text-slate-300">KEC: <b class="text-cyan-400 font-mono">165 KM/J</b></span>
            <span class="text-slate-400">|</span>
            <span class="text-slate-300">ALT: <b class="text-amber-400 font-mono">420 M</b></span>
            <span class="text-slate-400">|</span>
            <span class="text-emerald-400 font-semibold">Pengeboman Air Sortie #15 di Rimbo Panjang</span>
          </div>
        </div>

        <!-- MAP CONTAINER -->
        <div class="relative flex-1 w-full h-full bg-[#060c18]">
          <div id="tactical-map-element" class="w-full h-full z-0"></div>

          <!-- FLOATING LAYER TOGGLES DRAWER (LEFT OVERLAY) -->
          <div class="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl text-xs space-y-2 max-w-xs">
            <div class="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span class="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Lapisan Operasi (Layers)</span>
              <span class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">LIVE GOOGLE GIS</span>
            </div>

            <div class="space-y-1.5 text-slate-300">
              <label class="flex items-center justify-between cursor-pointer hover:text-white">
                <span class="flex items-center gap-1.5"><span>🚁</span> Armada Bergerak Real-Time</span>
                <input type="checkbox" checked onchange="TacticalMap.toggleLayer('fleetLive', this.checked)" class="accent-cyan-500">
              </label>

              <label class="flex items-center justify-between cursor-pointer hover:text-white">
                <span class="flex items-center gap-1.5"><span>🔥</span> Hotspot Satelit (FIRMS)</span>
                <input type="checkbox" checked onchange="TacticalMap.toggleLayer('hotspots', this.checked)" class="accent-amber-500">
              </label>

              <label class="flex items-center justify-between cursor-pointer hover:text-white">
                <span class="flex items-center gap-1.5"><span>🚨</span> Insiden Karhutla Terverifikasi</span>
                <input type="checkbox" checked onchange="TacticalMap.toggleLayer('incidents', this.checked)" class="accent-red-500">
              </label>

              <label class="flex items-center justify-between cursor-pointer hover:text-white">
                <span class="flex items-center gap-1.5"><span>⭕</span> Batas Kebakaran & Zona Dampak</span>
                <input type="checkbox" checked onchange="TacticalMap.toggleLayer('burnPerimeters', this.checked)" class="accent-amber-500">
              </label>

              <label class="flex items-center justify-between cursor-pointer hover:text-white">
                <span class="flex items-center gap-1.5"><span>🏕️</span> Posko Utama & Posko Aju</span>
                <input type="checkbox" checked onchange="TacticalMap.toggleLayer('commandPosts', this.checked)" class="accent-cyan-500">
              </label>

              <label class="flex items-center justify-between cursor-pointer hover:text-white">
                <span class="flex items-center gap-1.5"><span>🚒</span> Posisi Tim SAR Lapangan</span>
                <input type="checkbox" checked onchange="TacticalMap.toggleLayer('teams', this.checked)" class="accent-emerald-500">
              </label>

              <label class="flex items-center justify-between cursor-pointer hover:text-white">
                <span class="flex items-center gap-1.5"><span>🏥</span> Shelter & Titik Pengungsian</span>
                <input type="checkbox" checked onchange="TacticalMap.toggleLayer('settlements', this.checked)" class="accent-emerald-500">
              </label>

              <label class="flex items-center justify-between cursor-pointer hover:text-white">
                <span class="flex items-center gap-1.5"><span>💨</span> Vektor Arah Angin (BMKG)</span>
                <input type="checkbox" checked onchange="TacticalMap.toggleLayer('windOverlay', this.checked)" class="accent-cyan-500">
              </label>
            </div>
          </div>

          <!-- FLOATING BOTTOM STATUS READOUT -->
          <div class="absolute bottom-4 left-4 z-[400] flex flex-wrap items-center gap-2 text-xs pointer-events-none">
            <div id="map-cursor-coords" class="bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-cyan-400 font-bold pointer-events-auto">
              LAT: 0.44180° | LNG: 101.32840°
            </div>
            <div id="measure-tool-indicator" style="display: none;" class="bg-pink-950/90 border border-pink-500 px-3 py-1.5 rounded-lg text-pink-300 pointer-events-auto">
              📏 MODE UKUR JARAK AKTIF: <span id="map-measure-result" class="ml-1 font-semibold">Klik 2 titik di peta untuk estimasi jarak dan waktu tempuh.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      TacticalMap.init('tactical-map-element', (type, id) => {
        if (type === 'incident') {
          showIncidentDetail(id);
        }
      });

      if (params.focusIncident) {
        const inc = window.SAR_DATA.getIncidentById(params.focusIncident);
        if (inc) {
          // If needed, jump close to incident
          if (inc.province.includes('Riau')) TacticalMap.jumpToRegion('riau');
          if (inc.province.includes('Kalimantan Tengah')) TacticalMap.jumpToRegion('kalteng');
        }
      }
    }, 150);
  }

  function toggleMapMeasure() {
    const isMeasuring = TacticalMap.toggleMeasurement();
    const btn = document.getElementById('measure-btn');
    if (btn) {
      if (isMeasuring) {
        btn.classList.add('bg-pink-600', 'text-white', 'border-pink-500');
        btn.classList.remove('bg-slate-800', 'text-slate-200');
      } else {
        btn.classList.remove('bg-pink-600', 'text-white', 'border-pink-500');
        btn.classList.add('bg-slate-800', 'text-slate-200');
      }
    }
  }

  function showIncidentDetail(id) {
    navigate('incidents', { focusIncident: id });
  }

  function updateHeaderUser() {
    const user = window.SAR_DATA.getCurrentUser();
    const nameEl = document.getElementById('header-user-name');
    const badgeEl = document.getElementById('header-user-badge');
    const avatarEl = document.getElementById('header-user-avatar');

    if (nameEl) nameEl.innerText = user.name;
    if (badgeEl) badgeEl.innerText = user.role.badge;
    if (avatarEl) avatarEl.innerText = user.avatar;
  }

  function startOperationalClocks() {
    function updateTime() {
      const now = new Date();
      const wibEl = document.getElementById('clock-wib');
      const utcEl = document.getElementById('clock-utc');

      if (wibEl) {
        wibEl.innerText = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      }
      if (utcEl) {
        utcEl.innerText = now.toISOString().substring(11, 19) + ' UTC';
      }
    }
    setInterval(updateTime, 1000);
    updateTime();
  }

  function toggleMobileSidebar() {
    const mobileDrawer = document.getElementById('mobile-sidebar');
    if (mobileDrawer) {
      mobileDrawer.classList.toggle('hidden');
    }
  }

  return {
    init,
    navigate,
    showIncidentDetail,
    updateHeaderUser,
    toggleOperationalMode,
    toggleMapMeasure,
    toggleMobileSidebar
  };
})();

// Auto-run when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.SAR_APP.init();
});
