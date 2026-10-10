const btnPengeluaran = document.getElementById("pengeluaran");
const btnPemasukan = document.getElementById("pemasukan");
const dropDownKategori = document.getElementById("kategori");

const dropdownPemasukan = `
<select class="select appearance-none w-full" required name="kategori" id="select-kategori">
  <option>Uang Mingguan</option>
  <option>Hadiah</option>
  <option>Lainnya</option>
</select>
`;

const dropdownPengeluaran = `
<select class="select appearance-none w-full" required name="kategori" id="select-kategori">
  <option>Makan</option>
  <option>Bensin</option>
  <option>Kebutuhan Lainnya</option>
</select>

`;

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
});
