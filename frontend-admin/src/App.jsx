import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Store, CheckCircle, XCircle, Star, Trash2,
  Package, ShoppingCart, LogOut, RefreshCw, Sun, Plus, ExternalLink
} from 'lucide-react';
import { adminRequest } from './api';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('hh_admin_token') || '');
  const [email, setEmail] = useState('admin@hariyalhub.pk');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  const [section, setSection] = useState('nurseries');
  const [nurseries, setNurseries] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [guides, setGuides] = useState([]);

  const [newGuide, setNewGuide] = useState({ season: '', tempRange: '', recommendedPlants: '', instructionsText: '' });

  const fetchAllAdminData = async () => {
    try {
      const [nData, pData, oData, gData] = await Promise.all([
        adminRequest('/nurseries/admin/all'),
        adminRequest('/products/admin/all'),
        adminRequest('/orders/admin/all'),
        adminRequest('/guides')
      ]);
      setNurseries(nData);
      setProducts(pData);
      setOrders(oData);
      setGuides(gData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchAllAdminData();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await adminRequest('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('hh_admin_token', res.token);
      setToken(res.token);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleDecision = async (id, status) => {
    let rejectionReason = '';
    if (status === 'rejected') {
      rejectionReason = prompt('Enter rejection note for nursery owner:', 'Incomplete Sukkur verification or CNIC details') || '';
    }
    await adminRequest(`/nurseries/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason })
    });
    fetchAllAdminData();
  };

  const handleDeleteNursery = async (id) => {
    if (!confirm('Delete this nursery and all its listed plants?')) return;
    await adminRequest(`/nurseries/admin/${id}`, { method: 'DELETE' });
    fetchAllAdminData();
  };

  const handleToggleFeatured = async (id) => {
    await adminRequest(`/products/admin/${id}/featured`, { method: 'PATCH' });
    fetchAllAdminData();
  };

  const handleDeleteProduct = async (id) => {
    await adminRequest(`/products/admin/${id}`, { method: 'DELETE' });
    fetchAllAdminData();
  };

  const handleOrderStatus = async (id, status) => {
    await adminRequest(`/orders/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    fetchAllAdminData();
  };

  const handleAddGuide = async (e) => {
    e.preventDefault();
    const instructions = newGuide.instructionsText.split('\n').map((s) => s.trim()).filter(Boolean);
    await adminRequest('/guides/admin', {
      method: 'POST',
      body: JSON.stringify({
        season: newGuide.season,
        tempRange: newGuide.tempRange,
        recommendedPlants: newGuide.recommendedPlants,
        instructions
      })
    });
    setNewGuide({ season: '', tempRange: '', recommendedPlants: '', instructionsText: '' });
    fetchAllAdminData();
  };

  const handleDeleteGuide = async (id) => {
    await adminRequest(`/guides/admin/${id}`, { method: 'DELETE' });
    fetchAllAdminData();
  };

  const logout = () => {
    localStorage.removeItem('hh_admin_token');
    setToken('');
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full space-y-5 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">HariyalHub Admin Portal</h1>
              <p className="text-xs text-slate-400">Dedicated Super Admin Control Center</p>
            </div>
          </div>

          {loginError && <p className="text-xs text-red-400 bg-red-950/60 p-3 rounded-lg">{loginError}</p>}

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Admin Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Admin Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm" />
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-sm">
            Sign In to Admin Panel
          </button>
        </form>
      </div>
    );
  }

  const pendingCount = nurseries.filter((n) => n.status === 'pending').length;
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCommission = orders.reduce((sum, o) => sum + o.platformCommission, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
          <div>
            <h1 className="font-bold text-lg">HariyalHub Super Admin Portal</h1>
            <p className="text-xs text-slate-400">Approve Nurseries • Moderate Catalog • Manage Season Guides • Track 8% Commission</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-xs flex items-center gap-1.5">
            Open Main Website <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button onClick={fetchAllAdminData} className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-xs flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={logout} className="bg-red-950 hover:bg-red-900 text-red-300 px-3 py-2 rounded-lg text-xs flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs text-slate-400">Pending Nursery Applications</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs text-slate-400">Total Listed Plants & Seeds</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{products.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs text-slate-400">Gross Marketplace Sales</p>
            <p className="text-3xl font-bold text-white mt-1">Rs. {totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs text-slate-400">HariyalHub Revenue (8% Fee)</p>
            <p className="text-3xl font-bold text-cyan-400 mt-1">Rs. {totalCommission.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-b border-slate-800 pb-4">
          <button onClick={() => setSection('nurseries')} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${section === 'nurseries' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'}`}>
            <Store className="w-4 h-4" /> Nursery Applications ({nurseries.length})
          </button>
          <button onClick={() => setSection('products')} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${section === 'products' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'}`}>
            <Package className="w-4 h-4" /> Plants & Seeds Moderation ({products.length})
          </button>
          <button onClick={() => setSection('orders')} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${section === 'orders' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'}`}>
            <ShoppingCart className="w-4 h-4" /> Orders & Commissions ({orders.length})
          </button>
          <button onClick={() => setSection('guides')} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${section === 'guides' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'}`}>
            <Sun className="w-4 h-4" /> Season Guides ({guides.length})
          </button>
        </div>

        {section === 'nurseries' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Manage Nursery Onboarding (Approve / Reject)</h2>
            {nurseries.map((n) => (
              <div key={n._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{n.nurseryName}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                      n.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                      n.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {n.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">Owner: {n.ownerName} • CNIC: {n.cnic} • Phone: {n.phone}</p>
                  <p className="text-xs text-slate-400">Area: {n.area} • Email: {n.email}</p>
                  {n.rejectionReason && <p className="text-xs text-red-400">Rejection Note: {n.rejectionReason}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleDecision(n._id, 'approved')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => handleDecision(n._id, 'rejected')} className="bg-amber-600/80 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => handleDeleteNursery(n._id)} className="bg-red-950 hover:bg-red-900 text-red-300 p-2 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === 'products' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Catalog Moderation & Featured Promotion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400">{p.nursery?.nurseryName} • {p.category} • Rs. {p.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleFeatured(p._id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${p.isFeatured ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                      <Star className="w-3.5 h-3.5" /> {p.isFeatured ? 'Featured' : 'Promote'}
                    </button>
                    <button onClick={() => handleDeleteProduct(p._id)} className="bg-red-950 text-red-300 p-2 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Customer Orders & 8% Commission Ledger</h2>
            {orders.map((o) => (
              <div key={o._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-white">{o.orderCode} — {o.product?.name} (x{o.quantity})</p>
                  <p className="text-xs text-slate-400">Nursery: {o.nursery?.nurseryName} • Customer: {o.customerName} ({o.customerPhone}) • {o.deliveryAddress}</p>
                  <p className="text-xs text-emerald-400 mt-1">
                    Order Total: Rs. {o.totalAmount} | HariyalHub 8% Commission: Rs. {o.platformCommission} | Nursery Payout: Rs. {o.nurseryPayout}
                  </p>
                </div>
                <select value={o.status} onChange={(e) => handleOrderStatus(o._id, e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs">
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Dispatched</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {section === 'guides' && (
          <div className="space-y-6">
            <form onSubmit={handleAddGuide} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-400" /> Add Sukkur Seasonal Suggestion & Guide</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input required placeholder="Season Title (e.g. Spring: Feb–Apr)" value={newGuide.season} onChange={(e) => setNewGuide({ ...newGuide, season: e.target.value })} className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm" />
                <input required placeholder="Temp Range (e.g. 22°C – 34°C)" value={newGuide.tempRange} onChange={(e) => setNewGuide({ ...newGuide, tempRange: e.target.value })} className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm" />
                <input required placeholder="Recommended Plants & Seeds" value={newGuide.recommendedPlants} onChange={(e) => setNewGuide({ ...newGuide, recommendedPlants: e.target.value })} className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm" />
              </div>
              <textarea required placeholder="Care Instructions (one step per line)..." value={newGuide.instructionsText} onChange={(e) => setNewGuide({ ...newGuide, instructionsText: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm" rows="3" />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-semibold">Publish Seasonal Guide</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guides.map((g) => (
                <div key={g._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-amber-400">{g.tempRange}</span>
                    <h3 className="font-bold text-white mt-1">{g.season}</h3>
                    <p className="text-xs text-emerald-300 mt-2">{g.recommendedPlants}</p>
                    <ul className="mt-3 text-xs text-slate-300 list-disc pl-4 space-y-1">
                      {(g.instructions || []).map((st, idx) => <li key={idx}>{st}</li>)}
                    </ul>
                  </div>
                  <button onClick={() => handleDeleteGuide(g._id)} className="mt-4 text-xs text-red-400 hover:underline self-end">Delete Guide</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
