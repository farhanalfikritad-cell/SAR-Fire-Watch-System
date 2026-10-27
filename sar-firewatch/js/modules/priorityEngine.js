/**
 * SAR FireWatch - Priority & Early Warning Decision Support Engine
 * (DSS - Decision Support System untuk Komandan Operasi SAR)
 */

window.PriorityEngine = (function () {
  /**
   * Menghitung skor risiko dan rekomendasi prioritas insiden
   * @param {Object} params 
   * @returns {Object} Hasil evaluasi prioritas, faktor penentu, dan tingkat ketidakpastian
   */
  function evaluateIncidentRisk(params) {
    const {
      distanceToSettlementKm = 5.0,
      threatenedCivilians = 0,
      vitalFacilitiesCount = 0,
      estimatedAreaHa = 10,
      peatDepthM = 0,
      windSpeedKmh = 10,
      windTowardsSettlement = false,
      ispuValue = 100,
      verificationSource = 'Satelit', // 'Satelit', 'Laporan Petugas Lapangan', 'Masyarakat'
      dataAgeMinutes = 30
    } = params;

    let score = 0;
    let reasons = [];
    let criticalFlags = [];

    // 1. Parameter Ancaman Keselamatan Manusia & Permukiman (Maks 40 Poin)
    if (distanceToSettlementKm <= 1.0) {
      score += 40;
      criticalFlags.push('Jarak sangat dekat dengan permukiman (< 1.0 km)');
      reasons.push(`Jarak api ke permukiman hanya ${distanceToSettlementKm} km — potensi ancaman langsung terhadap keselamatan warga.`);
    } else if (distanceToSettlementKm <= 2.5) {
      score += 28;
      reasons.push(`Jarak ke permukiman dalam zona siaga (< 2.5 km: ${distanceToSettlementKm} km).`);
    } else if (distanceToSettlementKm <= 5.0) {
      score += 15;
      reasons.push(`Permukiman berada dalam radius pemantauan sekunder (${distanceToSettlementKm} km).`);
    } else {
      score += 5;
      reasons.push(`Permukiman relatif jauh (${distanceToSettlementKm} km).`);
    }

    if (threatenedCivilians > 300) {
      score += 15;
      criticalFlags.push(`Lebih dari 300 jiwa (${threatenedCivilians} jiwa) berada di jalur ancaman`);
      reasons.push(`Konsentrasi populasi rentan tinggi (${threatenedCivilians} jiwa terancam).`);
    } else if (threatenedCivilians > 100) {
      score += 10;
      reasons.push(`Populasi terancam: ${threatenedCivilians} jiwa.`);
    }

    // 2. Faktor Bahan Bakar & Lahan Gambut (Maks 20 Poin)
    if (peatDepthM >= 3.0) {
      score += 20;
      criticalFlags.push(`Kubah gambut sangat tebal (${peatDepthM}m) — risiko kebakaran bawah tanah ekstrem`);
      reasons.push(`Lahan gambut dalam (${peatDepthM} meter) sulit dipadamkan dan menghasilkan emisi kabut asap beracun berkepanjangan.`);
    } else if (peatDepthM >= 1.5) {
      score += 14;
      reasons.push(`Lahan gambut sedang (${peatDepthM} meter).`);
    } else if (peatDepthM > 0) {
      score += 8;
      reasons.push(`Lapisan gambut dangkal (${peatDepthM} meter).`);
    }

    // 3. Cuaca & Penjalaran Api (Maks 20 Poin)
    if (windSpeedKmh >= 20 && windTowardsSettlement) {
      score += 20;
      criticalFlags.push(`Angin kencang (${windSpeedKmh} km/j) bertiup langsung menuju perumahan`);
      reasons.push(`Kondisi meteorologi kritis: Angin ${windSpeedKmh} km/jam mengarah tepat ke zona pemukiman.`);
    } else if (windSpeedKmh >= 15) {
      score += 12;
      reasons.push(`Kecepatan angin cukup tinggi (${windSpeedKmh} km/jam) mempercepat penjalaran tajuk.`);
    } else {
      score += 5;
      reasons.push(`Kecepatan angin moderat (${windSpeedKmh} km/jam).`);
    }

    // 4. Kualitas Udara & Paparan Asap (ISPU)
    if (ispuValue >= 300) {
      score += 10;
      criticalFlags.push(`Indeks ISPU Berbahaya (${ispuValue})`);
      reasons.push(`Kualitas udara level BERBAHAYA (ISPU ${ispuValue}) berisiko ISPA akut pada kelompok lansia & balita.`);
    } else if (ispuValue >= 200) {
      score += 6;
      reasons.push(`Kualitas udara SANGAT TIDAK SEHAT (ISPU ${ispuValue}).`);
    }

    // 5. Ancaman Objek Vital & Luas Terbakar
    if (vitalFacilitiesCount > 0) {
      score += 10;
      reasons.push(`Terdapat ${vitalFacilitiesCount} fasilitas vital/infrastruktur publik berisiko.`);
    }

    if (estimatedAreaHa >= 40) {
      score += 10;
      reasons.push(`Luas kebakaran telah mencapai ${estimatedAreaHa} Ha.`);
    } else if (estimatedAreaHa >= 15) {
      score += 6;
      reasons.push(`Luas kebakaran ${estimatedAreaHa} Ha.`);
    }

    // Penentuan Rekomendasi Prioritas
    let recommendedPriority = 'Rendah';
    let priorityClass = 'badge-low';
    let urgencyDescription = '';

    if (score >= 75 || criticalFlags.length >= 2 || (distanceToSettlementKm < 1.0 && threatenedCivilians > 100)) {
      recommendedPriority = 'Kritis';
      priorityClass = 'badge-critical';
      urgencyDescription = 'Terdapat indikasi ancaman langsung terhadap keselamatan manusia atau objek vital yang memerlukan pengerahan tim dan evakuasi segera.';
    } else if (score >= 50 || distanceToSettlementKm <= 2.5) {
      recommendedPriority = 'Tinggi';
      priorityClass = 'badge-high';
      urgencyDescription = 'Kejadian berpotensi eskalasi meluas mendekati permukiman penting sehingga memerlukan respons terkoordinasi lintas matra (darat & udara).';
    } else if (score >= 30) {
      recommendedPriority = 'Sedang';
      priorityClass = 'badge-medium';
      urgencyDescription = 'Kejadian dipantau secara berkala dan dilakukan penyekatan oleh tim posko setempat sebelum meluas.';
    } else {
      recommendedPriority = 'Rendah';
      priorityClass = 'badge-low';
      urgencyDescription = 'Kondisi terpantau stabil, pemadaman sisa bara atau pendinginan lapangan berjalan rutin.';
    }

    // Perhitungan Tingkat Keyakinan Data & Ketidakpastian
    let confidencePercent = 90;
    let uncertaintyFactor = 'Rendah';

    if (verificationSource === 'Satelit' && dataAgeMinutes > 60) {
      confidencePercent -= 25;
      uncertaintyFactor = 'Tinggi (Citra satelit >1 jam belum diverifikasi ground-check)';
    } else if (verificationSource === 'Laporan Petugas Lapangan') {
      confidencePercent = 98;
      uncertaintyFactor = 'Sangat Rendah (Verifikasi visual langsung petugas SAR)';
    } else if (verificationSource === 'Masyarakat') {
      confidencePercent = 75;
      uncertaintyFactor = 'Sedang (Perlu verifikasi titik koordinat oleh drone posko)';
    }

    return {
      score: Math.min(score, 100),
      recommendedPriority,
      priorityClass,
      urgencyDescription,
      criticalFlags,
      reasons,
      confidencePercent,
      uncertaintyFactor,
      evaluationTimestamp: new Date().toISOString()
    };
  }

  return {
    evaluateIncidentRisk
  };
})();
