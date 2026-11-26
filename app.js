import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";
// Bersihkan parameter login lama agar email/password tidak tertinggal di URL.
if (location.search && (new URLSearchParams(location.search).has("password") || new URLSearchParams(location.search).has("email"))) { history.replaceState(null, "", location.pathname); }
const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("ISI_") && SUPABASE_ANON_KEY.length > 30 && !SUPABASE_ANON_KEY.includes("ISI_");
const db = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const demo = [
 {id:"dapur-minang",name:"Dapur Minang Uni",category:"Kuliner",location:"Payakumbuh",description:"Aneka masakan rumahan dan makanan khas Minangkabau.",product:"Rendang, dendeng, dan nasi kotak",phone:"6281234567890",emoji:"🍛"},
 {id:"fashion-lokal",name:"Rancak Fashion",category:"Fashion",location:"Bukittinggi",description:"Pakaian kasual dan aksesori dengan pilihan model menarik.",product:"Baju, hijab, dan aksesori",phone:"6281234567890",emoji:"👕"},
 {id:"kerajinan-kayu",name:"Karya Kayu Kreatif",category:"Kerajinan",location:"Agam",description:"Produk kerajinan dan dekorasi berbahan kayu.",product:"Hiasan rumah dan souvenir",phone:"6281234567890",emoji:"🪵"},
 {id:"teknologi-jaya",name:"Teknologi Jaya",category:"Jasa",location:"Payakumbuh",description:"Layanan servis komputer dan instalasi jaringan.",product:"Servis komputer dan jaringan",phone:"6281234567890",emoji:"💻"}
];
const navItems=[["index.html","Beranda"],["umkm.html","Semua UMKM"],["kategori.html","Kategori"],["produk.html","Promosi Produk"],["tentang.html","Tentang"],["panduan.html","Panduan"],["kontak.html","Kontak"]];
const page=location.pathname.split("/").pop()||"index.html";
const nav=document.querySelector(".links");
if(nav && !page.includes("admin")){nav.innerHTML=navItems.map(([u,t])=>`<a class="${page===u?"active":""}" href="${u}">${t}</a>`).join("")+`<a class="navbtn" href="daftar.html">Daftarkan Usaha +</a>`;}
const menu=document.querySelector(".menu"); if(menu&&nav){menu.addEventListener("click",()=>nav.classList.toggle("open"));nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));}
document.querySelectorAll("[data-year]").forEach(e=>e.textContent=new Date().getFullYear());
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function card(b){return `<article class="card listing-card"><div class="listing-cover">${esc(b.emoji||"🏪")}</div><div class="listing-body"><span class="meta">${esc(b.category)} • ${esc(b.location)}</span><h3>${esc(b.name)}</h3><p>${esc(b.description)}</p><a class="btn" href="detail.html?id=${encodeURIComponent(b.id)}">Lihat Usaha ↗</a></div></article>`}
function render(target,items){const el=document.querySelector(target);if(el)el.innerHTML=items.length?items.map(card).join(""):'<div class="empty">Belum ada usaha yang ditampilkan.</div>';}
async function getApproved(){if(!db)return demo;const {data,error}=await db.from("businesses").select("id,name,category,location,description,product,phone,emoji").eq("status","approved").order("created_at",{ascending:false});if(error){console.error(error);return [];}return data||[];}
let all=[];
async function loadListings(){all=await getApproved();render("#featured",all.slice(0,3));render("#all-listings",all);applyFilters();}
function applyFilters(){const q=(document.querySelector("#search-business")?.value||"").toLowerCase(),c=document.querySelector("#category-filter")?.value||"";render("#all-listings",all.filter(b=>(!c||b.category===c)&&[b.name,b.description,b.location,b.product].join(" ").toLowerCase().includes(q)));}
document.querySelector("#search-business")?.addEventListener("input",applyFilters);document.querySelector("#category-filter")?.addEventListener("change",applyFilters);
const detail=document.querySelector("#business-detail");
if(detail){const id=new URLSearchParams(location.search).get("id");(async()=>{const businesses=await getApproved();const b=businesses.find(x=>String(x.id)===id);detail.innerHTML=b?`<div class="detail-layout"><div class="detail-art">${esc(b.emoji||"🏪")}</div><div><span class="chip">${esc(b.category)}</span><h1>${esc(b.name)}</h1><p class="lead">${esc(b.description)}</p><p><b>Lokasi:</b> ${esc(b.location)}</p><p><b>Produk/Jasa:</b> ${esc(b.product)}</p><a class="btn" target="_blank" rel="noopener" href="https://wa.me/${encodeURIComponent(b.phone||"")}?text=${encodeURIComponent("Halo, saya menemukan usaha Anda di platform Promosi UMKM.")}">Hubungi via WhatsApp ↗</a></div></div>`:'<div class="empty">Usaha tidak ditemukan atau belum disetujui admin.</div>';})();}
const register=document.querySelector("#register-form");
if(register){register.addEventListener("submit",async e=>{e.preventDefault();const btn=register.querySelector('button[type="submit"]');btn.disabled=true;btn.textContent="Mengirim...";const d=Object.fromEntries(new FormData(register).entries());d.emoji="🏪";d.status="pending";try{if(!db)throw new Error("Website belum dihubungkan ke database. Isi js/supabase-config.js terlebih dahulu.");const {error}=await db.from("businesses").insert([d]);if(error)throw error;document.querySelector("#success-message").textContent="Pengajuan berhasil dikirim dan menunggu persetujuan admin. Setelah disetujui, usaha akan tampil di website.";document.querySelector("#success-message").style.display="block";register.reset();}catch(err){alert("Pengajuan belum terkirim: "+(err.message||"Periksa koneksi dan konfigurasi database."));}finally{btn.disabled=false;btn.textContent="Kirim Pengajuan ↗";}});}
const contact=document.querySelector("#contact-form");if(contact){contact.addEventListener("submit",e=>{e.preventDefault();alert("Silakan kirim pesan melalui email syahlendra1303@gmail.com atau Instagram @promosi_usaha_umkm.");});}
// Panel admin: autentikasi Supabase. Kredensial tidak pernah ditambahkan ke URL.
const login = document.querySelector("#admin-login");
if (login) {
  const loginPanel = document.querySelector("#login-panel");
  const panel = document.querySelector("#admin-panel");
  const msg = document.querySelector("#login-message");
  const list = document.querySelector("#submission-list");
  const logout = document.querySelector("#logout-admin");

  const showMessage = (text) => { if (msg) msg.textContent = text; };

  async function loadSubmissions() {
    if (!list) return;
    list.innerHTML = '<div class="empty">Memuat pengajuan...</div>';
    const { data, error } = await db.from("businesses").select("*").order("created_at", { ascending: false });
    if (error) {
      list.innerHTML = `<div class="empty">Gagal memuat pengajuan: ${esc(error.message)}</div>`;
      return;
    }
    if (!data || data.length === 0) {
      list.innerHTML = '<div class="empty">Belum ada pengajuan UMKM.</div>';
      return;
    }
    list.innerHTML = data.map(b => `
      <article class="card" style="padding:20px;margin-bottom:14px">
        <div class="listing-body">
          <span class="meta">${esc(b.category)} • ${esc(b.location)} • Status: <b>${esc(b.status)}</b></span>
          <h3>${esc(b.name)}</h3>
          <p>${esc(b.description)}</p>
          <p><b>Produk/Jasa:</b> ${esc(b.product)}<br><b>WhatsApp:</b> ${esc(b.phone)}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${b.status !== "approved" ? `<button class="btn" type="button" data-action="approved" data-id="${esc(b.id)}">Setujui</button>` : ""}
            ${b.status !== "rejected" ? `<button class="btn btn-outline" type="button" data-action="rejected" data-id="${esc(b.id)}">Tolak</button>` : ""}
          </div>
        </div>
      </article>`).join("");
  }

  async function checkAdmin() {
    if (!db) {
      showMessage("Supabase belum dikonfigurasi. Isi js/supabase-config.js, lalu unggah ulang ke GitHub.");
      return false;
    }
    const { data: sessionData, error: sessionError } = await db.auth.getSession();
    if (sessionError || !sessionData.session) return false;
    const user = sessionData.session.user;
    const { data: adminRecord, error } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (error || !adminRecord) {
      await db.auth.signOut();
      showMessage("Login berhasil, tetapi akun ini belum diberi hak admin. Tambahkan UUID akun ke tabel public.admin_users.");
      return false;
    }
    loginPanel.style.display = "none";
    panel.style.display = "block";
    await loadSubmissions();
    return true;
  }

  login.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!db) {
      showMessage("Supabase belum dikonfigurasi. Isi js/supabase-config.js terlebih dahulu.");
      return;
    }
    const button = login.querySelector('button[type="submit"]');
    const email = login.elements.email.value.trim();
    const password = login.elements.password.value;
    if (button) { button.disabled = true; button.textContent = "Memeriksa akun..."; }
    showMessage("");
    try {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const allowed = await checkAdmin();
      if (!allowed && !msg.textContent) showMessage("Akun belum memiliki akses admin.");
    } catch (error) {
      showMessage("Login gagal: " + (error.message || "Periksa email, kata sandi, dan konfigurasi Supabase."));
    } finally {
      if (button) { button.disabled = false; button.textContent = "Masuk ke Panel ↗"; }
      // Pastikan tidak ada data formulir yang pernah tersimpan sebagai parameter URL.
      history.replaceState(null, "", location.pathname);
    }
  });

  logout?.addEventListener("click", async () => {
    if (db) await db.auth.signOut();
    panel.style.display = "none";
    loginPanel.style.display = "block";
    login.reset();
    showMessage("Kamu sudah keluar dari panel admin.");
  });

  list?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || !db) return;
    button.disabled = true;
    const { error } = await db.from("businesses").update({ status: button.dataset.action }).eq("id", button.dataset.id);
    if (error) alert("Gagal memperbarui status: " + error.message);
    await loadSubmissions();
  });

  checkAdmin().catch(error => showMessage("Tidak dapat memeriksa sesi: " + error.message));
}
loadListings();
// Animasi masuk layar.
document.querySelectorAll(".section .head, .section .card, .section .step, .section .formbox, .section .info, .section .cta, .section .detail-layout").forEach((el,i)=>{el.classList.add("reveal");el.style.transitionDelay=`${Math.min(i%6,5)*80}ms`;});
if("IntersectionObserver" in window){const ob=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("visible");ob.unobserve(x.target);}}),{threshold:.12});document.querySelectorAll(".reveal").forEach(x=>ob.observe(x));}else document.querySelectorAll(".reveal").forEach(x=>x.classList.add("visible"));
