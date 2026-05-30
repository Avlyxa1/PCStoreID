import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrochip,
  faPlug,
  faMemory,
  faHardDrive,
  faVideo,
  faBolt,
  faBox,
  faSnowflake,
  faDesktop,
  faShoppingCart,
  faWrench,
  faCheck,
  faClipboard,
  faXmark,
  faStore,
  faInbox,
  faExclamationTriangle,
  faRotate,
  faCreditCard,
  faCircleCheck,
  faCircleXmark,
  faFolder,
  faBullseye,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";
const API_BASE = "http://localhost:5000";
// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  1: faMicrochip,       // CPU
  2: faPlug,            // Motherboard
  3: faMemory,          // RAM
  4: faHardDrive,       // Storage
  5: faVideo,           // GPU
  6: faBolt,            // PSU
  7: faBox,             // Case
  8: faSnowflake,       // Cooler
};
const UNSPLASH_KEYWORDS = {
  1: "cpu processor computer chip",
  2: "motherboard circuit board",
  3: "ram memory stick",
  4: "ssd hard drive storage",
  5: "gpu graphics card",
  6: "power supply unit psu",
  7: "pc case tower computer",
  8: "cpu cooler fan heatsink",
};
const BUILDER_STEPS = [
  { id: 1, name: "CPU",         label: "Processor",    required: true  },
  { id: 2, name: "Motherboard", label: "Papan Induk",  required: true  },
  { id: 3, name: "RAM",         label: "Memory",       required: true  },
  { id: 4, name: "Storage",     label: "SSD / HDD",    required: true  },
  { id: 5, name: "GPU",         label: "Kartu Grafis", required: false },
  { id: 6, name: "PSU",         label: "Power Supply", required: true  },
  { id: 7, name: "Case",        label: "Casing",       required: true  },
  { id: 8, name: "Cooler",      label: "Pendingin",    required: false },
];
const REQUIRED_STEPS = BUILDER_STEPS.filter((s) => s.required).map((s) => s.id);
// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRupiah = (n) =>
  "Rp " + (n || 0).toLocaleString("id-ID");
const getUnsplashUrl = (produk) => {
  const keyword =
    UNSPLASH_KEYWORDS[produk.kategori_id] || "computer hardware";
  const q = encodeURIComponent(`${produk.nama_produk} ${keyword}`);
  return `https://source.unsplash.com/400x280/?${q}`;
};
const getCategoryIcon = (id) => CATEGORY_ICONS[id] || faDesktop;
const IconComponent = ({ icon, className = "" }) => (
  <FontAwesomeIcon icon={icon} className={className} />
);
const calcTDP = (selectedMap) => {
  const parts = Object.values(selectedMap).filter(Boolean);
  const total = parts.reduce((s, p) => s + (p.tdp_watt || 0), 0);
  const recommended = Math.ceil((total * 1.5) / 50) * 50;
  return { total, recommended };
};
// ─── Sub-components ───────────────────────────────────────────────────────────
function ProductCard({ produk, isSelected, mode, onSelect }) {
  const [imgSrc, setImgSrc] = useState(getUnsplashUrl(produk));
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <div className={`product-card${isSelected ? " selected" : ""}`}>
      <div className="product-image-wrap">
        {!imgLoaded && (
          <div className="product-img-placeholder">
            <IconComponent icon={getCategoryIcon(produk.kategori_id)} />
          </div>
        )}
        <img
          src={imgSrc}
          alt={produk.nama_produk}
          className={`product-image${imgLoaded ? " loaded" : ""}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgLoaded(true);
            setImgSrc("");
          }}
        />
        {!imgSrc && (
          <div className="product-img-placeholder visible">
            <IconComponent icon={getCategoryIcon(produk.kategori_id)} />
          </div>
        )}
        <div className="product-cat-badge">
          <IconComponent icon={getCategoryIcon(produk.kategori_id)} />
        </div>
      </div>
      <div className="product-body">
        <h3 className="product-name">{produk.nama_produk}</h3>
        <div className="product-tags">
          {produk.socket_type && <span className="tag">{produk.socket_type}</span>}
          {produk.ram_type    && <span className="tag">{produk.ram_type}</span>}
          {produk.form_factor && <span className="tag">{produk.form_factor}</span>}
          {produk.tdp_watt    && <span className="tag tag-power">{produk.tdp_watt} W</span>}
        </div>
        <div className="product-footer">
          <span className="product-price">{formatRupiah(produk.harga)}</span>
          <span className={`product-stok${produk.stok === 0 ? " out" : ""}`}>
            {produk.stok > 0 ? `Stok: ${produk.stok}` : "Habis"}
          </span>
        </div>
        <button
          id={`btn-produk-${produk.id}`}
          className={`btn-select${isSelected ? " is-selected" : ""}`}
          disabled={produk.stok === 0}
          onClick={() => onSelect(produk)}
        >
          {isSelected ? (
            <>
              <IconComponent icon={faCheck} /> {mode === "browse" ? "Di Keranjang" : "Dipilih"}
            </>
          ) : mode === "browse" ? (
            <>
              <IconComponent icon={faShoppingCart} /> Tambah ke Keranjang
            </>
          ) : (
            <>
              <IconComponent icon={faBolt} /> Pilih Komponen
            </>
          )}
        </button>
      </div>
    </div>
  );
}
function StepProgress({ steps, currentStep, selectedMap, onStepClick }) {
  return (
    <div className="step-list">
      {steps.map((step, idx) => {
        const done = !!selectedMap[step.id];
        const active = idx === currentStep;
        return (
          <button
            key={step.id}
            id={`step-nav-${step.id}`}
            className={`step-btn${active ? " active" : ""}${done ? " done" : ""}`}
            onClick={() => onStepClick(idx)}
          >
            <span className="step-num">
              {done ? <IconComponent icon={faCheck} /> : idx + 1}
            </span>
            <span className="step-info">
              <span className="step-name">{step.name}</span>
              <span className="step-label">{step.label}</span>
            </span>
            {!step.required && <span className="step-opt-tag">Opsional</span>}
          </button>
        );
      })}
    </div>
  );
}
function CartSummaryPanel({
  cartItems,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
  getKategoriName,
}) {
  const entries = Object.values(cartItems);
  const totalItems = entries.reduce((s, item) => s + item.jumlah, 0);
  const totalHarga = entries.reduce(
    (s, item) => s + item.produk.harga * item.jumlah,
    0
  );
  const isCheckoutReady = entries.length > 0;
  return (
    <aside className="sidebar-right cart-panel">
      <div className="summary-header">
        <h3 className="summary-title"><IconComponent icon={faShoppingCart} /> Keranjang Belanja</h3>
        <span className="summary-count">{totalItems} item</span>
      </div>
      {entries.length === 0 ? (
        <div className="cart-empty">
          <p className="cart-empty-icon"><IconComponent icon={faShoppingCart} /></p>
          <p className="cart-empty-text">Keranjang masih kosong</p>
          <p className="cart-empty-hint">Tambahkan produk dari katalog toko</p>
        </div>
      ) : (
        <div className="cart-items">
          {entries.map(({ produk, jumlah }) => (
            <div key={produk.id} className="cart-item slot slot-filled">
              <div className="slot-head">
                <span className="slot-icon"><IconComponent icon={getCategoryIcon(produk.kategori_id)} /></span>
                <span className="slot-name">{getKategoriName(produk.kategori_id)}</span>
                <button
                  type="button"
                  className="btn-cart-remove"
                  onClick={() => onRemove(produk.id)}
                  aria-label="Hapus dari keranjang"
                >
                  <IconComponent icon={faXmark} />
                </button>
              </div>
              <p className="slot-pname">{produk.nama_produk}</p>
              <p className="slot-pprice">{formatRupiah(produk.harga)} / unit</p>
              <div className="cart-qty-row">
                <span className="cart-qty-label">Jumlah</span>
                <div className="cart-qty-controls">
                  <button
                    type="button"
                    className="btn-qty"
                    disabled={jumlah <= 1}
                    onClick={() => onUpdateQty(produk.id, jumlah - 1)}
                  >
                    −
                  </button>
                  <span className="cart-qty-value">{jumlah}</span>
                  <button
                    type="button"
                    className="btn-qty"
                    disabled={jumlah >= produk.stok}
                    onClick={() => onUpdateQty(produk.id, jumlah + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="cart-subtotal">
                Subtotal: <strong>{formatRupiah(produk.harga * jumlah)}</strong>
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="summary-total-box">
        <div className="total-label">Total Belanja</div>
        <div className="total-amount">{formatRupiah(totalHarga)}</div>
      </div>
      <div className={`readiness-bar${isCheckoutReady ? " ready" : ""}`}>
        {isCheckoutReady
          ? <><IconComponent icon={faCircleCheck} /> Siap untuk Checkout!</>
          : <><IconComponent icon={faCircleXmark} /> Belum ada produk di keranjang</>}
      </div>
      <button
        id="btn-cart-checkout"
        className={`btn-checkout${isCheckoutReady ? "" : " disabled"}`}
        disabled={!isCheckoutReady}
        onClick={onCheckout}
      >
        <IconComponent icon={faCreditCard} /> Lanjut Checkout
      </button>
      {entries.length > 0 && (
        <button id="btn-cart-clear" className="btn-reset" onClick={onClear}>
          <IconComponent icon={faRotate} /> Kosongkan Keranjang
        </button>
      )}
    </aside>
  );
}
function BuildSummaryPanel({ selectedMap, tdp, onReset, onCheckout, isCheckoutReady }) {
  const total = Object.values(selectedMap).reduce((s, p) => s + (p?.harga || 0), 0);
  const count = Object.keys(selectedMap).length;
  return (
    <aside className="sidebar-right">
      <div className="summary-header">
        <h3 className="summary-title"><IconComponent icon={faClipboard} /> Ringkasan Rakitan</h3>
        <span className="summary-count">{count}/8</span>
      </div>
      <div className="summary-slots">
        {BUILDER_STEPS.map((step) => {
          const p = selectedMap[step.id];
          return (
            <div key={step.id} className={`slot${p ? " slot-filled" : ""}`}>
              <div className="slot-head">
                <span className="slot-icon"><IconComponent icon={getCategoryIcon(step.id)} /></span>
                <span className="slot-name">{step.name}</span>
                {!step.required && <span className="slot-opt">Opsional</span>}
              </div>
              {p ? (
                <div className="slot-product">
                  <p className="slot-pname">{p.nama_produk}</p>
                  <p className="slot-pprice">{formatRupiah(p.harga)}</p>
                </div>
              ) : (
                <p className="slot-empty">— Belum dipilih</p>
              )}
            </div>
          );
        })}
      </div>
      {tdp.total > 0 && (
        <div className="tdp-box">
          <div className="tdp-row">
            <span><IconComponent icon={faBolt} /> Total TDP</span>
            <strong>{tdp.total} W</strong>
          </div>
          <div className="tdp-row">
            <span><IconComponent icon={faBolt} /> PSU Rekomendasi</span>
            <strong className="tdp-rec">{tdp.recommended} W</strong>
          </div>
        </div>
      )}
      <div className="summary-total-box">
        <div className="total-label">Total Harga</div>
        <div className="total-amount">{formatRupiah(total)}</div>
      </div>
      <div className={`readiness-bar${isCheckoutReady ? " ready" : ""}`}>
        {isCheckoutReady
          ? <><IconComponent icon={faCircleCheck} /> Siap untuk Checkout!</>
          : <><IconComponent icon={faCircleXmark} /> {REQUIRED_STEPS.filter((id) => !selectedMap[id]).length} komponen wajib belum dipilih</>}
      </div>
      <button
        id="btn-checkout"
        className={`btn-checkout${isCheckoutReady ? "" : " disabled"}`}
        disabled={!isCheckoutReady}
        onClick={onCheckout}
      >
        <IconComponent icon={faCreditCard} /> Lanjut Checkout
      </button>
      {count > 0 && (
        <button id="btn-reset" className="btn-reset" onClick={onReset}>
          <IconComponent icon={faRotate} /> Reset Rakitan
        </button>
      )}
    </aside>
  );
}
function CheckoutModal({ onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({ nama_pembeli: "", email: "", no_telepon: "" });
  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><IconComponent icon={faClipboard} /> Formulir Pembelian</h2>
          <button className="modal-close" onClick={onClose}><IconComponent icon={faXmark} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="nama_pembeli">Nama Pembeli <span className="req">*</span></label>
            <input
              id="nama_pembeli"
              type="text"
              placeholder="Masukkan nama Anda"
              value={form.nama_pembeli}
              onChange={handleChange("nama_pembeli")}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email_field">Email</label>
            <input
              id="email_field"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange("email")}
            />
          </div>
          <div className="form-group">
            <label htmlFor="telepon">No. Telepon</label>
            <input
              id="telepon"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={form.no_telepon}
              onChange={handleChange("no_telepon")}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              <IconComponent icon={faCircleCheck} /> {isLoading ? "Memproses..." : "Konfirmasi Pembelian"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab]           = useState("browse");
  const [categories, setCategories]         = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [produkList, setProdukList]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [currentStep, setCurrentStep]     = useState(0);
  const [selectedProduk, setSelectedProduk] = useState({});
  const [cartItems, setCartItems]         = useState({});
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [showCheckout, setShowCheckout]   = useState(false);
  const [checkoutSource, setCheckoutSource] = useState("build");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const tdp = calcTDP(selectedProduk);
  const isCheckoutReady = REQUIRED_STEPS.every((id) => selectedProduk[id]);
  const cartCount = Object.values(cartItems).reduce((s, item) => s + item.jumlah, 0);
  const getKategoriName = (kategoriId) => {
    const cat = categories.find((c) => c.kategori_id === kategoriId);
    return cat?.nama_kategori || BUILDER_STEPS.find((s) => s.id === kategoriId)?.name || "Lainnya";
  };
  // ── Load categories ──────────────────────────────────────────────────────────
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/builder/kategori`)
      .then((r) => setCategories(r.data.steps || []))
      .catch(console.error);
  }, []);
  // ── Load products ────────────────────────────────────────────────────────────
  const loadProduk = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `${API_BASE}/api/produk`;
      if (activeTab === "browse" && selectedCategory) {
        url += `?kategori_id=${parseInt(selectedCategory)}`;
      } else if (activeTab === "build") {
        url += `?kategori_id=${parseInt(BUILDER_STEPS[currentStep].id)}`;
      }
      const res = await axios.get(url);
      setProdukList(res.data);
    } catch (err) {
      setError("Gagal memuat produk: " + err.message);
      setProdukList([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, currentStep]);
  useEffect(() => {
    if (activeTab === "browse" && !selectedCategory) {
      setProdukList([]);
      return;
    }
    loadProduk();
  }, [loadProduk, activeTab, selectedCategory]);
  // ── Handlers ─────────────────────────────────────────────────────────────────
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSelectedCategory(null);
    if (tab === "build") setShowCartPanel(false);
  };
  const handleBrowseSelect = (produk) => {
    setCartItems((prev) => {
      const existing = prev[produk.id];
      const nextQty = existing ? existing.jumlah + 1 : 1;
      if (nextQty > produk.stok) {
        alert(`Stok ${produk.nama_produk} hanya tersedia ${produk.stok} unit.`);
        return prev;
      }
      return {
        ...prev,
        [produk.id]: { produk, jumlah: nextQty },
      };
    });
  };
  const handleCartUpdateQty = (produkId, jumlah) => {
    setCartItems((prev) => {
      const item = prev[produkId];
      if (!item || jumlah < 1) return prev;
      if (jumlah > item.produk.stok) {
        alert(`Stok maksimal ${item.produk.stok} unit.`);
        return prev;
      }
      return { ...prev, [produkId]: { ...item, jumlah } };
    });
  };
  const handleCartRemove = (produkId) => {
    setCartItems((prev) => {
      const next = { ...prev };
      delete next[produkId];
      return next;
    });
  };
  const handleCartClear = () => {
    if (window.confirm("Kosongkan seluruh keranjang belanja?")) {
      setCartItems({});
    }
  };
  const openCheckout = (source) => {
    setCheckoutSource(source);
    setShowCheckout(true);
  };
  const handleBuildSelect = (produk) => {
    const stepId = BUILDER_STEPS[currentStep].id;
    const next = { ...selectedProduk, [stepId]: produk };
    setSelectedProduk(next);
    if (currentStep < BUILDER_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };
  const handleReset = () => {
    if (window.confirm("Reset rakitan? Semua pilihan akan dihapus.")) {
      setCurrentStep(0);
      setSelectedProduk({});
    }
  };
  const handleCheckout = async (form) => {
    if (!form.nama_pembeli.trim()) { alert("Nama pembeli wajib diisi!"); return; }
    const isCart = checkoutSource === "cart";
    const cartEntries = Object.values(cartItems);
    if (isCart && cartEntries.length === 0) {
      alert("Keranjang belanja kosong!");
      return;
    }
    try {
      setIsCheckingOut(true);
      let rakitan_detail;
      let total_harga;
      let total_watt;
      if (isCart) {
        rakitan_detail = cartEntries.map(({ produk, jumlah }) => ({
          produk_id: produk.id,
          nama_produk: produk.nama_produk,
          kategori: getKategoriName(produk.kategori_id),
          harga_per_unit: produk.harga,
          jumlah,
        }));
        total_harga = cartEntries.reduce(
          (s, { produk, jumlah }) => s + produk.harga * jumlah,
          0
        );
        total_watt = cartEntries.reduce(
          (s, { produk, jumlah }) => s + (produk.tdp_watt || 0) * jumlah,
          0
        );
      } else {
        rakitan_detail = Object.values(selectedProduk)
          .filter(Boolean)
          .map((p) => ({
            produk_id: p.id,
            nama_produk: p.nama_produk,
            kategori: BUILDER_STEPS.find((s) => s.id === p.kategori_id)?.name || "Unknown",
            harga_per_unit: p.harga,
            jumlah: 1,
          }));
        total_harga = rakitan_detail.reduce(
          (sum, d) => sum + d.harga_per_unit * d.jumlah,
          0
        );
        total_watt = tdp.total;
      }
      const payload = {
        nama_pembeli: form.nama_pembeli,
        email: form.email || null,
        no_telepon: form.no_telepon || null,
        rakitan_detail,
        total_harga,
        total_watt,
      };
      const res = await axios.post(`${API_BASE}/api/bayar/rakitan`, payload);
      setShowCheckout(false);
      alert(
        `✅ Transaksi berhasil!\n\nID: ${res.data.pembayaran_id}\nTotal: ${formatRupiah(res.data.invoice?.total_harga)}`
      );
      if (isCart) {
        setCartItems({});
        setShowCartPanel(false);
      } else {
        setCurrentStep(0);
        setSelectedProduk({});
      }
    } catch (err) {
      alert("❌ Checkout gagal: " + (err.response?.data?.message || err.message));
    } finally {
      setIsCheckingOut(false);
    }
  };
  // ── Current step meta ─────────────────────────────────────────────────────────
  const step = BUILDER_STEPS[currentStep];
  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="app-root">
      {}
      <nav className="top-nav">
        <div className="nav-brand">
          <span className="brand-icon"><IconComponent icon={faDesktop} /></span>
          <h1 className="brand-name">PcStore<span className="brand-id">ID</span></h1>
        </div>
        <div className="nav-tabs">
          <button
            id="tab-browse"
            className={`nav-tab${activeTab === "browse" ? " active" : ""}`}
            onClick={() => switchTab("browse")}
          >
            <IconComponent icon={faShoppingCart} /> Browse Store
          </button>
          <button
            id="tab-build"
            className={`nav-tab${activeTab === "build" ? " active" : ""}`}
            onClick={() => switchTab("build")}
          >
            <IconComponent icon={faWrench} /> PC Builder
          </button>
        </div>
        {activeTab === "browse" && (
          <button
            id="btn-nav-cart"
            type="button"
            className={`nav-cart-btn${showCartPanel ? " active" : ""}`}
            onClick={() => setShowCartPanel((v) => !v)}
          >
            <IconComponent icon={faShoppingCart} /> Keranjang
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        )}
        {activeTab === "build" && (
          <div className="nav-build-status">
            <span className="build-progress-text">
              {Object.keys(selectedProduk).length}/8 komponen
            </span>
            <div className="build-progress-bar">
              <div
                className="build-progress-fill"
                style={{ width: `${(Object.keys(selectedProduk).length / 8) * 100}%` }}
              />
            </div>
          </div>
        )}
      </nav>
      {}
      <div
        className={`app-body${
          activeTab === "build" || (activeTab === "browse" && showCartPanel)
            ? " has-right-panel"
            : ""
        }`}
      >
        {}
        <aside className="sidebar-left">
          {activeTab === "browse" ? (
            <div className="sidebar-section">
              <h3 className="sidebar-title"><IconComponent icon={faFolder} /> Kategori</h3>
              <div className="category-list">
                {categories.map((cat) => (
                  <button
                    key={cat.kategori_id}
                    id={`cat-btn-${cat.kategori_id}`}
                    className={`category-btn${selectedCategory === cat.kategori_id ? " active" : ""}`}
                    onClick={() => setSelectedCategory(cat.kategori_id)}
                  >
                    <IconComponent icon={getCategoryIcon(cat.kategori_id)} />
                    <span>{cat.nama_kategori}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="sidebar-section">
              <h3 className="sidebar-title"><IconComponent icon={faBullseye} /> Langkah Perakitan</h3>
              <StepProgress
                steps={BUILDER_STEPS}
                currentStep={currentStep}
                selectedMap={selectedProduk}
                onStepClick={setCurrentStep}
              />
            </div>
          )}
        </aside>
        {}
        <main className="main-content">
          {}
          {activeTab === "build" && (
            <div className="build-header">
              <div className="build-step-info">
                <span className="build-step-num">Langkah {currentStep + 1}/8</span>
                <h2 className="build-step-title">
                  <IconComponent icon={getCategoryIcon(step.id)} /> Pilih {step.name}
                  <span className="build-step-label"> — {step.label}</span>
                </h2>
                {!step.required && (
                  <span className="build-optional-tag">Komponen Opsional</span>
                )}
              </div>
              <div className="build-step-nav">
                <button
                  className="btn-step-nav"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep((s) => s - 1)}
                >
                  <IconComponent icon={faChevronLeft} /> Kembali
                </button>
                <button
                  className="btn-step-nav btn-step-skip"
                  disabled={currentStep === BUILDER_STEPS.length - 1}
                  onClick={() => setCurrentStep((s) => s + 1)}
                >
                  Lewati <IconComponent icon={faChevronRight} />
                </button>
              </div>
            </div>
          )}
          {}
          {activeTab === "browse" && !selectedCategory ? (
            <div className="empty-state">
              <div className="empty-icon"><IconComponent icon={faStore} /></div>
              <h3>Selamat Datang di PcStoreID</h3>
              <p>Pilih kategori di sebelah kiri untuk melihat produk</p>
            </div>
          ) : loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Memuat produk...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon"><IconComponent icon={faExclamationTriangle} /></div>
              <p>{error}</p>
              <button className="btn-retry" onClick={loadProduk}>Coba Lagi</button>
            </div>
          ) : produkList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><IconComponent icon={faInbox} /></div>
              <p>Tidak ada produk tersedia untuk kategori ini</p>
            </div>
          ) : (
            <div className="product-grid">
              {produkList.map((produk) => (
                <ProductCard
                  key={produk.id}
                  produk={produk}
                  mode={activeTab}
                  isSelected={
                    activeTab === "build"
                      ? selectedProduk[produk.kategori_id]?.id === produk.id
                      : !!cartItems[produk.id]
                  }
                  onSelect={activeTab === "browse" ? handleBrowseSelect : handleBuildSelect}
                />
              ))}
            </div>
          )}
        </main>
        {}
        {activeTab === "build" && (
          <BuildSummaryPanel
            selectedMap={selectedProduk}
            tdp={tdp}
            onReset={handleReset}
            isCheckoutReady={isCheckoutReady}
            onCheckout={() => openCheckout("build")}
          />
        )}
        {activeTab === "browse" && showCartPanel && (
          <CartSummaryPanel
            cartItems={cartItems}
            onUpdateQty={handleCartUpdateQty}
            onRemove={handleCartRemove}
            onClear={handleCartClear}
            onCheckout={() => openCheckout("cart")}
            getKategoriName={getKategoriName}
          />
        )}
      </div>
      {}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSubmit={handleCheckout}
          isLoading={isCheckingOut}
        />
      )}
    </div>
  );
}
