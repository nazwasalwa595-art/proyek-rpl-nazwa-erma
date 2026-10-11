<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$db   = 'db_absensi_mtsn2';
$user = 'root';
$pass = ''; // Default Laragon password kosong

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Koneksi Database Gagal']));
}

$action = $_GET['action'] ?? '';

// 1. LOGIN WALI KELAS
if ($action === 'login') {
    $nip = $_POST['nip'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $conn->prepare("SELECT u.id_guru, u.nama_guru, u.nip, u.id_kelas, k.nama_kelas 
                            FROM users_guru u 
                            LEFT JOIN kelas k ON u.id_kelas = k.id_kelas 
                            WHERE u.nip = ? AND u.password = ?");
    $stmt->bind_param("ss", $nip, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode(['status' => 'success', 'data' => $row]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'NIP atau Password salah!']);
    }
}

// 2. AMBIL DATA PRESENSI SESUAI KELAS WALI KELAS
else if ($action === 'get_presensi') {
    $id_kelas = $_GET['id_kelas'] ?? 0;
    
    $query = "SELECT s.id_siswa, s.nisn, s.nama_siswa, 
                     IFNULL(p.waktu_masuk, '-') AS waktu, 
                     IFNULL(p.status, 'Alfa') AS status, 
                     IFNULL(p.sumber_data, 'Input Wali Kelas') AS sumber, 
                     IFNULL(p.keterangan, '-') AS ket
              FROM siswa s
              LEFT JOIN presensi p ON s.id_siswa = p.id_siswa AND p.tanggal = CURDATE()
              WHERE s.id_kelas = ?
              ORDER BY s.nama_siswa ASC";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id_kelas);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(['status' => 'success', 'data' => $data]);
}

// 3. UPDATE STATUS PRESENSI (EDIT SAKIT/IZIN/ALFA/HADIR)
else if ($action === 'update_status') {
    $id_siswa = $_POST['id_siswa'] ?? 0;
    $status = $_POST['status'] ?? 'Alfa';
    $ket = $_POST['keterangan'] ?? '';

    // Cek apakah data presensi hari ini sudah ada
    $check = $conn->prepare("SELECT id_presensi FROM presensi WHERE id_siswa = ? AND tanggal = CURDATE()");
    $check->bind_param("i", $id_siswa);
    $check->execute();
    $res = $check->get_result();

    if ($res->num_rows > 0) {
        $stmt = $conn->prepare("UPDATE presensi SET status = ?, keterangan = ?, sumber_data = 'Input Wali Kelas' WHERE id_siswa = ? AND tanggal = CURDATE()");
        $stmt->bind_param("ssi", $status, $ket, $id_siswa);
    } else {
        $stmt = $conn->prepare("INSERT INTO presensi (id_siswa, tanggal, status, keterangan, sumber_data) VALUES (?, CURDATE(), ?, ?, 'Input Wali Kelas')");
        $stmt->bind_param("iss", $id_siswa, $status, $ket);
    }

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Status berhasil diperbarui']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui status']);
    }
}

// 4. TAMBAH SISWA BARU
else if ($action === 'add_student') {
    $nisn = $_POST['nisn'] ?? '';
    $nama = $_POST['nama_siswa'] ?? '';
    $finger_id = $_POST['id_fingerprint'] ?? 0;
    $id_kelas = $_POST['id_kelas'] ?? 0;

    $stmt = $conn->prepare("INSERT INTO siswa (nisn, nama_siswa, id_fingerprint, id_kelas) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssii", $nisn, $nama, $finger_id, $id_kelas);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Siswa berhasil ditambahkan']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'NISN atau ID Fingerprint sudah terdaftar']);
    }
}
?>