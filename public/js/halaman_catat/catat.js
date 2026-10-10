const formCatat = document.getElementById("form-catat");
const btnPengeluaran = document.getElementById("pengeluaran");
const btnPemasukan = document.getElementById("pemasukan");
let tipe = "Pengeluaran";

btnPemasukan.addEventListener("click", function () {
  tipe = "Pemasukan";
});

btnPengeluaran.addEventListener("click", function () {
  tipe = "Pengeluaran";
});

function validasi(data) {
  data.nominal = Number(data.nominal.replace(/\./g, ""));
  data.tanggal = new Date(data.tanggal);
}

function simpanData(data) {
  fetch("/api/collections/transaksi/records", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Gagal menyimpan data");
      }
      return response.json();
    })
    .then((result) => {
      alert("Data berhasil disimpan");
      console.log("Respon backend " + result);
    })
    .catch((error) => {
      alert("Data gagal disimpan");
      console.log("Detail error: " + error.message);
    });
}

function getMonth(data) {
  return Number(data.tanggal.split("-")[1]);
}

function uiRingkasan(masuk, keluar, sisa) {
  return `
        <h2 class="text-sm font-semibold text-slate-700 mb-4">
          Ringkasan Bulan Ini
        </h2>
        <div class="grid grid-cols-3 text-center">
          <!-- Masuk -->
          <div>
            <p class="text-xs text-slate-500 font-medium mb-1">Masuk</p>
            <p class="text-base sm:text-lg font-bold text-[#10b981]">
              Rp ${masuk.toLocaleString("id-ID")}
            </p>
          </div>
          <!-- Keluar -->
          <div>
            <p class="text-xs text-slate-500 font-medium mb-1">Keluar</p>
            <p class="text-base sm:text-lg font-bold text-[#ef4444]">
              Rp ${keluar.toLocaleString("id-ID")}
            </p>
          </div>
          <!-- Saldo -->
          <div>
            <p class="text-xs text-slate-500 font-medium mb-1">Sisa Saldo</p>
            <p class="text-base sm:text-lg font-bold text-slate-800">
              Rp ${sisa.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

`;
}

function ringkasan() {
  const now = new Date();
  const bulanSekarang = now.getMonth() + 1;
  let uangMasuk = 0;
  let uangKeluar = 0;
  let uangSisa = 0;
  const cardRingkasan = document.getElementById("card-ringkasan");

  fetch("/api/collections/transaksi/records")
    .then((response) => response.json())
    .then((data) => {
      const transaksi = data.items;
      transaksi.forEach((item) => {
        if (bulanSekarang === getMonth(item)) {
          uangMasuk += item.tipe === "Pemasukan" ? item.nominal : 0;
          uangKeluar += item.tipe === "Pengeluaran" ? item.nominal : 0;
        }
      });
      uangSisa = uangMasuk - uangKeluar;
      console.log(cardRingkasan);
      cardRingkasan.innerHTML = uiRingkasan(uangMasuk, uangKeluar, uangSisa);
    })
    .catch((err) => console.log(err));
}

formCatat.addEventListener("submit", function (event) {
  event.preventDefault();
  const formData = new FormData(formCatat);
  const data = Object.fromEntries(formData.entries());
  data.tipe = tipe;
  validasi(data);
  simpanData(data);
  ringkasan();
  formCatat.reset();
});

ringkasan();
