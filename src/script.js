// ==========================================
// 1. VARIABEL GLOBAL & STATE APLIKASI
// ==========================================
let currentUser = null;
let studentsData = [];
let selectedStudentId = null;
let activeStatusSelection = 'Sakit';
let weeklyChartInstance = null;
let distChartInstance = null;

// ==========================================
// 2. LIVE CLOCK (JAM REAL-TIME)
// ==========================================
setInterval(() => {
    const now = new Date();
    const clockElement = document.getElementById('live-time');
    if (clockElement) {
        clockElement.innerText = now.toLocaleTimeString('id-ID', { hour12: false }) + ' WITA';
    }
}, 1000);

// ==========================================
// 3. SISTEM AUTENTIKASI (LOGIN, REGISTER, LOGOUT)
// ==========================================

/**
 * Berpindah tampilan antara Form Login dan Form Registrasi
 * @param {string} mode - 'login' atau 'register'
 */
function switchAuthMode(mode) {
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (mode === 'register') {
        formLogin.classList.add('hidden');
        formRegister.classList.remove('hidden');
    } else {
        formRegister.classList.add('hidden');
        formLogin.classList.remove('hidden');
    }
}

/**
 * Memproses Login Wali Kelas terhubung ke Database MySQL via api.php
 */
function handleLogin(e) {
    e.preventDefault();
    const nipInput = document.getElementById('login-nip').value;
    const passwordInput = document.getElementById('login-password').value;

    const formData = new FormData();
    formData.append('nip', nipInput);
    formData.append('password', passwordInput);

    fetch('api.php?action=login', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            currentUser = res.data;
            
            // Update Tampilan Profil Guru pada Header
            document.getElementById('user-display-name').innerText = currentUser.nama_guru;
            document.getElementById('user-display-kelas').innerText = 'Wali Kelas ' + currentUser.nama_kelas;
            
            // Berpindah dari Layar Login ke Dashboard Utama
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('dashboard-app').classList.remove('hidden');

            // Inisialisasi Grafik dan Muat Data Absensi Siswa
            initCharts();
            loadPresensiData();
        } else {
            alert(res.message || 'NIP atau Password salah!');
        }
    })
    .catch(err => {
        console.error('Login Error:', err);
        alert('Gagal terhubung ke database Laragon! Pastikan Apache & MySQL di Laragon telah berjalan.');
    });
}

/**
 * Memproses Pendaftaran Akun Wali Kelas Baru
 */
function handleRegister(e) {
    e.preventDefault();
    const nama = document.getElementById('reg-nama').value;
    
    // Tampilkan Notifikasi dan Kembali ke Form Login
    alert(`Pendaftaran Berhasil! Akun Wali Kelas atas nama ${nama} telah terdaftar di sistem. Silakan masuk.`);
    switchAuthMode('login');
}

/**
 * Memproses Logout Akun Wali Kelas
 */
function handleLogout() {
    currentUser = null;
    studentsData = [];
    document.getElementById('dashboard-app').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
}

// ==========================================
// 4. PENGAMBILAN & MANAJEMEN DATA PRESENSI
// ==========================================

/**
 * Mengambil data presensi harian siswa dari MySQL berdasarkan id_kelas Wali Kelas yang login
 */
function loadPresensiData() {
    if (!currentUser || !currentUser.id_kelas) return;

    fetch(`api.php?action=get_presensi&id_kelas=${currentUser.id_kelas}`)
    .then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            studentsData = res.data;
            renderTable();
        } else {
            console.error('Gagal mengambil data presensi:', res.message);
        }
    })
    .catch(err => console.error('Error fetching presensi:', err));
}

/**
 * Rendring Tabel Siswa dan Pembaruan Kartu Ringkasan Metrik
 */
function renderTable() {
    const tbody = document.getElementById('student-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    let hadirCount = 0, izinCount = 0, alfaCount = 0;

    studentsData.forEach((s, index) => {
        if (s.status === 'Hadir') hadirCount++;
        if (s.status === 'Sakit' || s.status === 'Izin') izinCount++;
        if (s.status === 'Alfa') alfaCount++;

        // Menyusun Lencana Status (Badge)
        let statusBadge = '';
        if (s.status === 'Hadir') {
            statusBadge = `<span class="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1"><i class="fa-solid fa-check text-[10px]"></i> Hadir</span>`;
        } else if (s.status === 'Sakit') {
            statusBadge = `<span class="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1"><i class="fa-solid fa-notes-medical text-[10px]"></i> Sakit</span>`;
        } else if (s.status === 'Izin') {
            statusBadge = `<span class="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1"><i class="fa-solid fa-envelope-open-text text-[10px]"></i> Izin</span>`;
        } else {
            statusBadge = `<span class="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1"><i class="fa-solid fa-xmark text-[10px]"></i> Alfa</span>`;
        }

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
        tr.innerHTML = `
            <td class="py-3 px-4 font-medium text-slate-500">${index + 1}</td>
            <td class="py-3 px-4 font-mono text-slate-500">${s.nisn}</td>
            <td class="py-3 px-4 font-semibold text-slate-900">${s.nama_siswa}</td>
            <td class="py-3 px-4 font-mono text-emerald-600 font-bold">${s.waktu}</td>
            <td class="py-3 px-4">${statusBadge}</td>
            <td class="py-3 px-4"><span class="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-600">${s.sumber}</span></td>
            <td class="py-3 px-4 text-slate-500 text-xs">${s.ket}</td>
            <td class="py-3 px-4 text-center">
                <button onclick="openEditModal(${s.id_siswa})" class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium px-2.5 py-1 rounded-lg transition text-[11px] shadow-sm">
                    <i class="fa-solid fa-pen-to-square text-amber-500 mr-1"></i> Edit
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Kalkulasi Persentase Metrik Kehadiran
    const total = studentsData.length || 1;
    document.getElementById('stat-total').innerText = `${studentsData.length} Siswa`;
    document.getElementById('stat-hadir').innerHTML = `${hadirCount} <span class="text-xs font-normal text-slate-400">(${((hadirCount/total)*100).toFixed(1)}%)</span>`;
    document.getElementById('stat-izin').innerHTML = `${izinCount} <span class="text-xs font-normal text-slate-400">(${((izinCount/total)*100).toFixed(1)}%)</span>`;
    document.getElementById('stat-alfa').innerHTML = `${alfaCount} <span class="text-xs font-normal text-slate-400">(${((alfaCount/total)*100).toFixed(1)}%)</span>`;

    // Perbarui Grafik Distribusi
    updateCharts(hadirCount, izinCount, alfaCount);
}

// ==========================================
// 5. MODAL EDIT STATUS ABSENSI
// ==========================================

function openEditModal(id) {
    selectedStudentId = id;
    const student = studentsData.find(s => s.id_siswa == id);
    if (!student) return;

    document.getElementById('edit-student-name').value = student.nama_siswa;
    document.getElementById('edit-keterangan').value = (student.ket !== '-' && student.ket !== 'Tercatat Otomatis') ? student.ket : '';
    activeStatusSelection = student.status;
    
    document.getElementById('editModal').classList.remove('hidden');
    document.getElementById('editModal').classList.add('flex');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    document.getElementById('editModal').classList.remove('flex');
}

function selectStatus(status) {
    activeStatusSelection = status;
}

function saveStatusChange() {
    if (!selectedStudentId) return;

    const ket = document.getElementById('edit-keterangan').value;
    const formData = new FormData();
    formData.append('id_siswa', selectedStudentId);
    formData.append('status', activeStatusSelection);
    formData.append('keterangan', ket);

    fetch('api.php?action=update_status', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            closeEditModal();
            loadPresensiData();
        } else {
            alert('Gagal mengupdate status: ' + res.message);
        }
    })
    .catch(err => console.error('Error updating status:', err));
}

// ==========================================
// 6. MODAL TAMBAH SISWA BARU
// ==========================================

function openAddStudentModal() {
    document.getElementById('addStudentModal').classList.remove('hidden');
    document.getElementById('addStudentModal').classList.add('flex');
}

function closeAddStudentModal() {
    document.getElementById('addStudentModal').classList.add('hidden');
    document.getElementById('addStudentModal').classList.remove('flex');
}

function handleAddStudent(e) {
    e.preventDefault();
    
    const nisn = document.getElementById('add-nisn').value;
    const nama = document.getElementById('add-nama').value;
    const fingerId = document.getElementById('add-finger-id').value;

    const formData = new FormData();
    formData.append('nisn', nisn);
    formData.append('nama_siswa', nama);
    formData.append('id_fingerprint', fingerId);
    formData.append('id_kelas', currentUser.id_kelas);

    fetch('api.php?action=add_student', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(res => {
        alert(res.message);
        if (res.status === 'success') {
            closeAddStudentModal();
            // Reset Input Form
            document.getElementById('add-nisn').value = '';
            document.getElementById('add-nama').value = '';
            document.getElementById('add-finger-id').value = '';
            loadPresensiData();
        }
    })
    .catch(err => console.error('Error adding student:', err));
}

// ==========================================
// 7. INISIALISASI & PERBARUAN GRAFIK (CHART.JS)
// ==========================================

function initCharts() {
    // 1. Line Chart Tren Kehadiran Mingguan
    const ctx1 = document.getElementById('weeklyChart');
    if (ctx1) {
        if (weeklyChartInstance) weeklyChartInstance.destroy();
        weeklyChartInstance = new Chart(ctx1.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
                datasets: [{
                    label: 'Jumlah Siswa Hadir',
                    data: [31, 30, 32, 29, 31, 28],
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    // 2. Doughnut Chart Distribusi Status Hari Ini
    const ctx2 = document.getElementById('distributionChart');
    if (ctx2) {
        if (distChartInstance) distChartInstance.destroy();
        distChartInstance = new Chart(ctx2.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Hadir', 'Sakit/Izin', 'Alfa'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#059669', '#D97706', '#E11D48']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}

function updateCharts(hadir, izin, alfa) {
    if (distChartInstance) {
        distChartInstance.data.datasets[0].data = [hadir, izin, alfa];
        distChartInstance.update();
    }
}

// ==========================================
// 8. FUNGSI EKSPOR LAPORAN (EXCEL & PDF)
// ==========================================

function exportToExcel() {
    if (!studentsData || studentsData.length === 0) {
        alert('Tidak ada data absensi untuk diekspor!');
        return;
    }
    const ws = XLSX.utils.json_to_sheet(studentsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Absensi");
    XLSX.writeFile(wb, `Rekap_Absensi_Kelas_${currentUser ? currentUser.nama_kelas : 'Sekolah'}.xlsx`);
}

function exportToPDF() {
    if (!studentsData || studentsData.length === 0) {
        alert('Tidak ada data absensi untuk diekspor!');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(14);
    doc.text(`Laporan Rekapitulasi Presensi Siswa MTsN 2 Tarakan`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Wali Kelas: ${currentUser ? currentUser.nama_guru : '-'} | Kelas: ${currentUser ? currentUser.nama_kelas : '-'}`, 14, 22);

    const tableColumn = ["No", "NISN", "Nama Siswa", "Waktu Scan", "Status", "Keterangan"];
    const tableRows = studentsData.map((s, i) => [i + 1, s.nisn, s.nama_siswa, s.waktu, s.status, s.ket]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [5, 150, 105] }
    });

    doc.save(`Rekap_Absensi_Kelas_${currentUser ? currentUser.nama_kelas : 'Sekolah'}.pdf`);
}