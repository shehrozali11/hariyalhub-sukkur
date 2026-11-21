import React, { useState, useEffect } from 'react';
import {
  Sprout, Store, Sun, ShoppingBag, MessageCircle, CheckCircle2,
  Clock, Plus, Trash2, Phone, MapPin, LogIn, UserPlus, LogOut, ExternalLink
} from 'lucide-react';
import { apiRequest } from './api';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';

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
    { from: 'bot', text: 'Assalam-o-Alaikum! I am HariyalHub AI Mali. Ask me about Sukkur summer plant care, indoor plants, or vegetable seeds!' }
  ]);

  const loadPublicData = async () => {
    try {
      const [prodData, nursData, guideData] = await Promise.all([
        apiRequest('/products'),
        apiRequest('/nurseries/approved'),
        apiRequest('/guides')
      ]);
      setProducts(prodData);
      setNurseries(nursData);
      setGuides(guideData);
      setBackendOnline(true);
    } catch (err) {
      setBackendOnline(false);
    }
  };

  const loadOwnerDashboard = async () => {
    if (!localStorage.getItem('hh_nursery_token')) return;
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
    } catch (err) {
      console.error(err);
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
      alert(err.message);
    }
  };

  const handleApplyNursery = async (e) => {
    e.preventDefault();
    setPortalMessage({ type: '', text: '' });
    try {
      const res = await apiRequest('/auth/nursery/apply', {
        method: 'POST',
        body: JSON.stringify(applyForm)
      });
      setPortalMessage({ type: 'success', text: res.message });
      setApplyForm({ nurseryName: '', ownerName: '', email: '', phone: '', cnic: '', password: '', area: '', specialty: '', description: '' });
    } catch (err) {
      setPortalMessage({ type: 'error', text: err.message });
    }
  };

  const handleNurseryLogin = async (e) => {
    e.preventDefault();
    setPortalMessage({ type: '', text: '' });
    try {
      const res = await apiRequest('/auth/nursery/login', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      });
      localStorage.setItem('hh_nursery_token', res.token);
      localStorage.setItem('hh_nursery_user', JSON.stringify(res.nursery));
      setNurseryUser(res.nursery);
      loadOwnerDashboard();
    } catch (err) {
      setPortalMessage({ type: 'error', text: err.message });
    }
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

  const handleLogout = () => {
    localStorage.removeItem('hh_nursery_token');
    localStorage.removeItem('hh_nursery_user');
    setNurseryUser(null);
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput.toLowerCase();
    let reply = 'For Sukkur homes, Snake Plant and Money Plant thrive indoors, while Sindhri Mango and Desi Roses love sunny lawns.';
    if (q.includes('summer') || q.includes('garmi') || q.includes('heat')) {
      reply = 'In Sukkur summer (45°C+), water before 7:30 AM, use 50% green shade net, and choose Aloe Vera, Sadabahar, or Bhindi seeds.';
    } else if (q.includes('seed') || q.includes('vegetable') || q.includes('sabzi')) {
      reply = 'For kitchen gardening, sow Bhindi (Okra) & Tomato seeds in Spring, and Palak (Spinach) & Coriander in Winter.';
    } else if (q.includes('indoor') || q.includes('room')) {
      reply = 'Snake Plant (Sansevieria) and Golden Pothos need minimal sunlight and survive AC rooms easily.';
    }
    setMessages([...messages, { from: 'user', text: chatInput }, { from: 'bot', text: reply }]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 p-2 rounded-xl">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HariyalHub</h1>
              <p className="text-xs text-emerald-200">Sukkur Local Nurseries & Plant Marketplace</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <button onClick={() => setTab('marketplace')} className={`px-3.5 py-2 rounded-lg transition ${tab === 'marketplace' ? 'bg-emerald-600 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}>
              Plants & Seeds
            </button>
            <button onClick={() => setTab('nurseries')} className={`px-3.5 py-2 rounded-lg transition ${tab === 'nurseries' ? 'bg-emerald-600 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}>
              Local Nurseries ({nurseries.length})
            </button>
            <button onClick={() => setTab('seasons')} className={`px-3.5 py-2 rounded-lg transition ${tab === 'seasons' ? 'bg-emerald-600 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}>
              Season Guides
            </button>
            <button onClick={() => setTab('partner')} className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${tab === 'partner' ? 'bg-amber-500 text-stone-950 font-semibold' : 'bg-emerald-800 text-amber-300 hover:bg-emerald-700'}`}>
              <Store className="w-4 h-4" />
              {nurseryUser ? `Partner: ${nurseryUser.nurseryName.slice(0, 15)}...` : 'Nursery Owner Portal'}
            </button>
            <a href="https://hariyalhub-admin.vercel.app" target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs flex items-center gap-1">
              Admin Portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </nav>
        </div>
      </header>

      {!backendOnline && (
        <div className="bg-red-600 text-white text-center text-sm py-2 px-4">
          Backend API disconnected! Start the Node/Express server (`npm run dev` inside `/backend`) on port 5000.
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {tab === 'marketplace' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="inline-block bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 text-xs px-3 py-1 rounded-full mb-3">
                  Sukkur & Rohri Digital Plant Bridge
                </span>
                <h2 className="text-2xl md:text-3xl font-bold">Find Local Nurseries, Discover Plants & Grow Better</h2>
                <p className="text-emerald-100 mt-2 max-w-2xl text-sm">
                  Explore indoor plants, fruit saplings, kitchen vegetable seeds, and organic fertilizers from approved Sukkur nurseries — Cash on Delivery.
                </p>
              </div>
              <button onClick={() => setTab('partner')} className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold px-5 py-3 rounded-xl text-sm shrink-0">
                Register Your Nursery →
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="text" placeholder="Search plant, seed, or nursery..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 text-sm">
                <option value="All">All Categories</option>
                <option value="Indoor Plants">Indoor Plants</option>
                <option value="Outdoor Plants">Outdoor Plants</option>
                <option value="Seeds & Saplings">Seeds & Saplings</option>
                <option value="Seasonal Fruits">Seasonal Fruits</option>
                <option value="Soil & Fertilizers">Soil & Fertilizers</option>
              </select>
              <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 text-sm">
                <option value="All">All Sukkur Seasons</option>
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
                      <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-900/90 text-white shadow">
                        {item.category}
                      </span>
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        {item.isFeatured && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 shadow">
                            Featured
                          </span>
                        )}
                        {item.isDemo && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-white/90 text-stone-700 shadow">
                            Sample
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-stone-900">{item.name}</h3>
                      <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5" /> {item.nursery?.nurseryName} ({item.nursery?.area})
                      </p>
                      <div className="mt-3 space-y-1.5 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl">
                        <p><strong>Space:</strong> {item.spaceSuitability}</p>
                        <p><strong>Best Season:</strong> {item.season}</p>
                        <p><strong>Watering:</strong> {item.wateringGuide}</p>
                        <p className="text-stone-500 pt-1">{item.careInstructions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-500 block">Price</span>
                      <span className="text-xl font-bold text-emerald-800">Rs. {item.price}</span>
                    </div>
                    <button onClick={() => setSelectedProduct(item)} className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5">
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
                <div key={n._id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{n.nurseryName}</h3>
                      <p className="text-sm text-stone-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-emerald-600" /> {n.area}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      {n.isDemo ? 'Sample Partner' : 'Verified Live Partner'}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700 mt-3">{n.description}</p>
                  <p className="text-xs text-stone-500 mt-2"><strong>Specialty:</strong> {n.specialty}</p>
                  <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-600" /> {n.phone}
                    </span>
                    <button onClick={() => { setNurseryFilter(n._id); setTab('marketplace'); }} className="text-sm font-semibold text-emerald-700 hover:underline">
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
                    <Sun className="w-4 h-4" /> {g.tempRange}
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">{g.season}</h3>
                  <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg mt-3">
                    <strong>Recommended:</strong> {g.recommendedPlants}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-stone-700 list-disc pl-5">
                    {(g.instructions || []).map((step, idx) => <li key={idx}>{step}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'partner' && (
          <div className="max-w-4xl mx-auto">
            {!nurseryUser ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex gap-3 border-b border-stone-200 pb-4 mb-6">
                  <button onClick={() => { setAuthMode('apply'); setPortalMessage({ type: '', text: '' }); }} className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 ${authMode === 'apply' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'}`}>
                    <UserPlus className="w-4 h-4" /> Apply to Register Nursery
                  </button>
                  <button onClick={() => { setAuthMode('login'); setPortalMessage({ type: '', text: '' }); }} className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 ${authMode === 'login' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'}`}>
                    <LogIn className="w-4 h-4" /> Nursery Owner Login
                  </button>
                </div>

                {portalMessage.text && (
                  <div className={`p-4 rounded-xl mb-6 text-sm ${portalMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {portalMessage.text}
                  </div>
                )}

                {authMode === 'apply' ? (
                  <form onSubmit={handleApplyNursery} className="space-y-4">
                    <h3 className="text-xl font-bold">Nursery Partner Application Form</h3>
                    <p className="text-sm text-stone-600">
                      Fill in your Sukkur nursery details. Once the Super Admin approves your application in the Admin Portal (`hariyalhub-admin.vercel.app`), your vendor account unlocks to publish plants and seeds.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required placeholder="Nursery Name" value={applyForm.nurseryName} onChange={(e) => setApplyForm({ ...applyForm, nurseryName: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required placeholder="Owner Full Name" value={applyForm.ownerName} onChange={(e) => setApplyForm({ ...applyForm, ownerName: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required type="email" placeholder="Email Address (Login ID)" value={applyForm.email} onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required placeholder="Phone / WhatsApp" value={applyForm.phone} onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required placeholder="Owner CNIC" value={applyForm.cnic} onChange={(e) => setApplyForm({ ...applyForm, cnic: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required type="password" placeholder="Create Account Password" value={applyForm.password} onChange={(e) => setApplyForm({ ...applyForm, password: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input required placeholder="Sukkur Location / Area" value={applyForm.area} onChange={(e) => setApplyForm({ ...applyForm, area: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                      <input placeholder="Specialty (Indoor, Fruits, Seeds...)" value={applyForm.specialty} onChange={(e) => setApplyForm({ ...applyForm, specialty: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                    </div>
                    <textarea placeholder="Short description of your nursery..." value={applyForm.description} onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" rows="2" />
                    <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-3 rounded-xl text-sm">
                      Submit Application for Admin Approval
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleNurseryLogin} className="space-y-4 max-w-md">
                    <h3 className="text-xl font-bold">Nursery Owner Login</h3>
                    <input required type="email" placeholder="Registered Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                    <input required type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                    <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm">
                      Sign In to Vendor Dashboard
                    </button>
                    <p className="text-xs text-stone-500 pt-2">
                      Sample Approved Login: <code>bilal@sindhgreen.pk</code> / <code>nursery123</code>
                    </p>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="text-xs text-stone-500">Nursery Vendor Account</span>
                    <h2 className="text-xl font-bold">{nurseryUser.nurseryName}</h2>
                    <p className="text-sm text-stone-600">{nurseryUser.ownerName} • {nurseryUser.area}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      nurseryUser.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      nurseryUser.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      Status: {nurseryUser.status}
                    </span>
                    <button onClick={handleLogout} className="text-sm text-red-600 hover:underline flex items-center gap-1">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>

                {nurseryUser.status !== 'approved' ? (
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-8 text-center space-y-3">
                    <Clock className="w-12 h-12 text-amber-600 mx-auto" />
                    <h3 className="text-xl font-bold text-amber-950">
                      {nurseryUser.status === 'pending' ? 'Application Pending Super Admin Review' : 'Application Rejected'}
                    </h3>
                    <p className="text-sm text-amber-900 max-w-lg mx-auto">
                      {nurseryUser.status === 'pending'
                        ? 'Please approve this application in the separate Super Admin Portal (https://hariyalhub-admin.vercel.app), then refresh this page to unlock item listing.'
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
                          <option>Seeds & Saplings</option>
                          <option>Seasonal Fruits</option>
                          <option>Soil & Fertilizers</option>
                        </select>
                        <input required type="number" placeholder="Price (PKR)" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
                        <select value={newItem.spaceSuitability} onChange={(e) => setNewItem({ ...newItem, spaceSuitability: e.target.value })} className="border rounded-lg p-2.5 text-sm">
                          <option>Low Light / Apartment</option>
                          <option>Balcony / Partial Sun</option>
                          <option>Full Sun / Lawn</option>
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
                        <input placeholder="Plant Photo URL (Optional — auto-fills default if blank)" value={newItem.imageUrl} onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })} className="border rounded-lg p-2.5 text-sm" />
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
                            <div key={o._id} className="border border-stone-100 p-3 rounded-xl text-sm flex flex-wrap justify-between gap-2">
                              <div>
                                <p className="font-bold">{o.orderCode} — {o.product?.name} (x{o.quantity})</p>
                                <p className="text-xs text-stone-600">{o.customerName} ({o.customerPhone}) • {o.deliveryAddress}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-emerald-800">Net Payout: Rs. {o.nurseryPayout}</p>
                                <p className="text-xs text-stone-500">Total Rs. {o.totalAmount} (8% Fee: Rs. {o.platformCommission})</p>
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
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> {orderNotice}
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-3">
                <input required placeholder="Your Full Name" value={orderForm.customerName} onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                <input required placeholder="Phone / WhatsApp Number" value={orderForm.customerPhone} onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                <input required placeholder="Sukkur Delivery Address" value={orderForm.deliveryAddress} onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
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
          <div className="bg-white border border-stone-200 shadow-xl rounded-2xl w-80 overflow-hidden">
            <div className="bg-emerald-800 text-white p-3 flex justify-between items-center text-sm font-semibold">
              <span>HariyalHub AI Mali</span>
              <button onClick={() => setChatOpen(false)}>✕</button>
            </div>
            <div className="p-3 h-60 overflow-y-auto space-y-2 text-xs bg-stone-50">
              {messages.map((m, i) => (
                <div key={i} className={`p-2.5 rounded-xl max-w-[85%] ${m.from === 'bot' ? 'bg-white border text-stone-800' : 'bg-emerald-700 text-white ml-auto'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} className="p-2 border-t flex gap-1.5">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask gardening question..." className="flex-1 text-xs border rounded-lg px-2.5 py-1.5" />
              <button type="submit" className="bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg">Send</button>
            </form>
          </div>
        ) : (
          <button onClick={() => setChatOpen(true)} className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold">
            <MessageCircle className="w-5 h-5" /> Ask AI Mali
          </button>
        )}
      </div>
    </div>
  );
}
