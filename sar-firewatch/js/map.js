/**
 * SAR FireWatch - Tactical Map Engine dengan Integrasi Google Maps Real-Time
 * Mendukung Google Satellite Hybrid, Google Roadmap, Google Terrain, Google Live Traffic,
 * serta Live Telemetri GPS bergerak secara real-time untuk helikopter & armada darat.
 */

window.TacticalMap = (function () {
  let leafletMap = null;
  let activeLayers = {
    hotspots: true,
    incidents: true,
    burnPerimeters: true,
    commandPosts: true,
    teams: true,
    fleetLive: true,
    settlements: true,
    evacuationRoutes: true,
    windOverlay: true
  };

  let activeBasemap = 'googleHybrid'; // Default: Google Maps Satelit Hybrid
  let tileLayers = {};
  let markerGroup = null;
  let fleetMarkerGroup = null;
  let measureMode = false;
  let measurePoints = [];
  let measureLine = null;
  let onMarkerSelectCallback = null;

  // Real-time GPS Streaming State
  let realTimeStreamActive = true;
  let realTimeTimer = null;
  let liveTick = 0;

  // Koordinat preset wilayah fokus Karhutla
  const REGION_PRESETS = {
    riau: { center: [0.4418, 101.3284], zoom: 12, name: 'Provinsi Riau (Rimbo Panjang, Kampar)' },
    kalteng: { center: [-2.3921, 114.1534], zoom: 12, name: 'Kalimantan Tengah (Kubah Gambut Sebangau)' },
    sumsel: { center: [-3.2845, 105.1204], zoom: 11, name: 'Sumatera Selatan (OKI Tulung Selapan)' },
    kalbar: { center: [-0.1982, 109.3812], zoom: 12, name: 'Kalimantan Barat (Kubu Raya / Bandara Supadio)' },
    jambi: { center: [-1.4872, 104.0152], zoom: 11, name: 'Jambi (Kumpeh Ilir)' },
    indonesia: { center: [-0.7893, 113.9213], zoom: 5, name: 'Nasional (Seluruh Indonesia)' }
  };

  // Real-time moving units state
  let liveMobileUnits = [
    {
      id: 'LIVE-HELI-01',
      code: 'WB-BELL-412',
      name: 'Heli Water Bombing Bell 412 (TNI-AU/BNPB)',
      type: 'Helikopter',
      icon: '🚁',
      baseLat: 0.4418,
      baseLng: 101.3284,
      lat: 0.4418,
      lng: 101.3284,
      altitudeM: 420,
      speedKmh: 165,
      heading: 45,
      status: 'Pengeboman Air (Water Drop Sortie #15)',
      bucketCapacityL: 1200,
      currentPayloadL: 1200,
      pathPhase: 0
    },
    {
      id: 'LIVE-HELI-02',
      code: 'WB-KAMOV-32',
      name: 'Heli Heavy Lift Kamov Ka-32 (BNPB)',
      type: 'Helikopter Berat',
      icon: '🚁',
      baseLat: -2.3921,
      baseLng: 114.1534,
      lat: -2.3921,
      lng: 114.1534,
      altitudeM: 380,
      speedKmh: 125,
      heading: 180,
      status: 'Mengitari Kubah Gambut Sebangau',
      bucketCapacityL: 5000,
      currentPayloadL: 5000,
      pathPhase: 0
    },
    {
      id: 'LIVE-CARRIER-01',
      code: 'RC-ARGO-8X8',
      name: 'Amphibious Rescue Carrier ARGO 8x8',
      type: 'Armada Darat Gambut',
      icon: '🚜',
      baseLat: 0.4390,
      baseLng: 101.3240,
      lat: 0.4390,
      lng: 101.3240,
      altitudeM: 18,
      speedKmh: 28,
      heading: 90,
      status: 'Patroli Penyekatan Parit Kanal Barat',
      pathPhase: 0
    },
    {
      id: 'LIVE-DRONE-01',
      code: 'UAV-FLIR-01',
      name: 'Drone Thermal FLIR Matrice 300 RTK',
      type: 'Drone Pemantau Udara',
      icon: '🛰️',
      baseLat: 0.4440,
      baseLng: 101.3320,
      lat: 0.4440,
      lng: 101.3320,
      altitudeM: 150,
      speedKmh: 45,
      heading: 270,
      status: 'Pemindaian Citra Panas 520°C Permukaan',
      pathPhase: 0
    }
  ];

  /**
   * Inisialisasi Peta
   */
  function init(containerId, onSelectCallback) {
    onMarkerSelectCallback = onSelectCallback;
    const container = document.getElementById(containerId);
    if (!container) return;

    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
    }

    if (typeof L !== 'undefined') {
      try {
        initLeafletMap(containerId);
        startRealTimeLoop();
        return;
      } catch (err) {
        console.warn('Leaflet error, beralih ke Tactical Vector Radar:', err);
      }
    }

    initCanvasVectorMap(containerId);
  }

  /**
   * Inisialisasi menggunakan Leaflet Engine & Google Maps Tiles
   */
  function initLeafletMap(containerId) {
    leafletMap = L.map(containerId, {
      center: REGION_PRESETS.riau.center,
      zoom: 12,
      zoomControl: false,
      attributionControl: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

    // ==========================================
    // DEFINISI BASEMAPS (GOOGLE MAPS REAL-TIME)
    // ==========================================
    
    // 1. Google Maps Satelit Hybrid (Citra Satelit Resolusi Tinggi + Jalan & Label)
    tileLayers.googleHybrid = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3'],
      attribution: '© Google Maps (Citra Satelit Real-Time)'
    });

    // 2. Google Maps Roadmap (Peta Jalan & Fasilitas Lengkap)
    tileLayers.googleRoadmap = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3'],
      attribution: '© Google Maps'
    });

    // 3. Google Maps Terrain (Topografi & Kontur Ketinggian Gambut)
    tileLayers.googleTerrain = L.tileLayer('https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '© Google Maps Terrain'
    });

    // 4. Google Maps Real-Time Traffic (Arus Lalu Lintas Jalur Evakuasi)
    tileLayers.googleTraffic = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '© Google Maps Traffic'
    });

    // 5. Tactical Dark Navy (CartoDB Dark Matter)
    tileLayers.dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '© CartoDB Dark Matter'
    });

    // 6. ESRI World Imagery
    tileLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: '© Esri World Imagery'
    });

    // 7. OpenStreetMap
    tileLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });

    // Aktifkan Google Maps Hybrid secara default
    if (tileLayers[activeBasemap]) {
      tileLayers[activeBasemap].addTo(leafletMap);
    } else {
      tileLayers.googleHybrid.addTo(leafletMap);
      activeBasemap = 'googleHybrid';
    }

    markerGroup = L.layerGroup().addTo(leafletMap);
    fleetMarkerGroup = L.layerGroup().addTo(leafletMap);

    // Track mouse coordinates
    leafletMap.on('mousemove', function (e) {
      const coordEl = document.getElementById('map-cursor-coords');
      if (coordEl) {
        coordEl.innerText = `LAT: ${e.latlng.lat.toFixed(5)}° | LNG: ${e.latlng.lng.toFixed(5)}°`;
      }
    });

    // Handle Measurement click
    leafletMap.on('click', function (e) {
      if (measureMode) {
        handleMeasureClick(e.latlng);
      }
    });

    renderAllLayers();
  }

  /**
   * Render semua layer taktis
   */
  function renderAllLayers() {
    if (!leafletMap || !markerGroup) return;
    markerGroup.clearLayers();

    const incidents = window.SAR_DATA.getIncidents();
    const hotspots = window.SAR_DATA.getHotspots();
    const commandPosts = window.SAR_DATA.getCommandPosts();
    const teams = window.SAR_DATA.getTeams();
    const shelters = window.SAR_DATA.getShelters();

    // 1. Batas Kebakaran & Zona Dampak
    if (activeLayers.burnPerimeters) {
      incidents.forEach(inc => {
        const radiusMeters = Math.sqrt((inc.estimatedAreaHa * 10000) / Math.PI) * 1.5;
        L.circle([inc.lat, inc.lng], {
          radius: radiusMeters,
          color: inc.priority === 'Kritis' ? '#ef4444' : '#f97316',
          weight: 2,
          fillColor: inc.priority === 'Kritis' ? '#ef4444' : '#f97316',
          fillOpacity: 0.35,
          dashArray: '4, 6'
        }).bindTooltip(`<b>Perkiraan Terbakar:</b> ${inc.estimatedAreaHa} Ha`, { permanent: false }).addTo(markerGroup);

        const threatRadiusM = (inc.distanceToSettlementKm * 1000) + 500;
        L.circle([inc.lat, inc.lng], {
          radius: threatRadiusM,
          color: '#f59e0b',
          weight: 1.5,
          fillColor: '#f59e0b',
          fillOpacity: 0.09,
          dashArray: '3, 5'
        }).addTo(markerGroup);
      });
    }

    // 2. Hotspots Satelit
    if (activeLayers.hotspots) {
      hotspots.forEach(hs => {
        const pulseClass = hs.frp > 40 ? 'animate-ping' : '';
        const hotspotIcon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `<div class="hotspot-pulse ${hs.frp > 50 ? 'hotspot-high' : 'hotspot-med'}">
                   <span class="pulse-ring ${pulseClass}"></span>
                   <span class="hotspot-dot">🔥</span>
                 </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const m = L.marker([hs.lat, hs.lng], { icon: hotspotIcon }).addTo(markerGroup);
        m.bindPopup(`
          <div class="tactical-popup">
            <div class="popup-header bg-amber-950 text-amber-200">
              <span class="font-bold">🔥 HOTSPOT SATELIT (REAL-TIME)</span>
              <span class="badge text-xs bg-amber-500/30 font-mono">${hs.sat}</span>
            </div>
            <div class="p-2 space-y-1 text-xs">
              <p><b>ID:</b> ${hs.id}</p>
              <p><b>Radiative Power (FRP):</b> <span class="text-amber-400 font-bold">${hs.frp} MW</span></p>
              <p><b>Keyakinan Satelit:</b> ${hs.conf}</p>
              <p><b>Suhu Kecerahan:</b> ${hs.tempK} K</p>
              <p><b>Waktu Deteksi:</b> ${hs.time}</p>
              <p><b>Wilayah:</b> ${hs.kab}, ${hs.prov}</p>
              <div class="mt-2 pt-2 border-t border-slate-700 flex justify-between items-center">
                <a href="https://www.google.com/maps?q=${hs.lat},${hs.lng}" target="_blank" class="text-cyan-400 hover:underline font-bold text-[11px]">
                  Buka Google Maps™ ↗
                </a>
              </div>
            </div>
          </div>
        `);
      });
    }

    // 3. Insiden Terverifikasi
    if (activeLayers.incidents) {
      incidents.forEach(inc => {
        let badgeColor = '#ef4444';
        if (inc.priority === 'Tinggi') badgeColor = '#f97316';
        if (inc.priority === 'Sedang') badgeColor = '#06b6d4';
        if (inc.priority === 'Rendah') badgeColor = '#10b981';

        const incidentIcon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `<div class="incident-marker" style="border-color: ${badgeColor}; box-shadow: 0 0 16px ${badgeColor}">
                   <span class="marker-priority" style="background: ${badgeColor}">${inc.priority.substring(0, 1)}</span>
                   <span class="marker-icon">🚨</span>
                 </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const m = L.marker([inc.lat, inc.lng], { icon: incidentIcon }).addTo(markerGroup);
        m.on('click', () => {
          if (onMarkerSelectCallback) onMarkerSelectCallback('incident', inc.id);
        });

        m.bindTooltip(`<b>${inc.id}</b>: ${inc.title} (${inc.status})`, {
          direction: 'top',
          offset: [0, -18],
          className: 'tactical-tooltip'
        });
      });
    }

    // 4. Posko SAR
    if (activeLayers.commandPosts) {
      commandPosts.forEach(cp => {
        const cpIcon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `<div class="command-post-marker">
                   <span>🏕️</span>
                   <span class="post-label">${cp.id}</span>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const m = L.marker([cp.lat, cp.lng], { icon: cpIcon }).addTo(markerGroup);
        m.bindPopup(`
          <div class="tactical-popup">
            <div class="popup-header bg-cyan-950 text-cyan-200">
              <span class="font-bold">🏕️ ${cp.name}</span>
            </div>
            <div class="p-2 space-y-1 text-xs">
              <p><b>Jenis:</b> ${cp.type}</p>
              <p><b>Komandan:</b> ${cp.commander}</p>
              <p><b>Personel Siaga:</b> ${cp.personnelStandby} Anggota</p>
              <p><b>Armada:</b> ${cp.vehiclesAvailable} Unit</p>
              <p><b>Stok Air & Busa:</b> ${cp.foamStockL} L Foam</p>
              <p><b>Frekuensi Radio:</b> ${cp.phone}</p>
              <div class="mt-2 pt-1 border-t border-slate-700">
                <a href="https://www.google.com/maps?q=${cp.lat},${cp.lng}" target="_blank" class="text-cyan-400 hover:underline font-bold">
                  Buka Titik di Google Maps™ ↗
                </a>
              </div>
            </div>
          </div>
        `);
      });
    }

    // 5. Tim SAR
    if (activeLayers.teams) {
      teams.forEach(tm => {
        let statusBadge = tm.status === 'Bertugas' ? 'bg-amber-500' : 'bg-emerald-500';
        if (tm.status === 'Butuh Bantuan') statusBadge = 'bg-red-600 animate-bounce';

        const teamIcon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `<div class="team-gps-marker">
                   <div class="gps-dot ${statusBadge}"></div>
                   <span class="unit-symbol">🚒</span>
                   <span class="unit-tag">${tm.id}</span>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const m = L.marker([tm.lat, tm.lng], { icon: teamIcon }).addTo(markerGroup);
        m.bindPopup(`
          <div class="tactical-popup">
            <div class="popup-header bg-slate-800 text-slate-100 flex justify-between">
              <span class="font-bold">🚒 ${tm.name}</span>
              <span class="badge ${statusBadge} text-white">${tm.status}</span>
            </div>
            <div class="p-2 space-y-1 text-xs">
              <p><b>Danregu:</b> ${tm.leader} (${tm.strength} Personel)</p>
              <p><b>Spesialisasi:</b> ${tm.speciality}</p>
              <p><b>Baterai GPS:</b> ${tm.batteryGps}% | Air: ${tm.waterSupplyPercent}%</p>
              <p><b>Update:</b> ${tm.lastCheckin}</p>
            </div>
          </div>
        `);
      });
    }

    // 6. Tempat Pengungsian
    if (activeLayers.settlements) {
      shelters.forEach(sht => {
        const shelterIcon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `<div class="shelter-marker"><span>🏥</span></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const m = L.marker([sht.lat, sht.lng], { icon: shelterIcon }).addTo(markerGroup);
        m.bindPopup(`
          <div class="tactical-popup">
            <div class="popup-header bg-emerald-950 text-emerald-300">
              <span class="font-bold">🏥 ${sht.name}</span>
            </div>
            <div class="p-2 space-y-1 text-xs">
              <p><b>Pengungsi:</b> ${sht.currentOccupants} / ${sht.capacityPersons} Jiwa</p>
              <p><b>Kelompok Rentan:</b> ${sht.vulnerableStats.infants} Balita, ${sht.vulnerableStats.elderly} Lansia</p>
              <p class="text-emerald-400"><b>Rute Aman:</b> ${sht.safeRouteDescription}</p>
            </div>
          </div>
        `);
      });
    }

    // 7. Arah Angin
    if (activeLayers.windOverlay) {
      incidents.forEach(inc => {
        const rad = (inc.windDegree * Math.PI) / 180;
        const arrowDist = 0.04;
        const targetLat = inc.lat + Math.cos(rad) * arrowDist;
        const targetLng = inc.lng + Math.sin(rad) * arrowDist;

        L.polyline([[inc.lat, inc.lng], [targetLat, targetLng]], {
          color: '#38bdf8',
          weight: 2,
          dashArray: '3, 6',
          opacity: 0.8
        }).bindTooltip(`💨 Angin: ${inc.windSpeedKmh} km/j (${inc.windDirection})`, { sticky: true }).addTo(markerGroup);
      });
    }

    renderRealTimeFleet();
  }

  /**
   * Render Armada Bergerak Real-Time (Helikopter Water Bombing & Truk Amfibi)
   */
  function renderRealTimeFleet() {
    if (!leafletMap || !fleetMarkerGroup) return;
    fleetMarkerGroup.clearLayers();

    if (!activeLayers.fleetLive) return;

    liveMobileUnits.forEach(u => {
      const isHeli = u.type.includes('Heli');
      const unitIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <!-- Pulsing Radar Halo -->
            <span class="absolute w-12 h-12 rounded-full ${isHeli ? 'bg-cyan-500/20 animate-ping' : 'bg-emerald-500/20 animate-pulse'}"></span>
            <div class="relative w-9 h-9 rounded-full ${isHeli ? 'bg-cyan-900 border-2 border-cyan-400 text-cyan-200' : 'bg-emerald-900 border-2 border-emerald-400 text-emerald-200'} flex items-center justify-center font-bold text-base shadow-lg shadow-cyan-500/40">
              ${u.icon}
            </div>
            <!-- Live Altitude/Speed Callout Tag -->
            <div class="absolute -bottom-5 whitespace-nowrap bg-slate-950/90 border border-slate-700 px-1.5 py-0.2 rounded text-[9px] font-mono text-cyan-300 font-bold">
              ${u.code} · ${u.speedKmh} km/j
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const m = L.marker([u.lat, u.lng], { icon: unitIcon }).addTo(fleetMarkerGroup);
      m.bindPopup(`
        <div class="tactical-popup">
          <div class="popup-header bg-gradient-to-r from-cyan-950 to-slate-900 text-cyan-200">
            <span class="font-bold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ${u.icon} ${u.code} (LIVE GPS)
            </span>
            <span class="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold">STREAM AKTIF</span>
          </div>
          <div class="p-3 space-y-1.5 text-xs">
            <div class="font-bold text-slate-100">${u.name}</div>
            <div class="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded border border-slate-800 text-[11px] font-mono">
              <div>
                <span class="text-slate-500 block">KECEPATAN</span>
                <span class="text-cyan-400 font-bold text-sm">${u.speedKmh} KM/J</span>
              </div>
              <div>
                <span class="text-slate-500 block">KETINGGIAN</span>
                <span class="text-amber-400 font-bold text-sm">${u.altitudeM} M (AGL)</span>
              </div>
            </div>
            <p><b>Status Misi:</b> <span class="text-emerald-400 font-semibold">${u.status}</span></p>
            ${u.currentPayloadL ? `<p><b>Beban Air:</b> ${u.currentPayloadL.toLocaleString()} / ${u.bucketCapacityL.toLocaleString()} Liter</p>` : ''}
            <p class="text-slate-400 text-[10px] font-mono">KOORDINAT: ${u.lat.toFixed(5)}, ${u.lng.toFixed(5)}</p>
            <div class="pt-2 border-t border-slate-800 flex justify-between">
              <button onclick="TacticalMap.focusUnit('${u.id}')" class="text-cyan-400 hover:underline font-bold text-[11px]">
                🎯 Pusatkan Kamera
              </button>
              <a href="https://www.google.com/maps?q=${u.lat},${u.lng}" target="_blank" class="text-slate-300 hover:text-white text-[11px]">
                Google Maps™ ↗
              </a>
            </div>
          </div>
        </div>
      `);
    });
  }

  /**
   * Loop Simulasi Real-Time (GPS Telemetri Dinamis Tiap 2.5 Detik)
   */
  function startRealTimeLoop() {
    if (realTimeTimer) clearInterval(realTimeTimer);

    realTimeTimer = setInterval(() => {
      if (!realTimeStreamActive) return;

      liveTick += 0.15;

      // 1. Gerakkan Heli Bell 412 (Sortie Water Bombing di Riau)
      const heli1 = liveMobileUnits.find(u => u.id === 'LIVE-HELI-01');
      if (heli1) {
        const orbitX = Math.sin(liveTick) * 0.018;
        const orbitY = Math.cos(liveTick) * 0.014;
        heli1.lat = heli1.baseLat + orbitX;
        heli1.lng = heli1.baseLng + orbitY;
        heli1.altitudeM = Math.round(380 + Math.sin(liveTick * 2) * 50);
        heli1.speedKmh = Math.round(155 + Math.cos(liveTick * 1.5) * 20);

        if (Math.sin(liveTick) > 0.7) {
          heli1.status = '💦 Menjatuhkan 1.200L Air di Titik Api Gambut Utara';
        } else if (Math.sin(liveTick) < -0.7) {
          heli1.status = '🌊 Mengambil Air (Water Scoop) di Kanal Primer';
        } else {
          heli1.status = 'Penerbangan Sortie Water Bombing Menuju Sasaran';
        }
      }

      // 2. Gerakkan Kamov Ka-32 (Mengitari Kubah Gambut Sebangau)
      const heli2 = liveMobileUnits.find(u => u.id === 'LIVE-HELI-02');
      if (heli2) {
        const radKalteng = liveTick * 0.7;
        heli2.lat = heli2.baseLat + Math.sin(radKalteng) * 0.022;
        heli2.lng = heli2.baseLng + Math.cos(radKalteng) * 0.022;
        heli2.altitudeM = Math.round(350 + Math.cos(liveTick) * 30);
      }

      // 3. Gerakkan Drone FLIR
      const drone = liveMobileUnits.find(u => u.id === 'LIVE-DRONE-01');
      if (drone) {
        drone.lat = drone.baseLat + Math.sin(liveTick * 0.5) * 0.008;
        drone.lng = drone.baseLng + Math.cos(liveTick * 0.5) * 0.008;
      }

      // Re-render unit bergerak pada layer peta
      renderRealTimeFleet();

      // Perbarui Live HUD Telemetri pada antarmuka
      updateLiveTelemetryHUD();
    }, 2500);
  }

  function updateLiveTelemetryHUD() {
    const hudEl = document.getElementById('map-live-telemetry-hud');
    if (!hudEl) return;

    const heli1 = liveMobileUnits[0];
    hudEl.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full ${realTimeStreamActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}"></span>
        <span class="font-bold text-slate-100">LIVE GPS STREAM:</span>
        <span class="text-cyan-300 font-mono font-bold">${heli1.code}</span>
        <span class="text-slate-400">|</span>
        <span class="text-slate-300">KEC: <b class="text-cyan-400 font-mono">${heli1.speedKmh} KM/J</b></span>
        <span class="text-slate-400">|</span>
        <span class="text-slate-300">ALT: <b class="text-amber-400 font-mono">${heli1.altitudeM} M</b></span>
        <span class="text-slate-400">|</span>
        <span class="text-emerald-400 font-semibold truncate max-w-[280px]">${heli1.status}</span>
      </div>
    `;
  }

  /**
   * Beralih Basemap (Termasuk Google Maps Varian)
   */
  function switchBasemap(type) {
    if (!leafletMap || !tileLayers[type]) return;
    Object.values(tileLayers).forEach(layer => {
      if (leafletMap.hasLayer(layer)) leafletMap.removeLayer(layer);
    });
    tileLayers[type].addTo(leafletMap);
    activeBasemap = type;

    // Perbarui label aktif pada UI
    const labelEl = document.getElementById('active-basemap-label');
    if (labelEl) {
      const names = {
        googleHybrid: 'Google Satelit Hybrid (Live)',
        googleRoadmap: 'Google Maps Roadmap',
        googleTerrain: 'Google Maps Terrain',
        googleTraffic: 'Google Live Traffic',
        dark: 'Tactical Dark Navy',
        satellite: 'ESRI Satelit',
        osm: 'OpenStreetMap'
      };
      labelEl.innerText = names[type] || type;
    }
  }

  /**
   * Lompat ke Region
   */
  function jumpToRegion(regionKey) {
    const target = REGION_PRESETS[regionKey];
    if (target && leafletMap) {
      leafletMap.flyTo(target.center, target.zoom, { duration: 1.2 });
    }
  }

  /**
   * Fokus Kamera ke Unit Bergerak
   */
  function focusUnit(unitId) {
    const unit = liveMobileUnits.find(u => u.id === unitId) || liveMobileUnits[0];
    if (unit && leafletMap) {
      leafletMap.flyTo([unit.lat, unit.lng], 14, { duration: 1.0 });
    }
  }

  /**
   * Buka Koordinat Pusat Peta Langsung di Google Maps Resmi
   */
  function openCurrentInGoogleMaps() {
    if (!leafletMap) return;
    const center = leafletMap.getCenter();
    const zoom = leafletMap.getZoom();
    const url = `https://www.google.com/maps/@${center.lat},${center.lng},${zoom}z/data=!3m1!1e3`;
    window.open(url, '_blank');
  }

  /**
   * Toggle Real-Time Stream
   */
  function toggleRealTimeStream() {
    realTimeStreamActive = !realTimeStreamActive;
    const btn = document.getElementById('toggle-live-gps-btn');
    if (btn) {
      if (realTimeStreamActive) {
        btn.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span>Real-Time: AKTIF</span>`;
        btn.className = `px-2.5 py-1 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 text-xs font-bold flex items-center gap-1.5 transition-all`;
      } else {
        btn.innerHTML = `<span>⏸️</span><span>Real-Time: JEDA</span>`;
        btn.className = `px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all`;
      }
    }
    updateLiveTelemetryHUD();
    return realTimeStreamActive;
  }

  /**
   * Pengukuran Jarak
   */
  function toggleMeasurement(enable) {
    measureMode = enable !== undefined ? enable : !measureMode;
    measurePoints = [];
    if (measureLine && leafletMap) {
      leafletMap.removeLayer(measureLine);
      measureLine = null;
    }
    const indicator = document.getElementById('measure-tool-indicator');
    if (indicator) {
      indicator.style.display = measureMode ? 'inline-flex' : 'none';
    }
    return measureMode;
  }

  function handleMeasureClick(latlng) {
    measurePoints.push(latlng);
    if (measurePoints.length === 1) {
      const coordEl = document.getElementById('map-measure-result');
      if (coordEl) coordEl.innerText = `Titik 1 dipilih. Klik titik 2 di peta...`;
    } else if (measurePoints.length >= 2) {
      const p1 = measurePoints[0];
      const p2 = measurePoints[1];
      const distMeters = p1.distanceTo(p2);
      const distKm = (distMeters / 1000).toFixed(2);
      
      const heliMinutes = Math.round((distKm / 180) * 60);
      const groundMinutes = Math.round((distKm / 35) * 60);

      if (measureLine) leafletMap.removeLayer(measureLine);
      measureLine = L.polyline([p1, p2], { color: '#ec4899', weight: 3, dashArray: '6, 6' }).addTo(leafletMap);
      
      const coordEl = document.getElementById('map-measure-result');
      if (coordEl) {
        coordEl.innerHTML = `Jarak: <b>${distKm} km</b> | Heli Bell 412: <b>~${heliMinutes} mnt</b> | Darat Off-Road: <b>~${groundMinutes} mnt</b>`;
      }
      measurePoints = [];
    }
  }

  /**
   * Toggle Lapisan Peta
   */
  function toggleLayer(layerName, isChecked) {
    if (activeLayers.hasOwnProperty(layerName)) {
      activeLayers[layerName] = isChecked;
      renderAllLayers();
    }
  }

  /**
   * Fallback: Tactical Canvas Vector Map untuk offline
   */
  function initCanvasVectorMap(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="relative w-full h-full bg-[#070e1b] flex flex-col items-center justify-center overflow-hidden select-none">
        <canvas id="tactical-canvas-map" class="w-full h-full cursor-crosshair"></canvas>
        <div class="absolute top-4 left-4 bg-slate-900/90 border border-cyan-500/30 rounded-lg p-3 text-xs backdrop-blur text-slate-300 pointer-events-none">
          <div class="flex items-center gap-2 text-cyan-400 font-bold mb-1">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            RADAR TAKTIS TERTANAM (TACTICAL VECTOR RADAR)
          </div>
          <p>Pemantauan Terpadu Karhutla (Mode Offline)</p>
        </div>
      </div>
    `;

    const canvas = document.getElementById('tactical-canvas-map');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 100);
  }

  /**
   * Ekspor data koordinat GeoJSON
   */
  function exportGeoJSON() {
    const incidents = window.SAR_DATA.getIncidents();
    const hotspots = window.SAR_DATA.getHotspots();
    const geojson = {
      type: 'FeatureCollection',
      metadata: {
        system: 'SAR FireWatch - BASARNAS Karhutla Operations (Google Maps GIS Engine)',
        exportedAt: new Date().toISOString(),
        disclaimer: 'DATA SIMULASI RESMI'
      },
      features: [
        ...incidents.map(inc => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [inc.lng, inc.lat] },
          properties: {
            id: inc.id,
            title: inc.title,
            priority: inc.priority,
            status: inc.status,
            areaHa: inc.estimatedAreaHa,
            settlementDistKm: inc.distanceToSettlementKm
          }
        })),
        ...hotspots.map(hs => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [hs.lng, hs.lat] },
          properties: {
            id: hs.id,
            frp: hs.frp,
            satellite: hs.sat,
            confidence: hs.conf
          }
        })),
        ...liveMobileUnits.map(u => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [u.lng, u.lat] },
          properties: {
            id: u.id,
            name: u.name,
            speedKmh: u.speedKmh,
            altitudeM: u.altitudeM,
            status: u.status
          }
        }))
      ]
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAR-FireWatch-GoogleMaps-Coordinates-${new Date().toISOString().substring(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Mengunci Posisi GPS Fisik Perangkat Anda (Real-Time HTML5 Geolocation)
   */
  function locateUserDevice() {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung Geolocation API.');
      return;
    }
    const btn = document.getElementById('btn-gps-device');
    if (btn) btn.innerHTML = '<span>⏳</span><span>Mencari GPS...</span>';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;
        window.SAR_DATA.setUserDeviceLocation(lat, lng, accuracy);

        if (btn) {
          btn.innerHTML = '<span>📍</span><span>GPS Anda Terkunci</span>';
          btn.classList.add('bg-blue-600', 'text-white');
        }

        if (leafletMap) {
          leafletMap.flyTo([lat, lng], 14, { duration: 1.2 });

          const deviceIcon = L.divIcon({
            className: 'custom-leaflet-icon',
            html: `
              <div class="relative flex items-center justify-center">
                <span class="absolute w-12 h-12 rounded-full bg-blue-500/30 animate-ping"></span>
                <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center text-sm shadow-xl font-bold">
                  📍
                </div>
                <div class="absolute -bottom-5 whitespace-nowrap bg-blue-950 border border-blue-400 px-1.5 py-0.2 rounded text-[9px] font-bold text-white">
                  POSISI ANDA (GPS RIIL)
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          L.marker([lat, lng], { icon: deviceIcon })
            .addTo(markerGroup)
            .bindPopup(`
              <div class="tactical-popup">
                <div class="popup-header bg-blue-950 text-blue-200">
                  <span class="font-bold">📍 POSISI PERANGKAT ANDA (AKTUAL)</span>
                </div>
                <div class="p-2 space-y-1 text-xs">
                  <p><b>Latitude:</b> ${lat.toFixed(5)}°</p>
                  <p><b>Longitude:</b> ${lng.toFixed(5)}°</p>
                  <p><b>Akurasi GPS:</b> ±${Math.round(accuracy)} meter</p>
                  <p class="text-emerald-400"><b>Sumber:</b> Sensor GPS Fisik Perangkat Anda</p>
                </div>
              </div>
            `)
            .openPopup();
        }
      },
      (err) => {
        if (btn) btn.innerHTML = '<span>📍</span><span>GPS Riil Saya</span>';
        alert('Izin akses GPS belum diaktifkan di peramban, atau perangkat sedang berada di dalam ruangan. Silakan berikan izin akses lokasi di browser untuk mengunci posisi GPS fisik Anda.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return {
    init,
    renderAllLayers,
    switchBasemap,
    jumpToRegion,
    focusUnit,
    locateUserDevice,
    openCurrentInGoogleMaps,
    toggleRealTimeStream,
    toggleLayer,
    toggleMeasurement,
    exportGeoJSON
  };
})();
