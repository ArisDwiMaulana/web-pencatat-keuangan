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

function ringkasan() {
  const now = new Date();
  const bulanSekarang = now.getMonth() + 1;
  let uangMasuk = 0;
  let uangKeluar = 0;
  let uangSisa = 0;

  fetch("/api/collections/transaksi/records")
    .then((response) => response.json())
    .then((data) => {
      const transaksi = data.items;
      console.log(bulanSekarang);
      transaksi.forEach((item) => {
        if (bulanSekarang === getMonth(item)) {
          uangMasuk += item.tipe === "Pemasukan" ? item.nominal : 0;
          uangKeluar += item.tipe === "Pengeluaran" ? item.nominal : 0;
        }
      });
      console.log(typeof getMonth(transaksi[0]));
      console.log(`uang masuk ${uangMasuk}`);
      console.log(`uang keluar ${uangKeluar}`);
      uangSisa = uangMasuk - uangKeluar;
      console.log(`uang sisa ${uangSisa}`);
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
  console.log(data);
  //typeof data;
  formCatat.reset();
});

ringkasan();
