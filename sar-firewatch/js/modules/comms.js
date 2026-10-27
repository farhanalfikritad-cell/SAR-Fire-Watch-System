/**
 * SAR FireWatch - Operational Communications & Radio Dispatch Module
 */

window.CommsModule = (function () {
  let activeChannel = 'Pusdalops-National';

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const comms = window.SAR_DATA.getComms();
    const currentUser = window.SAR_DATA.getCurrentUser();
    const commandPosts = window.SAR_DATA.getCommandPosts();
    const isLive = window.SAR_DATA.isLiveMode();

    // Filter messages by channel
    const channelMessages = activeChannel === 'ALL' ? comms : comms.filter(m => m.channel === activeChannel || m.type === 'SOS_ALERT');

    container.innerHTML = `
      <div class="space-y-6">
        <!-- HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-100 uppercase tracking-wider">Komunikasi Operasi Terpadu</h1>
              ${isLive ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">● FREKUENSI RESMI</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">DATA SIMULASI</span>'}
            </div>
            <p class="text-xs text-slate-400 mt-1">Kanal pesan taktis posko, siaran pengumuman komando, dan log komunikasi radio VHF/HF</p>
          </div>

          <div class="flex items-center gap-3">
            <div class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-slate-400">Frekuensi Utama SAR:</span>
              <span class="text-cyan-400 font-mono font-bold">156.800 MHz (VHF Ch 16)</span>
            </div>
          </div>
        </div>

        <!-- 2-COL COMMS LAYOUT -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- LEFT 1 COL: CHANNELS & EMERGENCY CONTACTS -->
          <div class="space-y-6">
            <!-- Channel Switcher -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
              <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Kanal Komunikasi</h3>
              <div class="space-y-1.5" id="comms-channel-list">
                ${[
                  { id: 'Pusdalops-National', name: '📢 Pusdalops Nasional', desc: 'Siaran komando & instruksi umum' },
                  { id: 'INC-2026-RI-001', name: '🚨 Sektor Rimbo Panjang', desc: 'Kanal operasi darat & air Riau' },
                  { id: 'INC-2026-KT-002', name: '🔥 Sektor Sebangau Kalteng', desc: 'Kanal koordinasi water bombing' },
                  { id: 'Radio-Log-VHF', name: '📻 Monitor Radio VHF/HF', desc: 'Transkrip sinyal radio lapangan' },
                  { id: 'EMERGENCY-SOS', name: '🚨 Kanal SOS Lapangan', desc: 'Panggilan darurat & evakuasi medis' }
                ].map(ch => `
                  <button 
                    onclick="CommsModule.switchChannel('${ch.id}')"
                    class="w-full text-left p-2.5 rounded-lg text-xs transition-all ${activeChannel === ch.id ? 'bg-cyan-600/30 border border-cyan-500/50 text-white font-bold' : 'bg-slate-950/40 hover:bg-slate-800/80 text-slate-300 border border-transparent'}">
                    <div class="font-bold flex items-center justify-between">
                      <span>${ch.name}</span>
                      ${ch.id === 'EMERGENCY-SOS' ? '<span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>' : ''}
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${ch.desc}</div>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Radio Directory Contacts -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
              <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Direktori Kontak Posko</h3>
              <div class="space-y-2 text-xs">
                ${commandPosts.map(cp => `
                  <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <div class="font-bold text-cyan-300">${cp.name.split('-')[0]}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${cp.phone}</div>
                    <div class="text-[10px] text-slate-500">Komandan: ${cp.commander}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- RIGHT 3 COLS: CHAT FEED & MESSAGE SENDER -->
          <div class="lg:col-span-3 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden h-[600px]">
            <!-- Feed Header -->
            <div class="bg-slate-950/80 border-b border-slate-800 p-4 flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h3 class="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider">${activeChannel}</h3>
                </div>
                <p class="text-[11px] text-slate-400 mt-0.5">Semua komunikasi tercatat secara otomatis pada buku jurnal operasi BASARNAS</p>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  onclick="CommsModule.sendOfficialBroadcast()"
                  class="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-600/30">
                  <span>📢</span>
                  <span>Siarkan Pengumuman Komando</span>
                </button>
              </div>
            </div>

            <!-- Messages Stream -->
            <div class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40" id="comms-messages-stream">
              ${channelMessages.length === 0 ? `
                <div class="h-full flex items-center justify-center text-xs text-slate-500">
                  Belum ada pesan di kanal ini. Mulai ketik laporan operasional di bawah.
                </div>
              ` : channelMessages.map(msg => {
                const isSOS = msg.type === 'SOS_ALERT';
                const isBroadcast = msg.type === 'BROADCAST';
                let boxClass = 'bg-slate-900 border-slate-800';
                if (isSOS) boxClass = 'bg-red-950/60 border-red-500/80 shadow-lg shadow-red-950/40';
                if (isBroadcast) boxClass = 'bg-amber-950/40 border-amber-500/50';

                return `
                  <div class="border rounded-xl p-3 text-xs transition-all ${boxClass}">
                    <div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5 mb-1.5">
                      <div class="flex items-center gap-2">
                        <span class="font-bold ${isSOS ? 'text-red-400 font-mono text-sm' : isBroadcast ? 'text-amber-400' : 'text-cyan-400'}">
                          ${msg.sender}
                        </span>
                        <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">${msg.role}</span>
                      </div>
                      <span class="text-[10px] text-slate-500 font-mono">${msg.time}</span>
                    </div>
                    <p class="text-slate-200 leading-relaxed font-normal">${msg.text}</p>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Input Box -->
            <div class="bg-slate-950 border-t border-slate-800 p-3">
              <form onsubmit="CommsModule.handleSendMessage(event)" class="flex gap-2">
                <input 
                  type="text" 
                  id="comms-input-text" 
                  required 
                  placeholder="Ketik laporan situasi, instruksi taktis, atau koordinat lapangan..." 
                  class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500">
                <button 
                  type="submit" 
                  class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5">
                  <span>Kirim</span>
                  <span>➔</span>
                </button>
              </form>
              <div class="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
                <span>Pengirim Aktif: <b class="text-slate-300">${currentUser.name} (${currentUser.role.badge})</b></span>
                <span class="italic">Komunikasi cadangan radio resmi tetap diutamakan saat transmisi data internet terputus.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function switchChannel(channelId) {
    activeChannel = channelId;
    render('main-content-view');
  }

  function handleSendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('comms-input-text');
    if (!input || !input.value.trim()) return;

    window.SAR_DATA.addCommsMessage(activeChannel, input.value.trim(), 'OPERATIONAL');
    input.value = '';
    render('main-content-view');

    // Scroll to bottom
    const stream = document.getElementById('comms-messages-stream');
    if (stream) stream.scrollTop = stream.scrollHeight;
  }

  function sendOfficialBroadcast() {
    const text = prompt('Ketik Siaran Pengumuman Resmi / Perintah Operasi dari Komandan ke Seluruh Posko:');
    if (text) {
      window.SAR_DATA.addCommsMessage('Pusdalops-National', text, 'BROADCAST');
      alert('Pengumuman resmi berhasil disiarkan ke seluruh posko SAR!');
      render('main-content-view');
    }
  }

  return {
    render,
    switchChannel,
    handleSendMessage,
    sendOfficialBroadcast
  };
})();
