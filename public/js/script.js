// script.js - Versi Lengkap: Greeting, Clock, Lokasi, Modal SOS & Location, Tema
let gpsLocationActive = false;
let bigDataCloudApiKey = "";

// ----------------- Greeting -----------------
function updateGreeting() {
    const hrs = new Date().getHours();
    let text = "",
        emoji = "";
    if (hrs < 12) {
        text = "Selamat Pagi";
        emoji = "☀️";
    } else if (hrs < 15) {
        text = "Selamat Siang";
        emoji = "☀️";
    } else if (hrs < 18) {
        text = "Selamat Sore";
        emoji = "🌤️";
    } else {
        text = "Selamat Malam";
        emoji = "🌙";
    }
    document.getElementById("greet").textContent = `${text} ${emoji}`;
}

// ----------------- Clock -----------------
function updateClock() {
    fetch("https://worldtimeapi.org/api/ip")
        .then((res) => res.json())
        .then((data) => {
            const date = new Date(data.datetime);
            document.getElementById("clock").textContent = date.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
        })
        .catch(() => {
            const now = new Date();
            document.getElementById("clock").textContent = now.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
        });
}

// ----------------- Reverse Geocode -----------------
function reverseGeocode(lat, lon) {
    const el = document.getElementById("loc");
    const apiKey = bigDataCloudApiKey;
    const url = `https://api.bigdatacloud.net/data/reverse-geocode?latitude=${lat}&longitude=${lon}&localityLanguage=id&key=${apiKey}`;
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const city =
                data.city ||
                data.locality ||
                data.principalSubdivision ||
                data.countryName ||
                "Lokasi tidak diketahui";
            el.textContent = `📍 ${city}`;
        })
        .catch((err) => {
            console.error("Error reverseGeocode:", err);
            el.textContent = "🚫 Lokasi tidak tersedia";
        });
}

// ----------------- IP Geolocation Fallback -----------------
function getLocationFromIP() {
    const el = document.getElementById("loc");
    const apiKey = bigDataCloudApiKey;
    el.textContent = "📍 Mendeteksi lokasi via IP...";
    fetch(`https://api.bigdatacloud.net/data/ip-geolocation?key=${apiKey}&localityLanguage=id`)
        .then((res) => res.json())
        .then((data) => {
            const city =
                data.location?.city ||
                data.location?.locality ||
                data.location?.principalSubdivision ||
                data.country?.name ||
                "Lokasi tidak diketahui";
            el.textContent = `📍 ${city}`;
        })
        .catch((err) => {
            console.error("Error getLocationFromIP:", err);
            el.textContent = "🚫 Lokasi via IP gagal";
        });
}

// ----------------- Request GPS & Geolocation -----------------
function requestGPSLocation() {
    const el = document.getElementById("loc");
    el.textContent = "📍 Meminta izin lokasi...";

    navigator.geolocation.getCurrentPosition(
        (p) => {
            gpsLocationActive = true;
            reverseGeocode(p.coords.latitude, p.coords.longitude);
        },
        (err) => {
            console.error("Geolocation error on retry:", err.code, err.message);
            gpsLocationActive = false;
            if (err.code === 1) {
                el.textContent =
                    "🚫 Izin lokasi ditolak. Tim penyelamat membutuhkan lokasi GPS Anda.";
                showModalLocation();
            } else {
                el.textContent = "🚫 Gagal mengaktifkan GPS. Silakan coba lagi.";
            }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

function getLocation() {
    const el = document.getElementById("loc");

    // Protokol check
    if (location.protocol === "file:") {
        console.warn(
            "Menjalankan dari file://, GPS tidak didukung. Menggunakan IP sebagai fallback."
        );
        el.textContent = "🚫 File lokal, menggunakan lokasi via IP...";
        getLocationFromIP();
        return;
    }

    if (!navigator.geolocation) {
        el.textContent = "🚫 Lokasi tidak didukung oleh browser";
        getLocationFromIP();
        return;
    }

    el.textContent = "📍 Meminta izin lokasi...";
    navigator.geolocation.getCurrentPosition(
        (p) => {
            gpsLocationActive = true;
            reverseGeocode(p.coords.latitude, p.coords.longitude);
        },
        (err) => {
            console.error("Geolocation error:", err);
            gpsLocationActive = false;
            switch (err.code) {
                case 1:
                    el.textContent = "🚫 Izin lokasi ditolak. Menggunakan IP...";
                    showModalLocation();
                    break;
                case 2:
                case 3:
                default:
                    el.textContent = "🚫 Posisi tidak tersedia. Menggunakan IP...";
            }
            getLocationFromIP();
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
}

function isGPSLocationActive() {
    return gpsLocationActive;
}

// ----------------- Modal Creation & Handlers -----------------
function createModal(id, title, message, actions) {
    if (document.getElementById(id)) return;
    const modal = document.createElement("div");
    modal.id = id;
    modal.className = "modal";
    Object.assign(modal.style, {
        display: "none",
        position: "fixed",
        zIndex: "1000",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
    });

    const content = document.createElement("div");
    Object.assign(content.style, {
        background: "#fff",
        padding: "28px 24px",
        borderRadius: "14px",
        maxWidth: "340px",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
    });
    content.innerHTML = `<h3 style="margin:0 0 12px; color:#ff7e5f;">${title}</h3><p>${message}</p><div style="margin-top:18px; display:flex; gap:12px; justify-content:center;"></div>`;

    const btnContainer = content.querySelector("div");
    actions.forEach((a) => {
        const btn = document.createElement("button");
        btn.textContent = a.text;
        Object.assign(btn.style, a.style);
        btn.onclick = () => {
            a.handler();
            modal.style.display = "none";
        };
        btnContainer.appendChild(btn);
    });

    modal.appendChild(content);
    document.body.appendChild(modal);
}

function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
}

// Modal izin lokasi
function setupModals() {
    createModal(
        "modalLocation",
        "Izin Lokasi Diperlukan",
        "Untuk menampilkan lokasi Anda, izinkan akses lokasi pada pengaturan browser.",
        [
            {
                text: "Aktifkan Lokasi",
                style: {
                    background: "#ff7e5f",
                    color: "#fff",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    cursor: "pointer",
                },
                handler: requestGPSLocation,
            },
            {
                text: "Tutup",
                style: {
                    background: "#eee",
                    color: "#333",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    cursor: "pointer",
                },
                handler: () => {},
            },
        ]
    );

    createModal(
        "modalSOSWarning",
        "⚠️ Perhatian: Lokasi GPS Diperlukan",
        "Untuk menggunakan layanan darurat, Anda <b>harus mengaktifkan izin lokasi GPS</b> agar tim penyelamat dapat menemukan Anda dengan tepat.",
        [
            {
                text: "Aktifkan GPS",
                style: {
                    background: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    cursor: "pointer",
                },
                handler: requestGPSLocation,
            },
            {
                text: "Tutup",
                style: {
                    background: "#eee",
                    color: "#333",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    cursor: "pointer",
                },
                handler: () => {},
            },
        ]
    );
}

// Modal SOS konfirmasi
function showModalSOS(number, onConfirm) {
    createModal(
        "modalSOS",
        "Konfirmasi Darurat",
        `Apakah Anda yakin ingin memanggil <b>${number}</b>?`,
        [
            {
                text: "Ya",
                style: {
                    background: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    cursor: "pointer",
                },
                handler: onConfirm,
            },
            {
                text: "Batal",
                style: {
                    background: "#eee",
                    color: "#333",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    cursor: "pointer",
                },
                handler: () => {},
            },
        ]
    );
    showModal("modalSOS");
}

// ----------------- Fetch BDC Key & Init -----------------
function fetchBDCKeyAndInit() {
    fetch("/api/bdc-key")
        .then((res) => res.json())
        .then((data) => {
            bigDataCloudApiKey = data.key || "";
            // After key is loaded, run location and other initializers
            getLocation();
        });
}

// ----------------- Init Event Listeners -----------------
document.addEventListener("DOMContentLoaded", () => {
    updateGreeting();
    setupModals();
    fetchBDCKeyAndInit(); // fetch API key and then run getLocation
    updateClock();
    setInterval(updateClock, 1000);

    document.getElementById("sosBtn").onclick = () => {
        if (!isGPSLocationActive()) {
            showModal("modalSOSWarning");
            return;
        }
        showModalSOS("112", () => alert("Memanggil 112..."));
    };

    document.querySelectorAll(".service").forEach((btn) => {
        btn.onclick = () => {
            const num = btn.getAttribute("data-number");
            if (!isGPSLocationActive()) {
                showModal("modalSOSWarning");
                return;
            }
            showModalSOS(num, () => alert(`Memanggil ${num}...`));
        };
    });

    // Theme toggle
    const themeToggle = document.createElement("button");
    themeToggle.textContent = "🌙/☀️";
    Object.assign(themeToggle.style, {
        position: "fixed",
        bottom: "16px",
        right: "16px",
        padding: "8px",
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
    });
    document.body.appendChild(themeToggle);
    themeToggle.onclick = () => document.body.classList.toggle("dark-theme");

    // Header scroll effect
    document.addEventListener("scroll", () => {
        const hdr = document.querySelector("header");
        hdr.classList.toggle("scrolled", window.scrollY > 10);
    });
});
