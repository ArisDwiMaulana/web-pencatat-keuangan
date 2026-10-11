// pemanggilan elemen html
const formCatat = document.getElementById("form-catat");
const btnPengeluaran = document.getElementById("pengeluaran");
const btnPemasukan = document.getElementById("pemasukan");
const dropDownKategori = document.getElementById("kategori");

// variabel pembantu
const dropdownPemasukan = `
<select class="select appearance-none w-full" required name="kategori" id="select-kategori">
  <option>Uang Mingguan</option>
  <option>Hadiah</option>
  <option>Lainnya</option>
</select>
`;
const dropdownPengeluaran = `
<select class="select appearance-none w-full" required name="kategori" id="select-kategori">
  <option>Makanan</option>
  <option>Minuman</option>
  <option>Barang</option>
  <option>Lainnya</option>
</select>

`;
let tipe = "Pengeluaran";

// fungsi fungsi
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

// event handlers
btnPemasukan.addEventListener("click", function () {
  this.classList.remove("bg-white");
  this.classList.add("bg-green-600");
  this.classList.remove("hover:bg-slate-50");
  this.classList.add("hover:bg-green-700");
  this.classList.remove("text-slate-600");
  this.classList.add("text-white");

  btnPengeluaran.classList.remove("bg-red-600");
  btnPengeluaran.classList.add("bg-white");
  btnPengeluaran.classList.remove("hover:bg-red-700");
  btnPengeluaran.classList.add("hover:bg-slate-50");
  btnPengeluaran.classList.remove("text-white");
  btnPengeluaran.classList.add("text-slate-600");

  dropDownKategori.innerHTML = dropdownPemasukan;
  tipe = "Pemasukan";
});

btnPengeluaran.addEventListener("click", function () {
  this.classList.remove("bg-white");
  this.classList.add("bg-red-600");
  this.classList.remove("hover:bg-slate-50");
  this.classList.add("hover:bg-red-700");
  this.classList.remove("text-slate-600");
  this.classList.add("text-white");

  btnPemasukan.classList.remove("bg-green-600");
  btnPemasukan.classList.add("bg-white");
  btnPemasukan.classList.remove("hover:bg-green-700");
  btnPemasukan.classList.add("hover:bg-slate-50");
  btnPemasukan.classList.remove("text-white");
  btnPemasukan.classList.add("text-slate-600");

  dropDownKategori.innerHTML = dropdownPengeluaran;
  tipe = "Pengeluaran";
});

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
