/**
 * riwayat.js - Implementasi logika halaman Riwayat Transaksi Keuangan
 * Path API: /api/collections/transaksi/records
 */

// Konstanta
const API_URL = "/api/collections/transaksi/records";
const ITEMS_PER_PAGE = 10;

// State aplikasi
let daftarSemuaTransaksi = [];
let daftarTransaksiTerfilter = [];
let halamanAktif = 1;

// Elemen DOM
const filterPeriode = document.getElementById("filter-periode");
const filterTipe = document.getElementById("filter-tipe");
const filterJenis = document.getElementById("filter-jenis");
const filterDariTanggal = document.getElementById("filter-dari-tanggal");
const filterSampaiTanggal = document.getElementById("filter-sampai-tanggal");

const btnTampilkan = document.getElementById("btn-tampilkan");
const btnReset = document.getElementById("btn-reset");
const btnEksporCsv = document.getElementById("btn-ekspor-csv");

const ringkasanMasuk = document.getElementById("ringkasan-masuk");
const ringkasanKeluar = document.getElementById("ringkasan-keluar");
const ringkasanSaldo = document.getElementById("ringkasan-saldo");

const transaksiTotal = document.getElementById("transaksi-total");
const daftarTransaksiContainer = document.getElementById("daftar-transaksi");

const btnPrev = document.getElementById("btn-prev");
const halamanInfo = document.getElementById("halaman-info");
const btnNext = document.getElementById("btn-next");

/**
 * Normalisasi string tanggal ke objek Date secara aman tanpa pergeseran zona waktu
 */
function normalisasiTanggal(tanggalStr) {
  if (!tanggalStr) return null;
  if (tanggalStr instanceof Date) return tanggalStr;

  if (typeof tanggalStr === "string") {
    const match = tanggalStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(year, month, day, 12, 0, 0);
    }
  }

  const d = new Date(tanggalStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format tanggal ke format lokal Indonesia (contoh: 03 Okt 2026)
 */
function formatTanggal(tanggalStr) {
  const d = normalisasiTanggal(tanggalStr);
  if (!d) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format angka ke format nominal rupiah tanpa simbol
 */
function formatAngka(angka) {
  return Number(angka || 0).toLocaleString("id-ID");
}

/**
 * Escape teks untuk mencegah serangan XSS
 */
function escapeHtml(teks) {
  if (teks === null || teks === undefined) return "";
  const str = String(teks);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Memeriksa apakah tanggal transaksi berada pada minggu ini (Senin - Minggu)
 */
function isMingguIni(tanggalStr) {
  const tgl = normalisasiTanggal(tanggalStr);
  if (!tgl) return false;

  const now = new Date();
  const day = now.getDay(); // 0: Minggu, 1: Senin, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6, 23, 59, 59, 999);

  return tgl >= startOfWeek && tgl <= endOfWeek;
}

/**
 * Memeriksa apakah tanggal transaksi berada pada bulan dan tahun ini
 */
function isBulanIni(tanggalStr) {
  const tgl = normalisasiTanggal(tanggalStr);
  if (!tgl) return false;

  const now = new Date();
  return tgl.getFullYear() === now.getFullYear() && tgl.getMonth() === now.getMonth();
}

/**
 * Mengambil data transaksi dari server PocketBase menggunakan fetch
 */
function ambilData() {
  if (daftarTransaksiContainer) {
    daftarTransaksiContainer.innerHTML = `
      <div class="p-8 text-center text-sm text-slate-400">
        Memuat data transaksi...
      </div>
    `;
  }

  fetch(`${API_URL}?perPage=500&sort=-tanggal,-created`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Gagal mengambil data dari server");
      }
      return response.json();
    })
    .then((data) => {
      daftarSemuaTransaksi = data.items || [];
      terapkanFilter();
    })
    .catch((error) => {
      console.error("Gagal mengambil data:", error);
      if (daftarTransaksiContainer) {
        daftarTransaksiContainer.innerHTML = `
          <div class="p-8 text-center text-sm text-red-500">
            Terjadi kesalahan saat memuat data. Silakan coba beberapa saat lagi.
          </div>
        `;
      }
    });
}

/**
 * Menerapkan filter berdasarkan pilihan Periode, Rentang Tanggal, Tipe, dan Jenis Transaksi
 */
function terapkanFilter() {
  const periode = filterPeriode ? filterPeriode.value : "semua";
  const tipe = filterTipe ? filterTipe.value.toLowerCase() : "semua";
  const jenis = filterJenis ? filterJenis.value : "semua";

  const dariTanggalVal = filterDariTanggal ? filterDariTanggal.value : "";
  const sampaiTanggalVal = filterSampaiTanggal ? filterSampaiTanggal.value : "";

  daftarTransaksiTerfilter = daftarSemuaTransaksi.filter((item) => {
    const itemTanggal = normalisasiTanggal(item.tanggal || item.created);

    // 1. Filter Rentang Tanggal Kustom (jika diisi)
    if (dariTanggalVal) {
      const tglDari = normalisasiTanggal(dariTanggalVal);
      if (tglDari) {
        tglDari.setHours(0, 0, 0, 0);
        if (!itemTanggal || itemTanggal < tglDari) {
          return false;
        }
      }
    }

    if (sampaiTanggalVal) {
      const tglSampai = normalisasiTanggal(sampaiTanggalVal);
      if (tglSampai) {
        tglSampai.setHours(23, 59, 59, 999);
        if (!itemTanggal || itemTanggal > tglSampai) {
          return false;
        }
      }
    }

    // 2. Filter Periode (hanya jika rentang tanggal kustom tidak diisi keduanya)
    if (!dariTanggalVal && !sampaiTanggalVal) {
      if (periode === "minggu-ini" && !isMingguIni(item.tanggal || item.created)) {
        return false;
      }
      if (periode === "bulan-ini" && !isBulanIni(item.tanggal || item.created)) {
        return false;
      }
    }

    // 3. Filter Tipe
    if (tipe !== "semua") {
      const itemTipe = (item.tipe || "").toLowerCase();
      if (itemTipe !== tipe) {
        return false;
      }
    }

    // 4. Filter Jenis Transaksi
    if (jenis !== "semua") {
      if ((item.jenis_transaksi || "").toLowerCase() !== jenis.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // Urutkan transaksi dari tanggal terbaru ke terlama
  daftarTransaksiTerfilter.sort((a, b) => {
    const tglA = normalisasiTanggal(a.tanggal || a.created) || 0;
    const tglB = normalisasiTanggal(b.tanggal || b.created) || 0;
    return tglB - tglA;
  });

  // Update ringkasan dan header jumlah transaksi
  perbaruiRingkasan();

  // Reset ke halaman 1 saat filter diperbarui
  halamanAktif = 1;
  renderTransaksi();
}

/**
 * Menghitung dan menampilkan total Masuk, Keluar, dan Saldo
 */
function perbaruiRingkasan() {
  let totalMasuk = 0;
  let totalKeluar = 0;

  daftarTransaksiTerfilter.forEach((item) => {
    const nominal = Number(item.nominal) || 0;
    const tipe = (item.tipe || "").toLowerCase();

    if (tipe === "pemasukan") {
      totalMasuk += nominal;
    } else if (tipe === "pengeluaran") {
      totalKeluar += nominal;
    }
  });

  const saldo = totalMasuk - totalKeluar;

  if (ringkasanMasuk) ringkasanMasuk.textContent = formatAngka(totalMasuk);
  if (ringkasanKeluar) ringkasanKeluar.textContent = formatAngka(totalKeluar);
  if (ringkasanSaldo) ringkasanSaldo.textContent = formatAngka(saldo);

  if (transaksiTotal) {
    transaksiTotal.textContent = `${daftarTransaksiTerfilter.length} transaksi`;
  }
}

/**
 * Merender daftar transaksi untuk halaman aktif
 */
function renderTransaksi() {
  if (!daftarTransaksiContainer) return;

  const totalItems = daftarTransaksiTerfilter.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  if (halamanAktif > totalPages) {
    halamanAktif = totalPages;
  }
  if (halamanAktif < 1) {
    halamanAktif = 1;
  }

  // Jika tidak ada data
  if (totalItems === 0) {
    daftarTransaksiContainer.innerHTML = `
      <div class="p-8 text-center text-sm text-slate-400">
        Tidak ada transaksi yang sesuai dengan filter.
      </div>
    `;
    perbaruiPagination(totalPages);
    return;
  }

  // Ambil data untuk halaman saat ini
  const startIndex = (halamanAktif - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const itemsHalaman = daftarTransaksiTerfilter.slice(startIndex, endIndex);

  // Buat HTML transaksi
  daftarTransaksiContainer.innerHTML = itemsHalaman
    .map((item) => {
      const isPemasukan = (item.tipe || "").toLowerCase() === "pemasukan";
      const tanda = isPemasukan ? "+" : "-";
      const warnaNominal = isPemasukan ? "text-[#10b981]" : "text-[#ef4444]";
      const tglFormatted = formatTanggal(item.tanggal || item.created);
      const keterangan = item.keterangan ? ` · ${escapeHtml(item.keterangan)}` : "";
      const kategori = escapeHtml(item.kategori || "Lainnya");

      return `
        <div class="p-5 flex justify-between items-center hover:bg-slate-50/50 transition">
          <div>
            <h3 class="text-sm font-semibold text-slate-800">
              ${kategori}
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              ${tglFormatted}${keterangan}
            </p>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm font-bold ${warnaNominal}">
              ${tanda}Rp${formatAngka(item.nominal)}
            </span>
            <button
              type="button"
              data-id="${item.id}"
              class="btn-hapus text-xs text-slate-400 hover:text-red-500 transition cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  perbaruiPagination(totalPages);
}

/**
 * Memperbarui tampilan tombol dan informasi pagination
 */
function perbaruiPagination(totalPages) {
  if (halamanInfo) {
    halamanInfo.textContent = `Halaman ${halamanAktif} dari ${totalPages}`;
  }

  if (btnPrev) {
    if (halamanAktif <= 1) {
      btnPrev.disabled = true;
      btnPrev.className = "border border-slate-200 text-slate-400 bg-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-not-allowed";
    } else {
      btnPrev.disabled = false;
      btnPrev.className = "border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition";
    }
  }

  if (btnNext) {
    if (halamanAktif >= totalPages) {
      btnNext.disabled = true;
      btnNext.className = "border border-slate-200 text-slate-400 bg-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-not-allowed";
    } else {
      btnNext.disabled = false;
      btnNext.className = "border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition";
    }
  }
}

/**
 * Menghapus transaksi menggunakan fetch DELETE
 */
function hapusTransaksi(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
    return;
  }

  fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Gagal menghapus transaksi");
      }
      alert("Transaksi berhasil dihapus");
      ambilData();
    })
    .catch((error) => {
      alert("Gagal menghapus transaksi");
      console.error("Detail error:", error);
    });
}

/**
 * Mengatur ulang filter ke kondisi default
 */
function resetFilter() {
  if (filterPeriode) filterPeriode.value = "minggu-ini";
  if (filterTipe) filterTipe.value = "semua";
  if (filterJenis) filterJenis.value = "semua";
  if (filterDariTanggal) filterDariTanggal.value = "";
  if (filterSampaiTanggal) filterSampaiTanggal.value = "";

  terapkanFilter();
}

/**
 * Mengekspor data transaksi yang terfilter ke format CSV
 */
function eksporCSV() {
  if (daftarTransaksiTerfilter.length === 0) {
    alert("Tidak ada data transaksi yang dapat diekspor");
    return;
  }

  const header = ["Tanggal", "Tipe", "Kategori", "Jenis Transaksi", "Nominal", "Keterangan"];
  const baris = daftarTransaksiTerfilter.map((item) => {
    const tgl = formatTanggal(item.tanggal || item.created);
    return [
      tgl,
      item.tipe || "",
      item.kategori || "",
      item.jenis_transaksi || "",
      item.nominal || 0,
      item.keterangan || "",
    ];
  });

  const isiCSV = [
    header.join(","),
    ...baris.map((b) =>
      b.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\r\n");

  // Tambahkan UTF-8 BOM (\uFEFF) agar Microsoft Excel membaca encoding dengan benar
  const blob = new Blob(["\uFEFF" + isiCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const tanggalHariIni = new Date().toISOString().split("T")[0];

  anchor.href = url;
  anchor.download = `riwayat_transaksi_${tanggalHariIni}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// Inisialisasi Event Listeners
if (btnTampilkan) {
  btnTampilkan.addEventListener("click", () => {
    terapkanFilter();
  });
}

if (btnReset) {
  btnReset.addEventListener("click", () => {
    resetFilter();
  });
}

if (filterPeriode) {
  filterPeriode.addEventListener("change", () => {
    terapkanFilter();
  });
}

if (filterTipe) {
  filterTipe.addEventListener("change", () => {
    terapkanFilter();
  });
}

if (filterJenis) {
  filterJenis.addEventListener("change", () => {
    terapkanFilter();
  });
}

if (filterDariTanggal) {
  filterDariTanggal.addEventListener("change", () => {
    terapkanFilter();
  });
}

if (filterSampaiTanggal) {
  filterSampaiTanggal.addEventListener("change", () => {
    terapkanFilter();
  });
}

if (btnEksporCsv) {
  btnEksporCsv.addEventListener("click", eksporCSV);
}

if (btnPrev) {
  btnPrev.addEventListener("click", () => {
    if (halamanAktif > 1) {
      halamanAktif--;
      renderTransaksi();
    }
  });
}

if (btnNext) {
  btnNext.addEventListener("click", () => {
    const totalPages = Math.ceil(daftarTransaksiTerfilter.length / ITEMS_PER_PAGE) || 1;
    if (halamanAktif < totalPages) {
      halamanAktif++;
      renderTransaksi();
    }
  });
}

if (daftarTransaksiContainer) {
  daftarTransaksiContainer.addEventListener("click", (event) => {
    const btnHapus = event.target.closest(".btn-hapus");
    if (btnHapus) {
      const id = btnHapus.getAttribute("data-id");
      if (id) {
        hapusTransaksi(id);
      }
    }
  });
}

// Jalankan pengambilan data pertama kali saat halaman dimuat
ambilData();
