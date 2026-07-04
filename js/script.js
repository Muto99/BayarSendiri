// ============================================
// BayarSendiri - Complete Application Script
// Saldo Default: Rp15.000.000
// ============================================

(function() {
  'use strict';

  // ========== STATE MANAGEMENT ==========
  const STORAGE_KEY = 'bayarsendiri_state';
  
  const defaultState = {
    saldo: 15000000, // Diubah menjadi 15 juta
    user: {
      nama: 'Mugi Yanto',
      email: 'mugi.gokil99@gmail.com',
      phone: '085939752033'
    },
    transactions: [],
    darkMode: false
  };

  let appState = JSON.parse(JSON.stringify(defaultState));

  // ========== DOM ELEMENTS ==========
  const mainContent = document.getElementById('mainContent');
  const navItems = document.querySelectorAll('.nav-item');
  const darkToggle = document.getElementById('darkToggle');
  const profileBtn = document.getElementById('profileBtn');
  const darkToggleIcon = darkToggle ? darkToggle.querySelector('i') : null;

  let currentView = 'dashboard';

  // ========== LOCAL STORAGE ==========
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        appState.saldo = parsed.saldo || defaultState.saldo;
        appState.transactions = parsed.transactions || [];
        appState.darkMode = parsed.darkMode || false;
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }

  function saveState() {
    try {
      const stateToSave = {
        saldo: appState.saldo,
        transactions: appState.transactions,
        darkMode: appState.darkMode
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  // ========== UTILITY FUNCTIONS ==========
  function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(angka);
  }

  function generateTransactionId() {
    return 'TRX-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  function generateVANumber(bank) {
    const bankCodes = { bca: '3901', bni: '9881', mandiri: '8900', bri: '1234' };
    const code = bankCodes[bank] || '8888';
    const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    return code + random;
  }

  function generatePaymentCode() {
    return 'BS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  function getCurrentDateTime() {
    return new Date().toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  function showToast(message, type) {
    type = type || 'success';
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<div class="flex items-center gap-2">' +
      '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '"></i>' +
      '<span>' + message + '</span>' +
      '</div>';
    document.body.appendChild(toast);

    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
  }

  function showLoading(message) {
    message = message || 'Memproses...';
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = '<div class="loading-content">' +
      '<div class="spinner"></div>' +
      '<p>' + message + '</p>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
  }

  function showModal(content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal-content">' + content + '</div>';
    document.body.appendChild(overlay);

    const closeModal = function() {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s ease';
      setTimeout(function() { overlay.remove(); }, 200);
    };

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });

    return { overlay: overlay, closeModal: closeModal };
  }

  function addTransaction(type, details) {
    const transaction = {
      id: generateTransactionId(),
      type: type,
      timestamp: getCurrentDateTime(),
      status: 'success'
    };
    
    for (var key in details) {
      if (details.hasOwnProperty(key)) {
        transaction[key] = details[key];
      }
    }
    
    appState.transactions.unshift(transaction);
    saveState();
    return transaction;
  }

  // ========== TAGIHAN DATA ==========
  const tagihanDatabase = {
    '1234567890': {
      nama: 'Budi Santoso',
      alamat: 'Jl. Merdeka No. 123, Jakarta Pusat',
      periode: 'Juni 2026',
      tagihan: 350000,
      denda: 0,
      jatuhTempo: '20 Juli 2026',
      kategori: 'listrik'
    },
    '1234567891': {
      nama: 'Siti Rahayu',
      alamat: 'Jl. Sudirman No. 45, Bandung',
      periode: 'Juni 2026',
      tagihan: 275000,
      denda: 15000,
      jatuhTempo: '15 Juli 2026',
      kategori: 'listrik'
    },
    'PDAM123456': {
      nama: 'Ahmad Dahlan',
      alamat: 'Jl. Ahmad Yani No. 67, Surabaya',
      periode: 'Mei-Juni 2026',
      tagihan: 180000,
      denda: 0,
      jatuhTempo: '25 Juli 2026',
      kategori: 'pdam'
    },
    'INET987654': {
      nama: 'Dian Permata',
      alamat: 'Jl. Gatot Subroto No. 89, Yogyakarta',
      periode: 'Juli 2026',
      tagihan: 450000,
      denda: 25000,
      jatuhTempo: '10 Juli 2026',
      kategori: 'internet'
    },
    'EVT2026001': {
      nama: 'Seminar Tech 2026',
      alamat: 'Gedung Konvensi, Jakarta',
      periode: '15 Agustus 2026',
      tagihan: 500000,
      denda: 0,
      jatuhTempo: '1 Agustus 2026',
      kategori: 'event'
    }
  };

  // ========== SPP DATA ==========
  const sppDatabase = {
    '123456789012': {
      nama: 'Mahasiswa Demo',
      prodi: 'Teknik Informatika',
      semester: 'Ganjil 2025/2026',
      cicilan: [
        { no: 1, kode: '986248962486438', deskripsi: 'SPP Semester Ganjil 2025/2026 - Cicilan ke-1', jumlah: 500000, status: 'belum_lunas' },
        { no: 2, kode: '986248962486439', deskripsi: 'SPP Semester Ganjil 2025/2026 - Cicilan ke-2', jumlah: 500000, status: 'belum_lunas' },
        { no: 3, kode: '986248962486440', deskripsi: 'SPP Semester Ganjil 2025/2026 - Cicilan ke-3', jumlah: 500000, status: 'lunas' },
        { no: 4, kode: '986248962486441', deskripsi: 'Biaya Praktikum Laboratorium', jumlah: 750000, status: 'belum_lunas' },
        { no: 5, kode: '986248962486442', deskripsi: 'Biaya UTS Semester Ganjil 2025/2026', jumlah: 300000, status: 'belum_lunas' },
        { no: 6, kode: '986248962486443', deskripsi: 'Biaya UAS Semester Ganjil 2025/2026', jumlah: 300000, status: 'belum_lunas' },
        { no: 7, kode: '986248962486444', deskripsi: 'Biaya Kegiatan Mahasiswa', jumlah: 200000, status: 'belum_lunas' },
        { no: 8, kode: '986248962486445', deskripsi: 'Biaya Perpustakaan', jumlah: 150000, status: 'lunas' }
      ]
    }
  };

  // ========== NAVIGATION ==========
  function setActiveNav(view) {
    navItems.forEach(function(btn) {
      btn.classList.remove('active');
      if (btn.dataset.view === view) {
        btn.classList.add('active');
      }
    });
  }

  function navigateTo(view) {
    currentView = view;
    setActiveNav(view);
    renderView(view);
    mainContent.scrollTop = 0;
  }

  // ========== VIEW RENDERERS ==========
  function renderView(view) {
    if (!mainContent) return;
    
    switch (view) {
      case 'dashboard': renderDashboard(); break;
      case 'tagihan': renderTagihan(); break;
      case 'spp': renderSPP(); break;
      case 'pulsa': renderPulsa(); break;
      case 'riwayat': renderRiwayat(); break;
      default: renderDashboard();
    }
  }

  function renderDashboard() {
    mainContent.innerHTML = 
      '<div class="saldo-card">' +
        '<div style="font-size:0.85rem;opacity:0.9;">💳 Saldo Digital</div>' +
        '<div style="font-size:2.2rem;font-weight:700;margin:8px 0;">' + formatRupiah(appState.saldo) + '</div>' +
        '<div style="font-size:0.8rem;opacity:0.85;"><i class="far fa-credit-card"></i> BayarSendiri Pay</div>' +
      '</div>' +
      '<div class="promo-banner">' +
        '<i class="fas fa-gift fa-2x"></i>' +
        '<div><strong>Promo Spesial!</strong><br>Cashback 5% untuk tagihan listrik pertama.</div>' +
      '</div>' +
      '<h4 style="margin:16px 0 12px;">Layanan Cepat</h4>' +
      '<div class="grid-2">' +
        '<div class="service-btn" data-go="tagihan"><i class="fas fa-bolt"></i><span>Listrik PLN</span></div>' +
        '<div class="service-btn" data-go="tagihan"><i class="fas fa-water"></i><span>PDAM</span></div>' +
        '<div class="service-btn" data-go="pulsa"><i class="fas fa-mobile-alt"></i><span>Pulsa</span></div>' +
        '<div class="service-btn" data-go="spp"><i class="fas fa-graduation-cap"></i><span>Kuliah</span></div>' +
      '</div>';

    document.querySelectorAll('.service-btn[data-go]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        navigateTo(e.currentTarget.dataset.go);
      });
    });
  }

  // ========== TAGIHAN VIEW ==========
  function renderTagihan() {
    mainContent.innerHTML = 
      '<h3 style="margin-bottom:20px;"><i class="fas fa-file-invoice" style="color:var(--primary);"></i> Bayar Tagihan</h3>' +
      '<div class="form-group">' +
        '<label>Kategori Tagihan</label>' +
        '<select id="kategoriTagihan">' +
          '<option value="listrik">⚡ Listrik (PLN)</option>' +
          '<option value="pdam">💧 PDAM</option>' +
          '<option value="internet">🌐 Internet</option>' +
          '<option value="event">🎫 Seminar/Event</option>' +
        '</select>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>Nomor Pelanggan / ID / No. Referensi</label>' +
        '<input type="text" id="idPelanggan" placeholder="Masukkan nomor pelanggan">' +
        '<small style="color:var(--text-soft);margin-top:4px;display:block;">' +
          '📝 <b>ID Demo:</b> 1234567890 (Listrik), PDAM123456, INET987654, EVT2026001</small>' +
      '</div>' +
      '<button class="btn" id="btnCekTagihan"><i class="fas fa-search"></i> Cek Tagihan</button>' +
      '<div id="tagihanResult" class="mt-4"></div>' +
      '<div id="paymentSection" class="hidden"></div>';

    document.getElementById('btnCekTagihan').addEventListener('click', handleCekTagihan);
  }

  function handleCekTagihan() {
    var kategori = document.getElementById('kategoriTagihan').value;
    var idPelanggan = document.getElementById('idPelanggan').value.trim();
    var resultDiv = document.getElementById('tagihanResult');
    var paymentSection = document.getElementById('paymentSection');

    resultDiv.innerHTML = '';
    paymentSection.classList.add('hidden');

    if (!idPelanggan || idPelanggan.length < 8) {
      resultDiv.innerHTML = '<p class="text-danger">Nomor pelanggan minimal 8 karakter</p>';
      return;
    }

    if (kategori === 'listrik' && !/^\d+$/.test(idPelanggan)) {
      resultDiv.innerHTML = '<p class="text-danger">Untuk listrik, hanya angka yang diperbolehkan</p>';
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(idPelanggan)) {
      resultDiv.innerHTML = '<p class="text-danger">Hanya huruf dan angka yang diperbolehkan</p>';
      return;
    }

    var tagihanData = tagihanDatabase[idPelanggan];

    if (!tagihanData) {
      resultDiv.innerHTML = '<p class="text-danger">Data tidak ditemukan. Gunakan ID demo: 1234567890, PDAM123456, INET987654, EVT2026001</p>';
      return;
    }

    if (tagihanData.kategori !== kategori) {
      resultDiv.innerHTML = '<p class="text-danger">ID ini untuk kategori ' + tagihanData.kategori.toUpperCase() + '</p>';
      return;
    }

    var totalBayar = tagihanData.tagihan + tagihanData.denda;

    resultDiv.innerHTML = 
      '<div class="tagihan-card highlight">' +
        '<div class="flex justify-between items-start mb-3">' +
          '<div><strong>' + tagihanData.nama + '</strong><br><small>' + tagihanData.alamat + '</small></div>' +
          '<span style="background:var(--primary-soft);color:var(--primary);padding:4px 10px;border-radius:20px;font-size:0.75rem;">' + tagihanData.kategori.toUpperCase() + '</span>' +
        '</div>' +
        '<div style="border-top:1px solid var(--border);padding-top:12px;">' +
          '<div class="flex justify-between" style="margin:8px 0;"><span>Periode</span><strong>' + tagihanData.periode + '</strong></div>' +
          '<div class="flex justify-between" style="margin:8px 0;"><span>Tagihan Pokok</span><strong>' + formatRupiah(tagihanData.tagihan) + '</strong></div>' +
          (tagihanData.denda > 0 ? '<div class="flex justify-between" style="margin:8px 0;color:var(--danger);"><span>Denda</span><strong>' + formatRupiah(tagihanData.denda) + '</strong></div>' : '') +
          '<div class="flex justify-between" style="margin:8px 0;font-size:1.1rem;font-weight:700;border-top:2px solid var(--border);padding-top:8px;"><span>Total</span><strong style="color:var(--primary);">' + formatRupiah(totalBayar) + '</strong></div>' +
          '<div class="flex justify-between" style="margin:8px 0;"><span>Jatuh Tempo</span><strong style="color:var(--danger);">' + tagihanData.jatuhTempo + '</strong></div>' +
        '</div>' +
      '</div>';

    paymentSection.innerHTML = 
      '<h4 style="margin:20px 0 12px;">Metode Pembayaran</h4>' +
      '<div class="payment-methods">' +
        '<div class="payment-method-card" data-method="va"><i class="fas fa-university"></i><strong>Virtual Account</strong></div>' +
        '<div class="payment-method-card" data-method="qris"><i class="fas fa-qrcode"></i><strong>QRIS</strong></div>' +
        '<div class="payment-method-card" data-method="teller"><i class="fas fa-store"></i><strong>Teller/Kasir</strong></div>' +
      '</div>' +
      '<div id="methodDetail" class="mt-4"></div>' +
      '<button class="btn mt-4 hidden" id="btnBayarSekarang"><i class="fas fa-paper-plane"></i> Bayar Sekarang</button>';
    
    paymentSection.classList.remove('hidden');

    document.querySelectorAll('.payment-method-card').forEach(function(card) {
      card.addEventListener('click', function() {
        document.querySelectorAll('.payment-method-card').forEach(function(c) { c.classList.remove('selected'); });
        this.classList.add('selected');
        
        var method = this.dataset.method;
        showMethodDetail(method, tagihanData, totalBayar, document.getElementById('methodDetail'));
        var btnBayar = document.getElementById('btnBayarSekarang');
        btnBayar.classList.remove('hidden');
        btnBayar.onclick = function() {
          handlePembayaran(method, tagihanData, totalBayar, 'tagihan');
        };
      });
    });
  }

  function showMethodDetail(method, data, total, detailDiv) {
    if (method === 'va') {
      var vaBCA = generateVANumber('bca');
      var vaBNI = generateVANumber('bni');
      var vaMandiri = generateVANumber('mandiri');
      
      detailDiv.innerHTML = 
        '<div class="va-display">' +
          '<div style="margin-bottom:8px;">Pilih Bank Transfer</div>' +
          '<div style="margin:12px 0;padding:12px;border:1px solid var(--border);border-radius:8px;"><strong>BCA</strong><br><span class="va-number">' + vaBCA + '</span></div>' +
          '<div style="margin:12px 0;padding:12px;border:1px solid var(--border);border-radius:8px;"><strong>BNI</strong><br><span class="va-number">' + vaBNI + '</span></div>' +
          '<div style="margin:12px 0;padding:12px;border:1px solid var(--border);border-radius:8px;"><strong>Mandiri</strong><br><span class="va-number">' + vaMandiri + '</span></div>' +
          '<small>Berlaku 24 jam</small>' +
        '</div>';
    } else if (method === 'qris') {
      detailDiv.innerHTML = 
        '<div class="qr-container">' +
          '<div id="qrcode"></div>' +
          '<div class="timer" id="qrisTimer">QR berlaku: 05:00</div>' +
        '</div>';
      
      setTimeout(function() {
        var qrContainer = document.getElementById("qrcode");
        if (qrContainer && typeof QRCode !== 'undefined') {
          qrContainer.innerHTML = '';
          new QRCode(qrContainer, {
            text: 'BAYARSENDIRI|' + (data.nama || '') + '|' + total + '|' + Date.now(),
            width: 200,
            height: 200,
            colorDark: "#0f6b3d",
            colorLight: "#ffffff"
          });
        }
        startQRCountdown(300, 'qrisTimer');
      }, 100);
    } else if (method === 'teller') {
      var paymentCode = generatePaymentCode();
      detailDiv.innerHTML = 
        '<div class="va-display">' +
          '<div>Kode Pembayaran</div>' +
          '<div class="va-number" style="font-size:1.2rem;">' + paymentCode + '</div>' +
          '<small>Tunjukkan ke kasir</small>' +
        '</div>' +
        '<div style="margin-top:16px;"><strong>Lokasi:</strong> Indomaret, Alfamart, Kantor Pos</div>';
    }
  }

  function startQRCountdown(seconds, elementId) {
    var timeLeft = seconds;
    var timerElement = document.getElementById(elementId);
    if (!timerElement) return;
    
    if (timerElement._countdown) clearInterval(timerElement._countdown);
    
    timerElement._countdown = setInterval(function() {
      var minutes = Math.floor(timeLeft / 60);
      var secs = timeLeft % 60;
      timerElement.textContent = 'QR berlaku: ' + minutes.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
      
      if (timeLeft <= 60) timerElement.style.color = 'var(--danger)';
      
      if (timeLeft <= 0) {
        clearInterval(timerElement._countdown);
        timerElement.textContent = 'QR kadaluarsa';
        var btnBayar = document.getElementById('btnBayarSekarang');
        if (btnBayar) btnBayar.disabled = true;
      }
      
      timeLeft--;
    }, 1000);
  }

  function handlePembayaran(method, data, total, type) {
    if (total > appState.saldo) {
      showToast('Saldo tidak mencukupi', 'error');
      return;
    }

    showLoading('Memproses pembayaran...');

    setTimeout(function() {
      appState.saldo -= total;
      
      var details = { total: total, metodePembayaran: method };
      if (type === 'tagihan') {
        details.kategori = data.kategori;
        details.nama = data.nama;
        details.periode = data.periode;
      } else if (type === 'spp') {
        details.nim = data.nim;
        details.deskripsi = data.deskripsi;
        details.kode = data.kode;
      } else if (type === 'pulsa') {
        details.provider = data.provider;
        details.nomor = data.nomor;
        details.produk = data.produk;
      }
      
      addTransaction(type, details);
      saveState();
      hideLoading();
      showPaymentReceipt(type, data, total, method);
    }, 2000);
  }

  function showPaymentReceipt(type, data, total, method) {
    var methodLabels = { va: 'Virtual Account', qris: 'QRIS', teller: 'Teller/Kasir' };
    
    var receiptHTML = 
      '<div class="receipt">' +
        '<div class="receipt-header">' +
          '<h3>BayarSendiri</h3>' +
          '<small>Bukti Pembayaran</small>' +
          '<div style="font-size:0.8rem;">' + getCurrentDateTime() + '</div>' +
        '</div>';
    
    if (type === 'tagihan') {
      receiptHTML += 
        '<div class="receipt-row"><span>Kategori</span><span>' + (data.kategori ? data.kategori.toUpperCase() : '') + '</span></div>' +
        '<div class="receipt-row"><span>Nama</span><span>' + data.nama + '</span></div>' +
        '<div class="receipt-row"><span>Periode</span><span>' + data.periode + '</span></div>';
    } else if (type === 'spp') {
      receiptHTML += 
        '<div class="receipt-row"><span>NIM</span><span>' + data.nim + '</span></div>' +
        '<div class="receipt-row"><span>Deskripsi</span><span>' + data.deskripsi + '</span></div>' +
        '<div class="receipt-row"><span>Kode</span><span>' + data.kode + '</span></div>';
    } else if (type === 'pulsa') {
      receiptHTML += 
        '<div class="receipt-row"><span>Provider</span><span>' + data.provider + '</span></div>' +
        '<div class="receipt-row"><span>Nomor</span><span>' + data.nomor + '</span></div>' +
        '<div class="receipt-row"><span>Produk</span><span>' + data.produk + '</span></div>';
    }
    
    receiptHTML += 
        '<div class="receipt-total"><div class="receipt-row"><span><strong>Total</strong></span><span><strong>' + formatRupiah(total) + '</strong></span></div></div>' +
        '<div class="receipt-row"><span>Metode</span><span>' + (methodLabels[method] || method) + '</span></div>' +
        '<div style="text-align:center;margin-top:16px;color:var(--success);font-weight:bold;">✅ PEMBAYARAN BERHASIL</div>' +
      '</div>' +
      '<div style="display:flex;gap:12px;margin-top:20px;">' +
        '<button class="btn btn-outline btn-sm" id="btnPrint"><i class="fas fa-print"></i> Cetak</button>' +
        '<button class="btn btn-sm" id="btnDownloadPDF"><i class="fas fa-download"></i> PDF</button>' +
      '</div>';

    var modal = showModal(receiptHTML);
    
    document.getElementById('btnPrint').addEventListener('click', function() { window.print(); });
    document.getElementById('btnDownloadPDF').addEventListener('click', function() {
      if (typeof window.jspdf !== 'undefined') {
        var doc = new window.jspdf.jsPDF();
        doc.text('BayarSendiri - Bukti Pembayaran', 20, 20);
        doc.text('Total: ' + formatRupiah(total), 20, 30);
        doc.text('Status: BERHASIL', 20, 40);
        doc.save('Bukti-Bayar.pdf');
        showToast('PDF berhasil diunduh', 'success');
      }
    });
  }

  // ========== SPP VIEW (ENHANCED) ==========
  function renderSPP() {
    mainContent.innerHTML = 
      '<h3 style="margin-bottom:20px;"><i class="fas fa-graduation-cap" style="color:var(--primary);"></i> Biaya Kuliah / SPP</h3>' +
      '<div class="form-group">' +
        '<label>Nomor Induk Mahasiswa (NIM)</label>' +
        '<input type="text" id="nimInput" placeholder="Masukkan NIM (12 digit)">' +
        '<small style="color:var(--text-soft);">Gunakan NIM demo: <b>123456789012</b></small>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>Kode Tagihan (Opsional - untuk cek detail)</label>' +
        '<input type="text" id="kodeTagihanInput" placeholder="Masukkan kode tagihan (contoh: 986248962486438)">' +
      '</div>' +
      '<button class="btn mb-3" id="btnLihatTagihan"><i class="fas fa-search"></i> Lihat Tagihan Semester</button>' +
      '<button class="btn btn-outline" id="btnCekKode"><i class="fas fa-barcode"></i> Cek Detail Kode Tagihan</button>' +
      '<div id="sppResult" class="mt-4"></div>' +
      '<div id="sppPaymentSection" class="hidden"></div>';

    document.getElementById('btnLihatTagihan').addEventListener('click', handleLihatTagihanSPP);
    document.getElementById('btnCekKode').addEventListener('click', handleCekKodeTagihan);
  }

  function handleLihatTagihanSPP() {
    var nim = document.getElementById('nimInput').value.trim();
    var resultDiv = document.getElementById('sppResult');
    var paymentSection = document.getElementById('sppPaymentSection');
    
    resultDiv.innerHTML = '';
    paymentSection.classList.add('hidden');

    if (!nim || nim.length !== 12 || !/^\d+$/.test(nim)) {
      resultDiv.innerHTML = '<p class="text-danger">NIM harus 12 digit angka. Contoh: 123456789012</p>';
      return;
    }

    var sppData = sppDatabase[nim];

    if (!sppData) {
      resultDiv.innerHTML = '<p class="text-danger">Data tidak ditemukan. Gunakan NIM demo: <b>123456789012</b></p>';
      return;
    }

    var html = 
      '<div class="tagihan-card highlight mb-3">' +
        '<strong>' + sppData.nama + '</strong><br>' +
        '<small>' + sppData.prodi + ' - ' + sppData.semester + '</small>' +
      '</div>' +
      '<div style="overflow-x:auto;">' +
        '<table class="spp-table">' +
          '<thead><tr><th>No</th><th>Kode</th><th>Deskripsi</th><th>Jumlah</th><th>Status</th><th>Pilih</th></tr></thead>' +
          '<tbody>';

    sppData.cicilan.forEach(function(item) {
      html += 
        '<tr>' +
          '<td>' + item.no + '</td>' +
          '<td style="font-size:0.75rem;">' + item.kode + '</td>' +
          '<td>' + item.deskripsi + '</td>' +
          '<td>' + formatRupiah(item.jumlah) + '</td>' +
          '<td class="' + (item.status === 'lunas' ? 'status-lunas' : 'status-belum') + '">' + (item.status === 'lunas' ? '✅ Lunas' : '⏳ Belum') + '</td>' +
          '<td>' + (item.status === 'belum_lunas' ? '<div class="checkbox-wrapper"><input type="checkbox" class="spp-checkbox" data-kode="' + item.kode + '" data-jumlah="' + item.jumlah + '" data-deskripsi="' + item.deskripsi + '"></div>' : '-') + '</td>' +
        '</tr>';
    });

    html += '</tbody></table></div>' +
      '<div class="preview-card mt-3">' +
        '<div class="flex justify-between"><span>Total Dipilih:</span><strong id="totalSpp">Rp0</strong></div>' +
        '<div class="flex justify-between"><span>Cicilan Dipilih:</span><strong id="countSpp">0</strong></div>' +
      '</div>' +
      '<button class="btn mt-3" id="btnBayarSpp" disabled><i class="fas fa-paper-plane"></i> Bayar Cicilan Terpilih</button>';

    resultDiv.innerHTML = html;

    var checkboxes = document.querySelectorAll('.spp-checkbox');
    var totalSppEl = document.getElementById('totalSpp');
    var countSppEl = document.getElementById('countSpp');
    var btnBayar = document.getElementById('btnBayarSpp');

    function updateTotal() {
      var total = 0;
      var count = 0;
      checkboxes.forEach(function(cb) {
        if (cb.checked) {
          total += parseInt(cb.dataset.jumlah);
          count++;
        }
      });
      totalSppEl.textContent = formatRupiah(total);
      countSppEl.textContent = count;
      btnBayar.disabled = (count === 0);
    }

    checkboxes.forEach(function(cb) {
      cb.addEventListener('change', updateTotal);
    });

    btnBayar.addEventListener('click', function() {
      var selectedItems = [];
      var totalBayar = 0;
      
      checkboxes.forEach(function(cb) {
        if (cb.checked) {
          selectedItems.push({
            kode: cb.dataset.kode,
            deskripsi: cb.dataset.deskripsi,
            jumlah: parseInt(cb.dataset.jumlah)
          });
          totalBayar += parseInt(cb.dataset.jumlah);
        }
      });

      if (totalBayar > appState.saldo) {
        showToast('Saldo tidak mencukupi', 'error');
        return;
      }

      paymentSection.innerHTML = 
        '<h4 style="margin:20px 0 12px;">Metode Pembayaran</h4>' +
        '<div class="payment-methods">' +
          '<div class="payment-method-card" data-method="va"><i class="fas fa-university"></i><strong>Virtual Account</strong></div>' +
          '<div class="payment-method-card" data-method="qris"><i class="fas fa-qrcode"></i><strong>QRIS</strong></div>' +
          '<div class="payment-method-card" data-method="teller"><i class="fas fa-store"></i><strong>Teller/Kasir</strong></div>' +
        '</div>' +
        '<div id="methodDetailSpp" class="mt-4"></div>' +
        '<button class="btn mt-4 hidden" id="btnKonfirmasiSpp"><i class="fas fa-paper-plane"></i> Konfirmasi Pembayaran</button>';
      
      paymentSection.classList.remove('hidden');

      document.querySelectorAll('#sppPaymentSection .payment-method-card').forEach(function(card) {
        card.addEventListener('click', function() {
          document.querySelectorAll('#sppPaymentSection .payment-method-card').forEach(function(c) { c.classList.remove('selected'); });
          this.classList.add('selected');
          
          var method = this.dataset.method;
          var sppPaymentData = { nim: nim, deskripsi: selectedItems.map(function(i) { return i.deskripsi; }).join(', '), kode: selectedItems.map(function(i) { return i.kode; }).join(', ') };
          showMethodDetail(method, sppPaymentData, totalBayar, document.getElementById('methodDetailSpp'));
          var btnKonfirmasi = document.getElementById('btnKonfirmasiSpp');
          btnKonfirmasi.classList.remove('hidden');
          btnKonfirmasi.onclick = function() {
            handlePembayaran(method, sppPaymentData, totalBayar, 'spp');
          };
        });
      });
    });
  }

  function handleCekKodeTagihan() {
    var kode = document.getElementById('kodeTagihanInput').value.trim();
    var resultDiv = document.getElementById('sppResult');
    var paymentSection = document.getElementById('sppPaymentSection');
    
    paymentSection.classList.add('hidden');

    if (!kode) {
      resultDiv.innerHTML = '<p class="text-danger">Masukkan kode tagihan</p>';
      return;
    }

    var found = null;
    for (var nim in sppDatabase) {
      var data = sppDatabase[nim];
      for (var i = 0; i < data.cicilan.length; i++) {
        if (data.cicilan[i].kode === kode) {
          found = { nim: nim, mahasiswa: data, item: data.cicilan[i] };
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      resultDiv.innerHTML = '<p class="text-danger">Kode tagihan tidak ditemukan. Contoh: <b>986248962486438</b></p>';
      return;
    }

    resultDiv.innerHTML = 
      '<div class="tagihan-card highlight">' +
        '<h4>Detail Tagihan</h4>' +
        '<div class="flex justify-between" style="margin:8px 0;"><span>Kode</span><strong>' + found.item.kode + '</strong></div>' +
        '<div class="flex justify-between" style="margin:8px 0;"><span>Deskripsi</span><strong>' + found.item.deskripsi + '</strong></div>' +
        '<div class="flex justify-between" style="margin:8px 0;"><span>NIM</span><strong>' + found.nim + '</strong></div>' +
        '<div class="flex justify-between" style="margin:8px 0;"><span>Mahasiswa</span><strong>' + found.mahasiswa.nama + '</strong></div>' +
        '<div class="flex justify-between" style="margin:8px 0;"><span>Semester</span><strong>' + found.mahasiswa.semester + '</strong></div>' +
        '<div class="flex justify-between" style="margin:8px 0;"><span>Jumlah</span><strong>' + formatRupiah(found.item.jumlah) + '</strong></div>' +
        '<div class="flex justify-between" style="margin:8px 0;"><span>Status</span><strong class="' + (found.item.status === 'lunas' ? 'text-success' : 'text-danger') + '">' + (found.item.status === 'lunas' ? 'Lunas' : 'Belum Lunas') + '</strong></div>' +
        (found.item.status === 'belum_lunas' ? '<button class="btn mt-3" id="btnBayarKode"><i class="fas fa-paper-plane"></i> Bayar Tagihan Ini</button>' : '') +
      '</div>';

    if (found.item.status === 'belum_lunas') {
      document.getElementById('btnBayarKode').addEventListener('click', function() {
        if (found.item.jumlah > appState.saldo) {
          showToast('Saldo tidak mencukupi', 'error');
          return;
        }

        paymentSection.innerHTML = 
          '<h4 style="margin:20px 0 12px;">Metode Pembayaran</h4>' +
          '<div class="payment-methods">' +
            '<div class="payment-method-card" data-method="va"><i class="fas fa-university"></i><strong>Virtual Account</strong></div>' +
            '<div class="payment-method-card" data-method="qris"><i class="fas fa-qrcode"></i><strong>QRIS</strong></div>' +
            '<div class="payment-method-card" data-method="teller"><i class="fas fa-store"></i><strong>Teller/Kasir</strong></div>' +
          '</div>' +
          '<div id="methodDetailSpp" class="mt-4"></div>' +
          '<button class="btn mt-4 hidden" id="btnKonfirmasiSpp"><i class="fas fa-paper-plane"></i> Konfirmasi Pembayaran</button>';
        
        paymentSection.classList.remove('hidden');

        var sppPaymentData = { nim: found.nim, deskripsi: found.item.deskripsi, kode: found.item.kode };

        document.querySelectorAll('#sppPaymentSection .payment-method-card').forEach(function(card) {
          card.addEventListener('click', function() {
            document.querySelectorAll('#sppPaymentSection .payment-method-card').forEach(function(c) { c.classList.remove('selected'); });
            this.classList.add('selected');
            
            var method = this.dataset.method;
            showMethodDetail(method, sppPaymentData, found.item.jumlah, document.getElementById('methodDetailSpp'));
            var btnKonfirmasi = document.getElementById('btnKonfirmasiSpp');
            btnKonfirmasi.classList.remove('hidden');
            btnKonfirmasi.onclick = function() {
              handlePembayaran(method, sppPaymentData, found.item.jumlah, 'spp');
            };
          });
        });
      });
    }
  }

  // ========== PULSA VIEW (ENHANCED) ==========
  function renderPulsa() {
    mainContent.innerHTML = 
      '<h3 style="margin-bottom:20px;"><i class="fas fa-mobile-alt" style="color:var(--primary);"></i> Isi Pulsa & Paket Data</h3>' +
      
      '<label style="margin-bottom:8px;">Pilih Provider</label>' +
      '<div class="grid-provider" id="providerGrid">' +
        '<div class="provider-card" data-provider="Telkomsel"><div class="provider-logo">🔴</div>Telkomsel</div>' +
        '<div class="provider-card" data-provider="XL Axiata"><div class="provider-logo">🔵</div>XL Axiata</div>' +
        '<div class="provider-card" data-provider="Indosat Ooredoo"><div class="provider-logo">🟡</div>Indosat</div>' +
        '<div class="provider-card" data-provider="Tri (3)"><div class="provider-logo">🟣</div>Tri (3)</div>' +
        '<div class="provider-card" data-provider="Smartfren"><div class="provider-logo">🟢</div>Smartfren</div>' +
        '<div class="provider-card" data-provider="Axis"><div class="provider-logo">⚪</div>Axis</div>' +
      '</div>' +
      
      '<div class="form-group mt-4">' +
        '<label>Nomor HP Tujuan</label>' +
        '<input type="tel" id="noHpPulsa" placeholder="08xxxxxxxxxx" maxlength="13">' +
      '</div>' +
      
      '<label>Pilih Nominal Pulsa</label>' +
      '<div class="nominal-grid" id="nominalGrid">' +
        '<div class="nominal-btn" data-nominal="10000">Rp10.000</div>' +
        '<div class="nominal-btn" data-nominal="25000">Rp25.000</div>' +
        '<div class="nominal-btn" data-nominal="50000">Rp50.000</div>' +
        '<div class="nominal-btn" data-nominal="100000">Rp100.000</div>' +
        '<div class="nominal-btn" data-nominal="200000">Rp200.000</div>' +
        '<div class="nominal-btn" data-custom="true">Custom</div>' +
      '</div>' +
      '<div class="form-group hidden" id="customNominalGroup">' +
        '<label>Nominal Custom</label>' +
        '<input type="number" id="customNominal" placeholder="Masukkan nominal" min="5000" step="1000">' +
      '</div>' +
      
      '<label class="mt-3">Atau Pilih Paket Data</label>' +
      '<div class="paket-grid" id="paketGrid">' +
        '<div class="paket-card" data-paket="5GB" data-harga="50000"><strong>5GB</strong><br>30 Hari<br>Rp50.000</div>' +
        '<div class="paket-card" data-paket="10GB" data-harga="100000"><strong>10GB</strong><br>30 Hari<br>Rp100.000</div>' +
        '<div class="paket-card" data-paket="25GB" data-harga="150000"><strong>25GB</strong><br>30 Hari<br>Rp150.000</div>' +
        '<div class="paket-card" data-paket="50GB" data-harga="200000"><strong>50GB</strong><br>30 Hari<br>Rp200.000</div>' +
      '</div>' +
      
      '<div class="preview-card hidden" id="previewPulsa">' +
        '<h4 style="margin-bottom:8px;">📋 Preview Pembelian</h4>' +
        '<div class="flex justify-between" style="margin:4px 0;"><span>Provider</span><strong id="prevProvider">-</strong></div>' +
        '<div class="flex justify-between" style="margin:4px 0;"><span>Nomor</span><strong id="prevNomor">-</strong></div>' +
        '<div class="flex justify-between" style="margin:4px 0;"><span>Produk</span><strong id="prevProduk">-</strong></div>' +
        '<div class="flex justify-between" style="margin:4px 0;font-size:1.1rem;font-weight:700;"><span>Harga</span><strong id="prevHarga">-</strong></div>' +
      '</div>' +
      
      '<button class="btn mt-3 hidden" id="btnLanjutPulsa"><i class="fas fa-arrow-right"></i> Lanjutkan Pembayaran</button>' +
      '<div id="pulsaPaymentSection" class="hidden"></div>';

    var selectedProvider = null;
    var selectedNominal = null;
    var selectedPaket = null;
    var isPaket = false;

    document.querySelectorAll('.provider-card').forEach(function(card) {
      card.addEventListener('click', function() {
        document.querySelectorAll('.provider-card').forEach(function(c) { c.classList.remove('selected'); });
        this.classList.add('selected');
        selectedProvider = this.dataset.provider;
        updatePreview();
      });
    });

    document.querySelectorAll('.nominal-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (this.dataset.custom === 'true') {
          document.getElementById('customNominalGroup').classList.remove('hidden');
          selectedNominal = null;
          document.querySelectorAll('.nominal-btn').forEach(function(b) { b.classList.remove('selected'); });
          this.classList.add('selected');
        } else {
          document.getElementById('customNominalGroup').classList.add('hidden');
          document.querySelectorAll('.nominal-btn').forEach(function(b) { b.classList.remove('selected'); });
          this.classList.add('selected');
          selectedNominal = parseInt(this.dataset.nominal);
          selectedPaket = null;
          isPaket = false;
          document.querySelectorAll('.paket-card').forEach(function(p) { p.classList.remove('selected'); });
        }
        updatePreview();
      });
    });

    document.getElementById('customNominal').addEventListener('input', function() {
      selectedNominal = parseInt(this.value) || null;
      updatePreview();
    });

    document.querySelectorAll('.paket-card').forEach(function(card) {
      card.addEventListener('click', function() {
        document.querySelectorAll('.paket-card').forEach(function(p) { p.classList.remove('selected'); });
        this.classList.add('selected');
        selectedPaket = this.dataset.paket;
        selectedNominal = parseInt(this.dataset.harga);
        isPaket = true;
        document.querySelectorAll('.nominal-btn').forEach(function(b) { b.classList.remove('selected'); });
        document.getElementById('customNominalGroup').classList.add('hidden');
        updatePreview();
      });
    });

    function updatePreview() {
      var noHp = document.getElementById('noHpPulsa').value.trim();
      var preview = document.getElementById('previewPulsa');
      var btnLanjut = document.getElementById('btnLanjutPulsa');
      
      document.getElementById('prevProvider').textContent = selectedProvider || '-';
      document.getElementById('prevNomor').textContent = noHp || '-';
      
      if (isPaket && selectedPaket) {
        document.getElementById('prevProduk').textContent = 'Paket Data ' + selectedPaket;
      } else if (selectedNominal) {
        document.getElementById('prevProduk').textContent = 'Pulsa ' + formatRupiah(selectedNominal);
      } else {
        document.getElementById('prevProduk').textContent = '-';
      }
      
      document.getElementById('prevHarga').textContent = selectedNominal ? formatRupiah(selectedNominal) : '-';
      
      if (selectedProvider && noHp && selectedNominal) {
        preview.classList.remove('hidden');
        btnLanjut.classList.remove('hidden');
      } else {
        preview.classList.add('hidden');
        btnLanjut.classList.add('hidden');
      }
    }

    document.getElementById('noHpPulsa').addEventListener('input', updatePreview);

    document.getElementById('btnLanjutPulsa').addEventListener('click', function() {
      var noHp = document.getElementById('noHpPulsa').value.trim();
      
      if (!noHp || noHp.length < 10 || noHp.length > 13 || !noHp.startsWith('08')) {
        showToast('Nomor HP tidak valid (harus 10-13 digit, diawali 08)', 'error');
        return;
      }

      if (!selectedNominal || selectedNominal < 5000) {
        showToast('Nominal minimal Rp5.000', 'error');
        return;
      }

      if (selectedNominal > appState.saldo) {
        showToast('Saldo tidak mencukupi', 'error');
        return;
      }

      var produkName = isPaket ? 'Paket Data ' + selectedPaket : 'Pulsa ' + formatRupiah(selectedNominal);
      var pulsaData = {
        provider: selectedProvider,
        nomor: noHp,
        produk: produkName,
        nominal: selectedNominal
      };

      var paymentSection = document.getElementById('pulsaPaymentSection');
      paymentSection.innerHTML = 
        '<h4 style="margin:20px 0 12px;">Metode Pembayaran</h4>' +
        '<div class="payment-methods">' +
          '<div class="payment-method-card" data-method="va"><i class="fas fa-university"></i><strong>Virtual Account</strong></div>' +
          '<div class="payment-method-card" data-method="qris"><i class="fas fa-qrcode"></i><strong>QRIS</strong></div>' +
          '<div class="payment-method-card" data-method="teller"><i class="fas fa-store"></i><strong>Teller/Kasir</strong></div>' +
        '</div>' +
        '<div id="methodDetailPulsa" class="mt-4"></div>' +
        '<button class="btn mt-4 hidden" id="btnKonfirmasiPulsa"><i class="fas fa-paper-plane"></i> Konfirmasi Pembayaran</button>';
      
      paymentSection.classList.remove('hidden');

      document.querySelectorAll('#pulsaPaymentSection .payment-method-card').forEach(function(card) {
        card.addEventListener('click', function() {
          document.querySelectorAll('#pulsaPaymentSection .payment-method-card').forEach(function(c) { c.classList.remove('selected'); });
          this.classList.add('selected');
          
          var method = this.dataset.method;
          showMethodDetail(method, pulsaData, selectedNominal, document.getElementById('methodDetailPulsa'));
          var btnKonfirmasi = document.getElementById('btnKonfirmasiPulsa');
          btnKonfirmasi.classList.remove('hidden');
          btnKonfirmasi.onclick = function() {
            handlePembayaran(method, pulsaData, selectedNominal, 'pulsa');
          };
        });
      });
    });
  }

  // ========== RIWAYAT VIEW ==========
  function renderRiwayat() {
    var html = '<h3>📋 Riwayat Transaksi</h3>';
    
    if (appState.transactions.length === 0) {
      html += '<p style="text-align:center;padding:40px;color:var(--text-soft);">Belum ada transaksi</p>';
    } else {
      appState.transactions.forEach(function(t) {
        html += 
          '<div class="transaction-item">' +
            '<div class="flex justify-between"><strong>' + (t.type ? t.type.toUpperCase() : '') + '</strong><span>' + formatRupiah(t.total || t.nominal || 0) + '</span></div>' +
            '<small style="color:var(--text-soft);">' + t.timestamp + '</small>' +
          '</div>';
      });
    }
    
    mainContent.innerHTML = html;
  }

  // ========== INITIALIZATION ==========
  function init() {
    loadState();
    
    var savedDark = localStorage.getItem('bayarsendiri_darkmode');
    if (savedDark === 'true') {
      document.body.classList.add('dark');
      if (darkToggleIcon) darkToggleIcon.className = 'fas fa-sun';
    }
    
    if (darkToggle) {
      darkToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark');
        var isDark = document.body.classList.contains('dark');
        localStorage.setItem('bayarsendiri_darkmode', isDark);
        if (darkToggleIcon) darkToggleIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      });
    }

    navItems.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        var view = e.currentTarget.dataset.view;
        if (view) navigateTo(view);
      });
    });

    if (profileBtn) {
      profileBtn.addEventListener('click', function() {
        var profileHTML = 
          '<div class="text-center mb-3">' +
            '<i class="fas fa-user-circle" style="font-size:4rem;color:var(--primary);"></i>' +
            '<h3>' + appState.user.nama + '</h3>' +
          '</div>' +
          '<div class="transaction-item"><div class="flex justify-between"><span>📧 Email</span><strong>' + appState.user.email + '</strong></div></div>' +
          '<div class="transaction-item"><div class="flex justify-between"><span>📱 Phone</span><strong>' + appState.user.phone + '</strong></div></div>' +
          '<div class="transaction-item"><div class="flex justify-between"><span>💰 Saldo</span><strong>' + formatRupiah(appState.saldo) + '</strong></div></div>' +
          '<button class="btn btn-sm mt-3" id="closeProfileBtn">Tutup</button>';
        
        var modal = showModal(profileHTML);
        document.getElementById('closeProfileBtn').addEventListener('click', function() { modal.closeModal(); });
      });
    }

    navigateTo('dashboard');
    console.log('🚀 BayarSendiri siap! Saldo: Rp15.000.000');
    console.log('📝 Demo: NIM 123456789012 | Kode 986248962486438');
  }

  init();

})();