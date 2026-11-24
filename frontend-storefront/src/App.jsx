import React, { useEffect, useState } from 'react';
import {
  Sprout, Store, ShoppingBag, Sun, MessageCircle, Search,
  MapPin, Phone, Plus, Trash2, CheckCircle2, LogOut, Send, X
} from 'lucide-react';
import { apiRequest } from './api';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';

export default function App() {
  const [tab, setTab] = useState('marketplace');
  const [products, setProducts] = useState([]);
  const [nurseries, setNurseries] = useState([]);
  const [guides, setGuides] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [seasonFilter, setSeasonFilter] = useState('All');
  const [nurseryFilter, setNurseryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [backendOnline, setBackendOnline] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({ customerName: '', customerPhone: '', deliveryAddress: '', quantity: 1 });
  const [orderNotice, setOrderNotice] = useState('');

  const [nurseryUser, setNurseryUser] = useState(() => {
    const saved = localStorage.getItem('hh_nursery_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState('apply');
  const [applyForm, setApplyForm] = useState({
    nurseryName: '', ownerName: '', email: '', phone: '', cnic: '', password: '', area: '', specialty: '', description: ''
  });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [portalMessage, setPortalMessage] = useState({ type: '', text: '' });
  const [myListings, setMyListings] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '', category: 'Indoor Plants', price: '', stock: 20,
    spaceSuitability: 'Balcony / Partial Sun', season: 'All Seasons',
    wateringGuide: '', careInstructions: '', imageUrl: ''
  });

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Assalam-o-Alaikum! Main AI Mali hoon. Sukkur ke 45°C+ garmi ya monsoon ke mutabiq podon ki care poochein.'
    }
  ]);

  const loadPublicData = async () => {
    try {
      const [prodData, nurseryData, guideData] = await Promise.all([
        apiRequest('/products'),
        apiRequest('/nurseries/approved'),
        apiRequest('/guides')
      ]);
      setProducts(prodData);
      setNurseries(nurseryData);
      setGuides(guideData);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  };

  const loadOwnerDashboard = async () => {
    try {
      const [profile, listings, orders] = await Promise.all([
        apiRequest('/nurseries/me'),
        apiRequest('/products/my-listings'),
        apiRequest('/orders/my-orders')
      ]);
      setNurseryUser(profile);
      localStorage.setItem('hh_nursery_user', JSON.stringify(profile));
      setMyListings(listings);
      setMyOrders(orders);
    } catch {
      localStorage.removeItem('hh_nursery_token');
      localStorage.removeItem('hh_nursery_user');
      setNurseryUser(null);
    }
  };

  useEffect(() => {
    loadPublicData();
  }, []);

  useEffect(() => {
    if (nurseryUser) loadOwnerDashboard();
  }, [tab]);

  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSeason = seasonFilter === 'All' || p.season === seasonFilter;
    const matchNurs = nurseryFilter === 'All' || p.nursery?._id === nurseryFilter;
    const matchText =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nursery?.nurseryName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSeason && matchNurs && matchText;
  });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({ productId: selectedProduct._id, ...orderForm })
      });
      setOrderNotice(`Order ${res.order.orderCode} confirmed! Total: Rs. ${res.order.totalAmount} (Cash on Delivery).`);
      setOrderForm({ customerName: '', customerPhone: '', deliveryAddress: '', quantity: 1 });
      setTimeout(() => {
        setSelectedProduct(null);
        setOrderNotice('');
      }, 2600);
    } catch (err) {
      setOrderNotice(err.message);
    }
  };

  const handleApplyNursery = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/nurseries/apply', {
        method: 'POST',
        body: JSON.stringify(applyForm)
      });
      setPortalMessage({ type: 'success', text: res.message });
      setApplyForm({
        nurseryName: '', ownerName: '', email: '', phone: '', cnic: '', password: '', area: '', specialty: '', description: ''
      });
    } catch (err) {
      setPortalMessage({ type: 'error', text: err.message });
    }
  };

  const handleLoginNursery = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/nurseries/login', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      });
      localStorage.setItem('hh_nursery_token', res.token);
      localStorage.setItem('hh_nursery_user', JSON.stringify(res.nursery));
      setNurseryUser(res.nursery);
      setPortalMessage({ type: '', text: '' });
      loadOwnerDashboard();
    } catch (err) {
      setPortalMessage({ type: 'error', text: err.message });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_W = 800;
        const scale = Math.min(1, MAX_W / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
        setNewItem((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          ...newItem,
          price: Number(newItem.price),
          stock: Number(newItem.stock),
          imageUrl: newItem.imageUrl.trim() || FALLBACK_IMG
        })
      });
      setNewItem({
        name: '', category: 'Indoor Plants', price: '', stock: 20,
        spaceSuitability: 'Balcony / Partial Sun', season: 'All Seasons',
        wateringGuide: '', careInstructions: '', imageUrl: ''
      });
      loadOwnerDashboard();
      loadPublicData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    await apiRequest(`/products/${id}`, { method: 'DELETE' });
    loadOwnerDashboard();
    loadPublicData();
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput;
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setChatInput('');
    try {
      const res = await apiRequest('/ai-mali/chat', {
        method: 'POST',
        body: JSON.stringify({ message: q })
      });
      setMessages((prev) => [...prev, { role: 'bot', text: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Sukkur ke garm mausam mein subah 7 baje se pehle aur maghrib ke baad pani dein.' }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="bg-emerald-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setTab('marketplace')}>
            <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-400/30">
              <Sprout className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HariyalHub</h1>
              <p className="text-xs text-emerald-200">Sukkur Local Nurseries & Plant Marketplace</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <button
              onClick={() => setTab('marketplace')}
              className={`px-3.5 py-2 rounded-lg transition ${tab === 'marketplace' ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}
            >
              Plants & Seeds
            </button>
            <button
              onClick={() => setTab('nurseries')}
              className={`px-3.5 py-2 rounded-lg transition ${tab === 'nurseries' ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}
            >
              Local Nurseries ({nurseries.length})
            </button>
            <button
              onClick={() => setTab('seasons')}
              className={`px-3.5 py-2 rounded-lg transition ${tab === 'seasons' ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}
            >
              Season Guides
            </button>
            <button
              onClick={() => setTab('portal')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${tab === 'portal' ? 'bg-amber-500 text-stone-950 font-semibold' : 'bg-emerald-800 text-amber-200 hover:bg-emerald-700'}`}
            >
              <Store className="w-4 h-4" />
              {nurseryUser ? `Partner: ${nurseryUser.nurseryName.slice(0, 15)}...` : 'Nursery Owner Portal'}
            </button>
          </nav>
        </div>
      </header>

      {!backendOnline && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-center py-2 text-xs font-medium">
          Backend API offline. Start backend server on port 5000 (`npm run dev`).
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {tab === 'marketplace' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-6 md:p-8 shadow-sm">
              <span className="inline-block bg-emerald-500/20 border border-emerald-300/30 text-emerald-200 text-xs px-3 py-1 rounded-full mb-3">
                Verified Sukkur Nurseries • Direct Cash on Delivery
              </span>
              <h2 className="text-2xl md:text-3xl font-bold">
                Har Ghar Sabz, Har Aangan Khushhaal — Sukkur&apos;s Digital Nursery Hub
              </h2>
              <p className="text-emerald-100 text-sm mt-2 max-w-2xl">
                Order heat-resilient indoor plants, seasonal flowers, kitchen-garden seeds, and organic fertilizers directly from approved nurseries on Rohri Bypass, Airport Road, and Military Road.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plant or nursery..."
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 text-sm">
                <option value="All">All Categories</option>
                <option value="Indoor Plants">Indoor Plants</option>
                <option value="Outdoor Plants">Outdoor Plants</option>
                <option value="Seeds">Seeds</option>
                <option value="Soil & Fertilizers">Soil & Fertilizers</option>
              </select>

              <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 text-sm">
                <option value="All">All Seasons</option>
                <option value="All Seasons">All Seasons</option>
                <option value="Summer (Garmi)">Summer (Garmi)</option>
                <option value="Monsoon (Barsat)">Monsoon (Barsat)</option>
                <option value="Winter (Sardi)">Winter (Sardi)</option>
                <option value="Spring (Bahar)">Spring (Bahar)</option>
              </select>

              <select value={nurseryFilter} onChange={(e) => setNurseryFilter(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 text-sm">
                <option value="All">All Approved Nurseries</option>
                {nurseries.map((n) => (
                  <option key={n._id} value={n._id}>{n.nurseryName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((item) => (
                <div key={item._id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition">
                  <div>
                    <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={item.imageUrl || FALLBACK_IMG}
                        alt={item.name}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/95 text-emerald-800 shadow-sm">
                        {item.category}
                      </span>
                      <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full bg-amber-100/95 text-amber-900 font-medium shadow-sm">
                        {item.season}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-stone-900">{item.name}</h3>
                      <p className="text-xs text-stone-500 mt-1">
                        Sold by <span className="font-semibold text-stone-700">{item.nursery?.nurseryName}</span> • {item.nursery?.area}
                      </p>
                      <div className="mt-3 space-y-1 text-xs text-stone-600 bg-stone-50 p-3 rounded-lg">
                        <p><strong>Space:</strong> {item.spaceSuitability}</p>
                        <p><strong>Watering:</strong> {item.wateringGuide || 'Moderate watering'}</p>
                        <p><strong>Care:</strong> {item.careInstructions || 'Keep in bright indirect light'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-500 block">Price</span>
                      <span className="text-xl font-bold text-emerald-800">Rs. {item.price}</span>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(item)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-4 h-4" /> Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'nurseries' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Approved Local Nurseries in Sukkur</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nurseries.map((n) => (
                <div
                  key={n._id}
                  onClick={() => {
                    setCategoryFilter('All');
                    setSeasonFilter('All');
                    setSearchQuery('');
                    setNurseryFilter(n._id);
                    setTab('marketplace');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="cursor-pointer bg-white border border-stone-200 hover:border-emerald-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-bold text-stone-900">{n.nurseryName}</h3>
                        <p className="text-sm text-stone-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4 text-emerald-600" /> {n.area}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${n.isSample ? 'bg-stone-100 text-stone-600' : 'bg-emerald-100 text-emerald-800'}`}>
                        {n.isSample ? 'Sample Partner' : 'Verified Live Partner'}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mt-3">{n.description}</p>
                    <p className="text-xs text-stone-500 mt-2"><strong>Specialty:</strong> {n.specialty}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-600" /> {n.phone}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryFilter('All');
                        setSeasonFilter('All');
                        setSearchQuery('');
                        setNurseryFilter(n._id);
                        setTab('marketplace');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      Browse Plants →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'seasons' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Sukkur Season-Wise Planting Suggestions & Care Instructions</h2>
              <p className="text-sm text-stone-600 mt-1">Managed dynamically via backend database for Upper Sindh weather conditions.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guides.map((g) => (
                <div key={g._id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs mb-2">
                    <Sun className="w-4 h-4" /> {g.season}
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">{g.title}</h3>
                  <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg mt-3">
                    <strong>Recommended:</strong> {g.recommendedPlants}
                  </p>
                  <p className="text-sm text-stone-600 mt-3 leading-relaxed">{g.careInstructions}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'portal' && (
          <div className="max-w-4xl mx-auto">
            {!nurseryUser ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex gap-3 border-b border-stone-200 pb-4 mb-6">
                  <button
                    onClick={() => { setAuthMode('apply'); setPortalMessage({ type: '', text: '' }); }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${authMode === 'apply' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'}`}
                  >
                    Register / Apply as Nursery Owner
                  </button>
                  <button
                    onClick={() => { setAuthMode('login'); setPortalMessage({ type: '', text: '' }); }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${authMode === 'login' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'}`}
                  >
                    Existing Partner Login
                  </button>
                </div>

                {portalMessage.text && (
                  <div className={`p-3.5 rounded-xl text-sm mb-5 ${portalMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {portalMessage.text}
                  </div>
                )}

                {authMode === 'apply' ? (
                  <form onSubmit={handleApplyNursery} className="space-y-4">
                    <h3 className="text-xl font-bold">Nursery Partner Application Form</h3>
                    <p className="text-sm text-stone-600">
                      Fill in your Sukkur nursery details. Once the Super Admin approves your application, your vendor account unlocks to publish plants and seeds.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required placeholder="Nursery Name" value={applyForm.nurseryName} onChange={(e) => setApplyForm({ ...applyForm, nurseryName: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required placeholder="Owner Full Name" value={applyForm.ownerName} onChange={(e) => setApplyForm({ ...applyForm, ownerName: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required type="email" placeholder="Email Address" value={applyForm.email} onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required placeholder="Phone (03xx-xxxxxxx)" value={applyForm.phone} onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required placeholder="Owner CNIC" value={applyForm.cnic} onChange={(e) => setApplyForm({ ...applyForm, cnic: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required type="password" placeholder="Create Password" value={applyForm.password} onChange={(e) => setApplyForm({ ...applyForm, password: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required placeholder="Sukkur Area / Road (e.g. Rohri Bypass)" value={applyForm.area} onChange={(e) => setApplyForm({ ...applyForm, area: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input placeholder="Specialty (e.g. Indoor Plants, Fruit Saplings)" value={applyForm.specialty} onChange={(e) => setApplyForm({ ...applyForm, specialty: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                    </div>
                    <textarea rows="3" placeholder="Brief description of your nursery..." value={applyForm.description} onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                    <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
                      Submit Nursery Application
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLoginNursery} className="space-y-4 max-w-md">
                    <h3 className="text-xl font-bold">Nursery Partner Sign In</h3>
                    <input required type="email" placeholder="Registered Nursery Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                    <input required type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                    <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
                      Sign In to Nursery Dashboard
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Nursery Vendor Account</span>
                    <h2 className="text-2xl font-bold">{nurseryUser.nurseryName}</h2>
                    <p className="text-sm text-stone-600">{nurseryUser.ownerName} • {nurseryUser.area}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${nurseryUser.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : nurseryUser.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                      Status: {nurseryUser.status}
                    </span>
                    <button
                      onClick={() => {
                        localStorage.removeItem('hh_nursery_token');
                        localStorage.removeItem('hh_nursery_user');
                        setNurseryUser(null);
                      }}
                      className="text-sm text-red-600 hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>

                {nurseryUser.status !== 'approved' ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2">
                    <h3 className="text-lg font-bold text-amber-950">
                      {nurseryUser.status === 'pending' ? 'Application Pending Super Admin Approval' : 'Application Rejected'}
                    </h3>
                    <p className="text-sm text-amber-900 max-w-lg mx-auto">
                      {nurseryUser.status === 'pending'
                        ? 'Your application is currently under review by the Super Admin. Once approved, refresh this page to unlock item listing.'
                        : `Rejection Reason: ${nurseryUser.rejectionReason}`}
                    </p>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleAddItem} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-emerald-700" /> List New Plant, Seed, or Fertilizer
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input required placeholder="Item Name (e.g. Desi Gulab)" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                        <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="border rounded-lg p-2.5 text-sm">
                          <option>Indoor Plants</option>
                          <option>Outdoor Plants</option>
                          <option>Seeds</option>
                          <option>Soil & Fertilizers</option>
                        </select>
                        <input required type="number" placeholder="Price (PKR)" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                        <select value={newItem.spaceSuitability} onChange={(e) => setNewItem({ ...newItem, spaceSuitability: e.target.value })} className="border rounded-lg p-2.5 text-sm">
                          <option>Balcony / Partial Sun</option>
                          <option>Full Sun / Rooftop</option>
                          <option>Indoor / Low Light</option>
                          <option>Kitchen Garden / Yard</option>
                        </select>
                        <select value={newItem.season} onChange={(e) => setNewItem({ ...newItem, season: e.target.value })} className="border rounded-lg p-2.5 text-sm">
                          <option>All Seasons</option>
                          <option>Summer (Garmi)</option>
                          <option>Monsoon (Barsat)</option>
                          <option>Winter (Sardi)</option>
                          <option>Spring (Bahar)</option>
                        </select>
                        <input placeholder="Watering Guide" value={newItem.wateringGuide} onChange={(e) => setNewItem({ ...newItem, wateringGuide: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-2 text-sm flex items-center justify-between gap-2 bg-stone-50">
                          <label className="cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-md text-xs font-medium shrink-0">
                            Browse Plant Photo
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                          <span className="text-xs text-stone-500 truncate">
                            {newItem.imageUrl ? 'Photo selected & ready' : 'No file chosen (Optional)'}
                          </span>
                          {newItem.imageUrl && (
                            <img src={newItem.imageUrl} alt="Preview" className="w-8 h-8 rounded object-cover border shrink-0" />
                          )}
                        </div>
                        <input placeholder="Care Instructions for Customers" value={newItem.careInstructions} onChange={(e) => setNewItem({ ...newItem, careInstructions: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      </div>
                      <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                        Publish Item Live
                      </button>
                    </form>

                    <div className="bg-white border border-stone-200 rounded-2xl p-6">
                      <h3 className="text-lg font-bold mb-4">Your Published Catalog ({myListings.length})</h3>
                      <div className="space-y-3">
                        {myListings.map((item) => (
                          <div key={item._id} className="flex items-center justify-between border border-stone-100 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                              <img src={item.imageUrl || FALLBACK_IMG} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-stone-100" />
                              <div>
                                <p className="font-semibold text-sm">{item.name} <span className="text-xs text-stone-500">({item.category})</span></p>
                                <p className="text-xs text-emerald-700 font-semibold">Rs. {item.price} • {item.season}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteItem(item._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-2xl p-6">
                      <h3 className="text-lg font-bold mb-4">Orders Received ({myOrders.length})</h3>
                      {myOrders.length === 0 ? (
                        <p className="text-sm text-stone-500">No orders placed yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {myOrders.map((o) => (
                            <div
                              key={o._id}
                              onClick={() => setSelectedOrder(o)}
                              className="cursor-pointer border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/30 p-3.5 rounded-xl text-sm flex flex-wrap justify-between items-center gap-2 transition"
                            >
                              <div>
                                <p className="font-bold text-stone-900">
                                  {o.orderCode} — {o.product?.name || 'Plant / Seed Item'} (x{o.quantity})
                                </p>
                                <p className="text-xs text-stone-600 mt-0.5">
                                  {o.customerName} ({o.customerPhone}) • {o.deliveryAddress}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-emerald-800">Net Payout: Rs. {o.nurseryPayout}</p>
                                <p className="text-xs text-stone-500">Total Rs. {o.totalAmount} (8% Fee: Rs. {o.platformCommission})</p>
                                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 underline">
                                  Click to View Full Details →
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Customer Order Details</span>
                <h3 className="text-lg font-bold text-stone-900">{selectedOrder.orderCode}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                {selectedOrder.status || 'Confirmed (COD)'}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
              <img
                src={selectedOrder.product?.imageUrl || FALLBACK_IMG}
                alt={selectedOrder.product?.name || 'Plant'}
                className="w-14 h-14 rounded-lg object-cover bg-stone-200 shrink-0"
              />
              <div>
                <p className="font-bold text-stone-900">{selectedOrder.product?.name || 'Plant / Seed Item'}</p>
                <p className="text-xs text-stone-600">
                  Category: {selectedOrder.product?.category || 'Nursery Item'} • Quantity: <strong>{selectedOrder.quantity}</strong>
                </p>
                {selectedOrder.createdAt && (
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Ordered on: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm border-t border-stone-100 pt-3">
              <p className="font-semibold text-stone-800">Customer & Delivery Information</p>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <span className="text-stone-500">Customer Name:</span>
                <span className="col-span-2 font-medium text-stone-900">{selectedOrder.customerName}</span>
                <span className="text-stone-500">Phone Number:</span>
                <a href={`tel:${selectedOrder.customerPhone}`} className="col-span-2 font-medium text-emerald-700 underline">
                  {selectedOrder.customerPhone}
                </a>
                <span className="text-stone-500">Sukkur Address:</span>
                <span className="col-span-2 font-medium text-stone-900">{selectedOrder.deliveryAddress}</span>
                <span className="text-stone-500">Payment Mode:</span>
                <span className="col-span-2 font-medium text-stone-900">Cash on Delivery (COD)</span>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Gross Order Amount (x{selectedOrder.quantity}):</span>
                <span>Rs. {selectedOrder.totalAmount}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>HariyalHub Platform Fee (8%):</span>
                <span>- Rs. {selectedOrder.platformCommission}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-emerald-900 border-t border-emerald-200 pt-1.5 mt-1">
                <span>Your Net Nursery Payout:</span>
                <span>Rs. {selectedOrder.nurseryPayout}</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-sm font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <img src={selectedProduct.imageUrl || FALLBACK_IMG} alt={selectedProduct.name} className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <h3 className="text-lg font-bold">Order {selectedProduct.name}</h3>
                <p className="text-xs text-stone-600">Sold by {selectedProduct.nursery?.nurseryName} • COD in Sukkur</p>
              </div>
            </div>

            {orderNotice ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-sm flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <span>{orderNotice}</span>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-3">
                <input required placeholder="Your Full Name" value={orderForm.customerName} onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                <input required placeholder="Phone Number (03xx-xxxxxxx)" value={orderForm.customerPhone} onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                <input required placeholder="Delivery Address in Sukkur" value={orderForm.deliveryAddress} onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Quantity:</label>
                  <input type="number" min="1" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })} className="w-24 border rounded-lg p-2 text-sm" />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setSelectedProduct(null)} className="px-4 py-2 text-sm text-stone-600">Cancel</button>
                  <button type="submit" className="bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold">
                    Confirm COD Order (Rs. {selectedProduct.price * orderForm.quantity})
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-40">
        {chatOpen ? (
          <div className="w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-emerald-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="text-sm font-bold">AI Mali — Sukkur Assistant</p>
                  <p className="text-[11px] text-emerald-200">Urdu / English Plant Care</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-3 h-72 overflow-y-auto space-y-2.5 bg-stone-50 text-xs">
              {messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-emerald-700 text-white ml-auto' : 'bg-white border border-stone-200 text-stone-800'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="p-2.5 border-t border-stone-200 flex gap-2 bg-white">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask AI Mali..." className="flex-1 text-xs border rounded-lg px-3 py-2" />
              <button type="submit" className="bg-emerald-700 text-white p-2 rounded-lg"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setChatOpen(true)}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold"
          >
            <MessageCircle className="w-5 h-5" /> Ask AI Mali
          </button>
        )}
      </div>
    </div>
  );
}