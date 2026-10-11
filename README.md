Sistem Absensi MTsN 2

Aplikasi manajemen absensi siswa/guru berbasis fingersprint yang dikembangkan untuk mempermudah pencatatan kehadiran secara digital dan terstruktur di MTsN 2.

Struktur Folder Proyek

Berikut adalah struktur direktori dan penjelasan isi file dalam proyek ini:

rpl-p7-demo/
├── README.md             # Dokumen penjelasan dan panduan proyek
├── .gitignore            # Daftar file/folder yang diabaikan oleh Git
├── requirements/         # Berkas spesifikasi kebutuhan & basis data
│   ├── Query.sql         # Script pembuatan dan struktur tabel database SQL
│   ├── srs.txt           # Dokumen Software Requirements Specification
│   └── erma_.txt         # Catatan/persyaratan tambahan kelompok
├── src/                  # Kode sumber (Source Code) utama aplikasi
│   ├── index.html        # Antarmuka pengguna (UI) utama aplikasi
│   ├── style.css         # Berkas stylesheet untuk tampilan web
│   ├── script.js         # Logika JavaScript di sisi client
│   └── api.php           # Backend script untuk pemrosesan data & database
├── test/                 # Berkas skrip pengujian unit/sistem
└── uml/                  # Diagram pemodelan arsitektur & alur sistem (UML)


Teknologi yang Digunakan

Frontend: HTML5, CSS3, JavaScript (Vanilla JS)

Backend: PHP (API Services)

Database: MySQL / MariaDB (Query.sql)

Environment: Laragon / XAMPP

Anggota Kelompok / Kontributor

Nazwa - Pengembang Frontend & Pengelolaan Repositori Git

Erma - Pengembang Backend & Dokumentasi Kebutuhan

Cara Menjalankan Proyek Secara Lokal

Salin seluruh folder src/ dan file requirements/Query.sql ke direktori web server (misalnya C:\laragon\www\absensi-mtsn2).

Impor berkas Query.sql di folder requirements/ ke dalam database MySQL via phpMyAdmin / HeidiSQL.

Jalankan server lokal (Laragon / XAMPP).

Buka peramban (browser) dan akses http://localhost/absensi-mtsn2/src/index.html.