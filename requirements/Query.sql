-- 1. Buat Database Baru
CREATE DATABASE IF NOT EXISTS `db_absensi_mtsn2`;
USE `db_absensi_mtsn2`;

-- 2. Buat Tabel Kelas
CREATE TABLE `kelas` (
  `id_kelas` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_kelas` VARCHAR(10) NOT NULL
);

INSERT INTO `kelas` (`id_kelas`, `nama_kelas`) VALUES 
(1, '7A'), (2, '7B'), (3, '8A');

-- 3. Buat Tabel Wali Kelas (Pengguna)
CREATE TABLE `users_guru` (
  `id_guru` INT AUTO_INCREMENT PRIMARY KEY,
  `nip` VARCHAR(20) NOT NULL UNIQUE,
  `nama_guru` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `id_kelas` INT,
  FOREIGN KEY (`id_kelas`) REFERENCES `kelas`(`id_kelas`) ON DELETE SET NULL
);

-- Akun Default (Password: password123)
INSERT INTO `users_guru` (`id_guru`, `nip`, `nama_guru`, `password`, `id_kelas`) VALUES
(1, '198503152010121002', 'Bpk. Ahmad Rosyid, S.Pd', 'password123', 1),
(2, '199001012015031001', 'Ibu Siti Aminah, M.Pd', 'password123', 2);

-- 4. Buat Tabel Siswa
CREATE TABLE `siswa` (
  `id_siswa` INT AUTO_INCREMENT PRIMARY KEY,
  `nisn` VARCHAR(15) NOT NULL UNIQUE,
  `nama_siswa` VARCHAR(100) NOT NULL,
  `id_fingerprint` INT UNIQUE,
  `id_kelas` INT NOT NULL,
  FOREIGN KEY (`id_kelas`) REFERENCES `kelas`(`id_kelas`) ON DELETE CASCADE
);

INSERT INTO `siswa` (`id_siswa`, `nisn`, `nama_siswa`, `id_fingerprint`, `id_kelas`) VALUES
(1, '0081234561', 'Muhammad Rizky', 1, 1),
(2, '0081234562', 'Siti Nurhaliza', 2, 1),
(3, '0081234563', 'Farhan Ramadhan', 3, 1),
(4, '0081234564', 'Annisa Pertiwi', 4, 1),
(5, '0081234565', 'Bagus Setiawan', 5, 1),
(6, '0081234566', 'Dewi Lestari', 6, 2);

-- 5. Buat Tabel Presensi Harian
CREATE TABLE `presensi` (
  `id_presensi` INT AUTO_INCREMENT PRIMARY KEY,
  `id_siswa` INT NOT NULL,
  `tanggal` DATE NOT NULL,
  `waktu_masuk` TIME DEFAULT NULL,
  `status` ENUM('Hadir', 'Sakit', 'Izin', 'Alfa') DEFAULT 'Alfa',
  `keterangan` TEXT,
  `sumber_data` VARCHAR(50) DEFAULT 'Input Wali Kelas',
  FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE CASCADE
);

-- Sample Data Presensi Hari Ini
INSERT INTO `presensi` (`id_siswa`, `tanggal`, `waktu_masuk`, `status`, `keterangan`, `sumber_data`) VALUES
(1, CURDATE(), '06:58:12', 'Hadir', 'Tercatat Otomatis', 'IoT Sensor ID #1'),
(2, CURDATE(), '07:05:40', 'Hadir', 'Tercatat Otomatis', 'IoT Sensor ID #2'),
(3, CURDATE(), NULL, 'Sakit', 'Surat Izin Dokter Diserahkan', 'Input Wali Kelas'),
(4, CURDATE(), NULL, 'Izin', 'Acara Keluarga', 'Input Wali Kelas'),
(5, CURDATE(), NULL, 'Alfa', 'Belum Ada Keterangan', 'Input Wali Kelas');
