const formCatat = document.getElementById("form-catat");
import tipe from "./dom.js";

function validasi(data) {
  data.nominal = Number(data.nominal.replace(/\./g, ""));
  data.tanggal = new Date(data.tanggal);
}

formCatat.addEventListener("submit", function (event) {
  event.preventDefault();
  const formData = new FormData(formCatat);
  const data = Object.fromEntries(formData.entries());
  data.tipe = tipe;
  validasi(data);
  console.log(data);
  //typeof data;
  formCatat.reset();
});
