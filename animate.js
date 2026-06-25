/* ===========================
   ARCODES.MY.ID — main.js
   Anandito Ernanda Portfolio
   =========================== */

/* ===== FIREBASE CONFIG ===== */
const firebaseConfig = {
  apiKey: "AIzaSyAbO4yUXctVLE5JhZ6KeHuALIMqTcZMVGA",
  authDomain: "web-personal-database.firebaseapp.com",
  databaseURL: "https://web-personal-database-default-rtdb.firebaseio.com",
  projectId: "web-personal-database",
  storageBucket: "web-personal-database.firebasestorage.app",
  messagingSenderId: "988870598666",
  appId: "1:988870598666:web:b5455eeacc170e15f67ff3",
  measurementId: "G-HYRH6MD880",
};

/* ===== TELEGRAM CONFIG ===== */
const TELEGRAM_BOT_TOKEN = "8963134859:AAHHGKGq2hnwoB_vPwCm7t_EWN7RAt9hwe4";
const TELEGRAM_CHAT_ID = "6355650701";

/* ========================================================
   PARTICLES — warna ikut tema aktif
   Didefinisiin DULUAN sebelum theme system dipanggil!
   ======================================================== */
function respawnParticles(theme) {
  const container = document.getElementById("particles");
  if (!container) return;

  container.innerHTML = "";

  const darkColors = ["#00d4ff", "#a78bfa", "#00ffb3", "#38bdf8"];
  const lightColors = [
    "rgba(37,99,235,0.4)",
    "rgba(124,58,237,0.35)",
    "rgba(5,150,105,0.35)",
  ];
  const colors = theme === "light" ? lightColors : darkColors;

  for (let i = 0; i < 14; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = 9 + Math.random() * 16 + "s";
    p.style.animationDelay = Math.random() * 12 + "s";
    const size = 1.5 + Math.random() * 2.5 + "px";
    p.style.width = size;
    p.style.height = size;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    if (theme === "dark") {
      p.style.boxShadow = `0 0 6px 1px ${colors[Math.floor(Math.random() * colors.length)]}`;
    }
    container.appendChild(p);
  }
}

/* ========================================================
   THEME SYSTEM
   Nyimpen preferensi ke localStorage — inget pas reload
   ======================================================== */
const html = document.documentElement;

function applyTheme(theme) {
  // Set atribut ke <html> — CSS [data-theme] ikut otomatis
  html.setAttribute("data-theme", theme);
  localStorage.setItem("anan-theme", theme);

  // Update active state tombol toggle 🌙/☀️
  document.querySelectorAll(".toggle-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === theme);
  });

  // Respawn partikel sesuai warna tema
  respawnParticles(theme);
}

// toggleTheme dipanggil dari onclick di HTML
function toggleTheme(theme) {
  applyTheme(theme);
}

// Init tema dari localStorage pas pertama load
applyTheme(localStorage.getItem("anan-theme") || "dark");

/* ========================================================
   NAVBAR — hamburger toggle
   ======================================================== */
function toggleMenu() {
  document.getElementById("navlinks").classList.toggle("open");
}

document.querySelectorAll(".nav-links a").forEach((a) => {
  a.addEventListener("click", () => {
    document.getElementById("navlinks").classList.remove("open");
  });
});

/* ========================================================
   SCROLL ANIMATIONS
   ======================================================== */
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".fade-up").forEach((el) => fadeObserver.observe(el));

/* ========================================================
   FIREBASE INIT — pakai Compat SDK (sesuai script tag di HTML)
   ======================================================== */
let db = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  loadMessages();
} catch (e) {
  const el = document.getElementById("msgs-container");
  if (el)
    el.innerHTML =
      '<div class="msgs-empty">⚙️ Firebase error: ' + e.message + "</div>";
  console.error("Firebase init error:", e);
}

/* ========================================================
   TELEGRAM — notif ke bot
   ======================================================== */
async function sendToTelegram(name, category, message) {
  const text =
    `🔔 *Pesan Baru di arcodes.my.id*\n\n` +
    `👤 *Nama:* ${name}\n📂 *Kategori:* ${category}\n` +
    `💬 *Pesan:*\n${message}\n\n🕐 ${new Date().toLocaleString("id-ID")}`;
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      },
    );
  } catch (err) {
    console.warn("Telegram failed:", err);
  }
}

/* ========================================================
   SUBMIT FEEDBACK
   ======================================================== */
async function submitFeedback() {
  const name = document.getElementById("f-name").value.trim() || "Anonymous";
  const cat = document.getElementById("f-cat").value;
  const msg = document.getElementById("f-msg").value.trim();
  const status = document.getElementById("form-status");
  const btn = document.getElementById("submit-btn");

  if (!msg) {
    status.textContent = "⚠️ Isi pesannya dulu dong!";
    status.className = "form-status error";
    return;
  }

  btn.textContent = "⏳ Mengirim...";
  btn.disabled = true;
  status.className = "form-status";

  const catLabels = {
    saran: "💡 Saran Website",
    feedback: "⭐ Feedback IoT",
    order: "🛒 Order Jasa",
    kolaborasi: "🤝 Kolaborasi",
    lainnya: "💬 Lainnya",
  };
  const catLabel = catLabels[cat] || cat;

  try {
    if (!db) throw new Error("Firebase belum siap");
    await db
      .ref("messages")
      .push({ name, category: catLabel, message: msg, timestamp: Date.now() });
    await sendToTelegram(name, catLabel, msg);
    status.textContent = "✅ Pesan terkirim! Makasih udah kasih feedback 🙏";
    status.className = "form-status success";
    document.getElementById("f-name").value = "";
    document.getElementById("f-msg").value = "";
    document.getElementById("f-cat").selectedIndex = 0;
  } catch (err) {
    status.textContent = "❌ Gagal kirim: " + err.message;
    status.className = "form-status error";
    console.error(err);
  }

  btn.textContent = "🚀 Kirim Pesan";
  btn.disabled = false;
}

/* ========================================================
   LOAD MESSAGES
   ======================================================== */
function loadMessages() {
  if (!db) return;
  db.ref("messages")
    .orderByChild("timestamp")
    .limitToLast(5)
    .on("value", (snap) => {
      const container = document.getElementById("msgs-container");
      if (!container) return;
      if (!snap.exists()) {
        container.innerHTML =
          '<div class="msgs-empty">Belum ada pesan. Jadilah yang pertama! 👋</div>';
        return;
      }
      const msgs = [];
      snap.forEach((child) => msgs.unshift({ ...child.val(), key: child.key }));
      container.innerHTML = msgs
        .map(
          (m) => `
      <div class="msg-item">
        <div class="msg-header">
          <span class="msg-name">
            ${escHtml(m.name)}
            · <span style="font-size:0.72rem;color:var(--accent-2);font-weight:500;">${escHtml(m.category)}</span>
          </span>
          <span class="msg-time">${timeAgo(m.timestamp)}</span>
        </div>
        <div class="msg-text">${escHtml(m.message)}</div>
      </div>
    `,
        )
        .join("");
    });
}

/* ========================================================
   HELPERS
   ======================================================== */
function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Barusan";
  if (m < 60) return m + " menit lalu";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " jam lalu";
  return Math.floor(h / 24) + " hari lalu";
}

/* ========================================================
   TESTIMONI SLIDER
   ======================================================== */
(function initTestiSlider() {
  const TOTAL = 5; // jumlah foto testimoni
  let current = 0;
  let perView = getPerView();
  let maxIndex = TOTAL - perView;

  const track = document.getElementById("testiTrack");
  const dotsEl = document.getElementById("testiDots");

  if (!track || !dotsEl) return;

  // Bikin dots
  for (let i = 0; i < TOTAL; i++) {
    const d = document.createElement("div");
    d.className = "testi-dot" + (i === 0 ? " active" : "");
    d.onclick = () => goTo(i);
    dotsEl.appendChild(d);
  }

  function getPerView() {
    if (window.innerWidth <= 560) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function goTo(idx) {
    perView = getPerView();
    maxIndex = TOTAL - perView;
    current = Math.max(0, Math.min(idx, maxIndex));

    // Geser track
    const cardW = track.children[0].offsetWidth;
    const gapPx = 20; // sesuai gap: 1.25rem
    track.style.transform = `translateX(-${current * (cardW + gapPx)}px)`;

    // Update dots
    document.querySelectorAll(".testi-dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });
  }

  // Expose ke global buat onclick di HTML
  window.testiSlide = function (dir) {
    goTo(current + dir);
  };

  // Auto-play setiap 4 detik
  let autoplay = setInterval(() => {
    goTo(current >= maxIndex ? 0 : current + 1);
  }, 4000);

  // Pause autoplay pas hover
  track.addEventListener("mouseenter", () => clearInterval(autoplay));
  track.addEventListener("mouseleave", () => {
    autoplay = setInterval(() => {
      goTo(current >= maxIndex ? 0 : current + 1);
    }, 4000);
  });

  // Swipe support di HP
  let startX = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener("touchend", (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  });

  // Recalculate kalau resize
  window.addEventListener("resize", () => goTo(current));
})();

/* ========================================================
   RANDOM FOTO PROFIL — ganti tiap beberapa detik
   me1.jpeg sampai me5.jpeg
   ======================================================== */
(function initProfileRotator() {
  const TOTAL = 5;
  const DELAY = 3500; // ganti tiap 3.5 detik
  const img = document.getElementById("heroImg");
  if (!img) return;

  const photos = Array.from({ length: TOTAL }, (_, i) => `src/me${i + 1}.jpeg`);

  // Acak urutan awal biar ga linear
  photos.sort(() => Math.random() - 0.5);

  let idx = 0;

  // Set foto pertama random (bukan selalu me1)
  img.src = photos[idx];

  function rotatePhoto() {
    // Fade out
    img.classList.add("fade-switch");

    setTimeout(() => {
      idx = (idx + 1) % TOTAL;
      img.src = photos[idx];

      // Fade in pas foto loaded
      img.onload = () => img.classList.remove("fade-switch");
      // Fallback kalau gambar error (file belum ada dll)
      img.onerror = () => {
        img.classList.remove("fade-switch");
      };
    }, 450); // tunggu fade out kelar
  }

  // Mulai rotasi
  setInterval(rotatePhoto, DELAY);
})();
