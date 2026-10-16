"use strict";

/* ==========================================================
   Kuis Dasar HTML dan CSS
   Alur: layar mulai -> 10 soal -> layar hasil -> main lagi
   ========================================================== */

// ---------- Pengaturan ----------
const DETIK_PER_SOAL = 20;
const KUNCI_TERBAIK = "kuisHtmlCss.skorTerbaik";

// ---------- Bank soal ----------
// pilihan      : empat opsi jawaban
// jawabanBenar : indeks opsi yang benar (dimulai dari 0)
// kode         : true jika opsi berupa kode (ditampilkan dengan font monospace)
// pembahasan   : penjelasan yang muncul setelah soal dijawab
// Teks di antara tanda ` ` akan ditampilkan sebagai kode.
const bankSoal = [
  {
    pertanyaan: "Tag HTML manakah yang digunakan untuk membuat tautan (link)?",
    pilihan: ["<link>", "<a>", "<href>", "<url>"],
    jawabanBenar: 1,
    kode: true,
    pembahasan: "Tag `<a>` (anchor) membuat tautan. Tag `<link>` dipakai di `<head>` untuk menghubungkan file seperti stylesheet, sedangkan `href` adalah atribut, bukan tag."
  },
  {
    pertanyaan: "Properti CSS manakah yang mengubah warna teks?",
    pilihan: ["font-color", "text-color", "color", "foreground"],
    jawabanBenar: 2,
    kode: true,
    pembahasan: "Properti `color` mengatur warna teks. Warna latar diatur dengan `background-color`."
  },
  {
    pertanyaan: "Tag HTML manakah yang menghasilkan judul dengan tingkat terbesar?",
    pilihan: ["<h6>", "<head>", "<title>", "<h1>"],
    jawabanBenar: 3,
    kode: true,
    pembahasan: "Tag `<h1>` adalah judul tingkat tertinggi, sedangkan `<h6>` yang terkecil. Tag `<head>` dan `<title>` berada di kepala dokumen dan bukan judul di isi halaman."
  },
  {
    pertanyaan: "Atribut apa yang menentukan alamat tujuan pada tag `<a>`?",
    pilihan: ["src", "href", "link", "target"],
    jawabanBenar: 1,
    kode: true,
    pembahasan: "Atribut `href` berisi alamat tujuan. Atribut `src` dipakai untuk sumber gambar atau skrip, sedangkan `target` hanya menentukan tempat tautan dibuka, misalnya di tab baru."
  },
  {
    pertanyaan: "Bagaimana cara menulis selector CSS untuk elemen yang memiliki class bernama `menu`?",
    pilihan: [".menu", "#menu", "menu", "*menu"],
    jawabanBenar: 0,
    kode: true,
    pembahasan: "Selector class diawali titik, yaitu `.menu`. Tanda `#` dipakai untuk id, sedangkan `menu` tanpa tanda memilih tag `<menu>`."
  },
  {
    pertanyaan: "Properti CSS manakah yang mengatur jarak antara isi elemen dan garis tepinya (border)?",
    pilihan: ["margin", "padding", "spacing", "gap"],
    jawabanBenar: 1,
    kode: true,
    pembahasan: "Properti `padding` adalah ruang di dalam border. Properti `margin` mengatur jarak di luar border, dan `gap` mengatur jarak antar anak elemen pada flex atau grid. Adapun `spacing` bukan properti CSS."
  },
  {
    pertanyaan: "Urutan lapisan box model dari dalam ke luar adalah ...",
    pilihan: [
      "Content, padding, border, margin",
      "Content, margin, border, padding",
      "Padding, content, border, margin",
      "Border, padding, content, margin"
    ],
    jawabanBenar: 0,
    kode: false,
    pembahasan: "Dari dalam ke luar: content (isi), padding, border, lalu margin."
  },
  {
    pertanyaan: "Apa fungsi `display: flex` pada sebuah elemen?",
    pilihan: [
      "Menyembunyikan elemen dari halaman",
      "Mengatur anak elemennya dalam tata letak fleksibel satu arah",
      "Membuat teks di dalamnya menjadi tebal",
      "Mengubah elemen menjadi gambar"
    ],
    jawabanBenar: 1,
    kode: false,
    pembahasan: "Flexbox mengatur anak elemen dalam satu arah (baris atau kolom), lengkap dengan perataan dan jarak. Untuk menyembunyikan elemen dipakai `display: none`."
  },
  {
    pertanyaan: "Tag HTML manakah yang digunakan untuk daftar tak berurut (berpoin)?",
    pilihan: ["<ol>", "<li>", "<ul>", "<dl>"],
    jawabanBenar: 2,
    kode: true,
    pembahasan: "Tag `<ul>` (unordered list) membuat daftar berpoin. Tag `<ol>` untuk daftar bernomor, `<li>` untuk setiap butir di dalam daftar, dan `<dl>` untuk daftar deskripsi."
  },
  {
    pertanyaan: "Atribut mana pada tag `<img>` yang menentukan lokasi file gambar?",
    pilihan: ["href", "src", "alt", "path"],
    jawabanBenar: 1,
    kode: true,
    pembahasan: "Atribut `src` berisi lokasi file gambar. Atribut `alt` berisi teks pengganti untuk pembaca layar atau saat gambar gagal dimuat."
  }
];

// ---------- Mengambil elemen dari halaman ----------
const $ = (id) => document.getElementById(id);

const layarMulai = $("layar-mulai");
const layarKuis = $("layar-kuis");
const layarHasil = $("layar-hasil");
const jalurWaktu = $("jalur-waktu");
const isiWaktu = $("isi-waktu");

const teksNomor = $("nomor-soal");
const teksWaktu = $("sisa-waktu");
const wadahSegmen = $("segmen");
const elemenPertanyaan = $("pertanyaan");
const elemenPilihan = $("pilihan");
const umpanBalik = $("umpan-balik");
const tombolLanjut = $("tombol-lanjut");

// ---------- Status kuis ----------
let soalKuis = [];        // soal yang sudah diacak untuk permainan ini
let riwayat = [];         // hasil tiap soal: { status, dipilih }
let indeksSekarang = 0;
let skor = 0;
let sudahMenjawab = false;
let pewaktu = null;       // id dari setInterval
let batasWaktu = 0;       // waktu (ms) saat soal ini habis

// ---------- Fungsi bantu ----------

// Mengacak urutan array (algoritma Fisher-Yates), mengembalikan salinan baru
function acak(daftar) {
  const salinan = [...daftar];
  for (let i = salinan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [salinan[i], salinan[j]] = [salinan[j], salinan[i]];
  }
  return salinan;
}

// Mengisi elemen dengan teks. Bagian di antara tanda ` ` dijadikan <code>.
// Memakai textContent agar tag seperti <a> tampil sebagai teks, bukan dijalankan.
function isiTeks(elemen, teks) {
  elemen.textContent = "";
  teks.split("`").forEach(function (bagian, i) {
    if (i % 2 === 1) {
      const kode = document.createElement("code");
      kode.textContent = bagian;
      elemen.append(kode);
    } else {
      elemen.append(bagian);
    }
  });
}

// Membaca dan menyimpan skor terbaik di browser (localStorage)
function bacaTerbaik() {
  try {
    const angka = Number(localStorage.getItem(KUNCI_TERBAIK));
    return angka > 0 ? angka : null;
  } catch (e) {
    return null;
  }
}

function simpanTerbaik(angka) {
  try {
    localStorage.setItem(KUNCI_TERBAIK, String(angka));
  } catch (e) {
    // Abaikan jika penyimpanan tidak tersedia
  }
}

// Menampilkan satu layar dan menyembunyikan yang lain
function tampilkanLayar(layar) {
  [layarMulai, layarKuis, layarHasil].forEach(function (l) {
    l.hidden = l !== layar;
  });
  jalurWaktu.hidden = layar !== layarKuis;
}

// ---------- Kotak penanda kemajuan ----------
function buatSegmen() {
  wadahSegmen.innerHTML = "";
  soalKuis.forEach(function () {
    const butir = document.createElement("span");
    butir.className = "segmen-butir";
    wadahSegmen.appendChild(butir);
  });
}

function perbaruiSegmen() {
  Array.from(wadahSegmen.children).forEach(function (butir, i) {
    butir.className = "segmen-butir";
    if (riwayat[i]) {
      butir.classList.add(riwayat[i].status); // benar, salah, atau waktu
    } else if (i === indeksSekarang) {
      butir.classList.add("aktif");
    }
  });
}

// ---------- Pewaktu ----------
function mulaiPewaktu() {
  hentikanPewaktu();
  batasWaktu = Date.now() + DETIK_PER_SOAL * 1000;
  perbaruiPewaktu();
  pewaktu = setInterval(perbaruiPewaktu, 100);
}

function hentikanPewaktu() {
  clearInterval(pewaktu);
  pewaktu = null;
}

function perbaruiPewaktu() {
  const sisa = Math.max(0, batasWaktu - Date.now());
  const detik = Math.ceil(sisa / 1000);
  const mendesak = detik <= 5;

  isiWaktu.style.width = (sisa / (DETIK_PER_SOAL * 1000)) * 100 + "%";
  teksWaktu.textContent = detik + " dtk";
  isiWaktu.classList.toggle("mendesak", mendesak);
  teksWaktu.classList.toggle("mendesak", mendesak);

  // Waktu habis dihitung sebagai tidak menjawab (null)
  if (sisa === 0) {
    jawab(null);
  }
}

// ---------- Alur kuis ----------

// Menyiapkan permainan baru: acak soal dan acak pilihan tiap soal
function mulaiKuis() {
  soalKuis = acak(bankSoal).map(function (soal) {
    return {
      pertanyaan: soal.pertanyaan,
      pembahasan: soal.pembahasan,
      kode: soal.kode,
      // Setiap opsi dibungkus agar tetap ingat mana yang benar setelah diacak
      pilihan: acak(
        soal.pilihan.map(function (teks, i) {
          return { teks: teks, benar: i === soal.jawabanBenar };
        })
      )
    };
  });

  riwayat = [];
  indeksSekarang = 0;
  skor = 0;

  buatSegmen();
  tampilkanLayar(layarKuis);
  tampilkanSoal();
}

// Menampilkan soal ke-indeksSekarang
function tampilkanSoal() {
  const soal = soalKuis[indeksSekarang];
  sudahMenjawab = false;

  teksNomor.textContent = "Soal " + (indeksSekarang + 1) + " dari " + soalKuis.length;
  isiTeks(elemenPertanyaan, soal.pertanyaan);

  elemenPilihan.innerHTML = "";
  soal.pilihan.forEach(function (pilihan, i) {
    const tombol = document.createElement("button");
    tombol.type = "button";
    tombol.className = "opsi";

    const lencana = document.createElement("span");
    lencana.className = "lencana";
    lencana.setAttribute("aria-hidden", "true");
    lencana.textContent = i + 1;

    const teks = document.createElement("span");
    teks.className = "teks-opsi" + (soal.kode ? " kode" : "");
    teks.textContent = pilihan.teks;

    tombol.append(lencana, teks);
    tombol.addEventListener("click", function () {
      jawab(i);
    });
    elemenPilihan.appendChild(tombol);
  });

  // Bersihkan umpan balik soal sebelumnya
  umpanBalik.textContent = "";
  umpanBalik.className = "umpan-balik";
  tombolLanjut.hidden = true;

  perbaruiSegmen();
  mulaiPewaktu();
}

// Memproses jawaban. indeksDipilih bernilai null jika waktu habis.
function jawab(indeksDipilih) {
  if (sudahMenjawab) return; // cegah jawaban ganda
  sudahMenjawab = true;
  hentikanPewaktu();

  const soal = soalKuis[indeksSekarang];
  const tombol = Array.from(elemenPilihan.children);
  const indeksBenar = soal.pilihan.findIndex(function (p) {
    return p.benar;
  });

  // Nonaktifkan semua pilihan
  tombol.forEach(function (t) {
    t.disabled = true;
  });

  // Tandai jawaban yang benar
  tombol[indeksBenar].classList.add("benar");
  tombol[indeksBenar].querySelector(".lencana").textContent = "✓";

  // Tentukan status: benar, salah, atau waktu habis
  let status;
  if (indeksDipilih === null) {
    status = "waktu";
  } else if (soal.pilihan[indeksDipilih].benar) {
    status = "benar";
    skor++;
  } else {
    status = "salah";
    tombol[indeksDipilih].classList.add("salah");
    tombol[indeksDipilih].querySelector(".lencana").textContent = "✗";
  }

  riwayat[indeksSekarang] = { status: status, dipilih: indeksDipilih };
  perbaruiSegmen();
  tampilkanUmpanBalik(status, soal, indeksBenar);

  // Teks tombol lanjut berubah di soal terakhir
  const soalTerakhir = indeksSekarang === soalKuis.length - 1;
  tombolLanjut.textContent = soalTerakhir ? "Lihat hasil" : "Soal berikutnya";
  tombolLanjut.hidden = false;
  tombolLanjut.focus(); // memudahkan pengguna keyboard
}

// Menampilkan penjelasan setelah menjawab
function tampilkanUmpanBalik(status, soal, indeksBenar) {
  const judul = { benar: "Benar.", salah: "Kurang tepat.", waktu: "Waktu habis." }[status];

  umpanBalik.textContent = "";
  umpanBalik.className = "umpan-balik " + status;

  const barisJudul = document.createElement("p");
  barisJudul.className = "umpan-judul";
  barisJudul.textContent = judul;
  umpanBalik.append(barisJudul);

  // Untuk jawaban salah, sebutkan juga jawaban yang benar (tidak hanya lewat warna)
  if (status !== "benar") {
    const barisBenar = document.createElement("p");
    barisBenar.textContent = "Jawaban yang benar: " + soal.pilihan[indeksBenar].teks;
    umpanBalik.append(barisBenar);
  }

  const barisPembahasan = document.createElement("p");
  isiTeks(barisPembahasan, soal.pembahasan);
  umpanBalik.append(barisPembahasan);
}

// Pindah ke soal berikutnya, atau ke hasil jika soal habis
tombolLanjut.addEventListener("click", function () {
  indeksSekarang++;
  if (indeksSekarang < soalKuis.length) {
    tampilkanSoal();
  } else {
    tampilkanHasil();
  }
});

// ---------- Layar hasil ----------
function tampilkanHasil() {
  hentikanPewaktu();
  tampilkanLayar(layarHasil);

  const total = soalKuis.length;
  const persen = (skor / total) * 100;

  $("angka-skor").textContent = skor;
  $("total-skor").textContent = "dari " + total;

  let pesan;
  if (persen === 100) {
    pesan = "Sempurna. Semua jawabanmu benar.";
  } else if (persen >= 80) {
    pesan = "Sangat baik. Tinggal sedikit lagi.";
  } else if (persen >= 60) {
    pesan = "Cukup baik. Ulangi soal yang salah di bawah ini.";
  } else {
    pesan = "Pelajari lagi materinya, lalu coba ulang.";
  }
  $("pesan-hasil").textContent = pesan;

  // Skor terbaik
  const terbaikLama = bacaTerbaik();
  if (terbaikLama === null || skor > terbaikLama) {
    simpanTerbaik(skor);
    $("info-terbaik").textContent =
      terbaikLama === null ? "Skor ini tersimpan sebagai skor terbaikmu." : "Rekor baru. Skor sebelumnya: " + terbaikLama + ".";
  } else {
    $("info-terbaik").textContent = "Skor terbaikmu: " + terbaikLama + " dari " + total + ".";
  }

  tampilkanUlasan();
  $("judul-hasil").focus();
}

// Menampilkan daftar soal yang salah atau tidak sempat dijawab
function tampilkanUlasan() {
  const daftar = $("daftar-ulasan");
  daftar.innerHTML = "";

  soalKuis.forEach(function (soal, i) {
    const hasil = riwayat[i];
    if (hasil.status === "benar") return;

    const butir = document.createElement("li");

    const pertanyaan = document.createElement("div");
    pertanyaan.className = "ulasan-pertanyaan";
    isiTeks(pertanyaan, soal.pertanyaan);

    const jawabanmu = document.createElement("p");
    jawabanmu.className = "ulasan-baris";
    jawabanmu.textContent =
      hasil.dipilih === null
        ? "Jawabanmu: tidak dijawab (waktu habis)"
        : "Jawabanmu: " + soal.pilihan[hasil.dipilih].teks;

    const jawabanBenar = document.createElement("p");
    jawabanBenar.className = "ulasan-baris";
    const label = document.createElement("strong");
    label.textContent = "Jawaban yang benar: ";
    const benar = soal.pilihan.find(function (p) {
      return p.benar;
    });
    jawabanBenar.append(label, benar.teks);

    butir.append(pertanyaan, jawabanmu, jawabanBenar);
    daftar.appendChild(butir);
  });

  // Sembunyikan bagian ulasan jika semua jawaban benar
  $("bagian-ulasan").hidden = daftar.children.length === 0;
}

// ---------- Tombol dan keyboard ----------
$("tombol-mulai").addEventListener("click", mulaiKuis);
$("tombol-ulang").addEventListener("click", mulaiKuis);

document.addEventListener("keydown", function (e) {
  if (layarKuis.hidden || e.ctrlKey || e.metaKey || e.altKey) return;

  // Angka 1 sampai 4 memilih jawaban
  if (!sudahMenjawab && e.key >= "1" && e.key <= "4") {
    const tombol = elemenPilihan.children[Number(e.key) - 1];
    if (tombol) tombol.click();
    return;
  }

  // Enter melanjutkan setelah menjawab (kecuali fokus sudah di tombol lanjut,
  // karena tombol itu sudah merespons Enter sendiri)
  if (e.key === "Enter" && sudahMenjawab && document.activeElement !== tombolLanjut) {
    tombolLanjut.click();
  }
});

// ---------- Mulai ----------
// Tampilkan skor terbaik di layar awal jika ada
(function () {
  const terbaik = bacaTerbaik();
  if (terbaik !== null) {
    const catatan = $("skor-terbaik-mulai");
    catatan.textContent = "Skor terbaikmu: " + terbaik + " dari " + bankSoal.length + ".";
    catatan.hidden = false;
  }
})();