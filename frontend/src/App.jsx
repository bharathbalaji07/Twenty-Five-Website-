import React, { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import {
  BadgeCheck,
  BarChart3,
  Bell,
  Check,
  ChefHat,
  Clock,
  CreditCard,
  Edit3,
  IndianRupee,
  LogOut,
  Mail,
  MapPin,
  Moon,
  PackagePlus,
  Phone,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Sun,
  Trash2,
  Truck,
  Utensils,
  X
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { api } from './lib/api';
import { socket } from './lib/socket';

const emptyProduct = { name: '', price: '', image: '', description: '' };

function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

function statusTone(status) {
  return {
    Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200',
    Accepted: 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200',
    Preparing: 'bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200',
    Delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200'
  }[status] || 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200';
}

function productCategory(product) {
  const [category] = String(product.description || '').split(' - ');
  return category && category.length < 32 ? category : 'Popular';
}

function productSummary(product) {
  const parts = String(product.description || '').split(' - ');
  return parts.length > 1 ? parts.slice(1).join(' - ') : product.description;
}

function StatusBadge({ status }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(status)}`}>{status}</span>;
}

function ThemeButton({ dark, setDark }) {
  return (
    <button className="icon-btn" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('biteflow_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('biteflow_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="min-h-screen bg-[#fff8f4] text-ink transition-colors dark:bg-[#111013] dark:text-zinc-50">
      <Routes>
        <Route path="/" element={<CustomerSite dark={dark} setDark={setDark} />} />
        <Route path="/admin" element={<AdminGate dark={dark} setDark={setDark} />} />
      </Routes>
    </div>
  );
}

function CustomerSite({ dark, setDark }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    try {
      setError('');
      setProducts(await api.products());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    socket.on('products:changed', loadProducts);
    return () => socket.off('products:changed', loadProducts);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const filteredProducts = products.filter((product) =>
    [product.name, product.description].join(' ').toLowerCase().includes(search.toLowerCase())
  );
  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((groups, product) => {
      const category = productCategory(product);
      if (!groups[category]) groups[category] = [];
      groups[category].push(product);
      return groups;
    }, {});
  }, [filteredProducts]);
  const categoryNames = Object.keys(groupedProducts);

  const addToCart = (product) => {
    setConfirmation(null);
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...items, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id, quantity) => {
    setCart((items) =>
      quantity <= 0 ? items.filter((item) => item.id !== id) : items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleOrderPlaced = (order) => {
    setConfirmation(order);
    setCart([]);
    setCartOpen(false);
    setCheckoutOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#fff8f4]/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#111013]/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tomato-500 text-white shadow-lg shadow-tomato-500/25">
              <ChefHat size={22} />
            </span>
            <span>
              <span className="block text-lg font-black leading-none">Twenty Five</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-tomato-600">Chaats & Foods</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 rounded-full bg-white p-1 shadow-sm dark:bg-zinc-900 lg:flex">
              <a className="rounded-full px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-tomato-50 hover:text-tomato-600 dark:text-zinc-300 dark:hover:bg-white/10" href="#menu">Menu</a>
              <a className="rounded-full px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-tomato-50 hover:text-tomato-600 dark:text-zinc-300 dark:hover:bg-white/10" href="#about">About</a>
              <a className="rounded-full px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-tomato-50 hover:text-tomato-600 dark:text-zinc-300 dark:hover:bg-white/10" href="#contact">Contact</a>
            </nav>
            <Link className="secondary-btn hidden sm:inline-flex" to="/admin">
              <BarChart3 size={18} /> Admin
            </Link>
            <ThemeButton dark={dark} setDark={setDark} />
            <button className="primary-btn relative px-4" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={18} />
              <span>{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1.05fr_0.95fr] lg:py-14">
          <div className="animate-rise">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-tomato-600 shadow-sm dark:bg-white/10">
              <Bell size={16} /> Realtime kitchen updates
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Twenty Five favorites delivered without the wait.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
              Browse chef-picked meals, pay with simulated GPay QR or choose COD, and get live order status as the kitchen moves.
            </p>
            <div className="mt-7 flex max-w-xl items-center gap-3 rounded-full border border-zinc-200 bg-white p-2 shadow-soft dark:border-white/10 dark:bg-zinc-900">
              <Search className="ml-3 text-zinc-400" size={20} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
                placeholder="Search biryani, paneer, cooler..."
              />
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-zinc-950 shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80"
              alt="Restaurant table with plated food"
              className="h-full min-h-[360px] w-full object-cover opacity-80"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-3xl bg-white/92 p-5 shadow-soft backdrop-blur dark:bg-zinc-950/88">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-tomato-600">Tonight's rush</p>
                  <p className="text-2xl font-black">32 min average delivery</p>
                </div>
                <Truck className="text-tomato-500" size={34} />
              </div>
            </div>
          </div>
        </section>

        <section id="menu" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-16 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">Twenty Five menu</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Items are grouped by category and update live from admin.</p>
            </div>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm dark:bg-white/10">{filteredProducts.length} items</span>
          </div>

          {categoryNames.length > 0 && (
            <div className="sticky top-[73px] z-20 -mx-4 mb-6 overflow-x-auto border-y border-black/5 bg-[#fff8f4]/90 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#111013]/90 sm:mx-0 sm:rounded-2xl sm:border">
              <div className="flex gap-2">
                {categoryNames.map((category) => (
                  <a
                    key={category}
                    href={`#cat-${category.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}
                    className="whitespace-nowrap rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-tomato-200 hover:text-tomato-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    {category}
                  </a>
                ))}
              </div>
            </div>
          )}

          {error && <EmptyState title="Could not load menu" detail={error} />}
          {loading && <LoadingGrid />}
          {!loading && !error && filteredProducts.length === 0 && <EmptyState title="No dishes found" detail="Try a different search or check back soon." />}

          <div className="space-y-10">
            {categoryNames.map((category) => (
              <section key={category} id={`cat-${category.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`} className="scroll-mt-40">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black sm:text-2xl">{category}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{groupedProducts[category].length} items</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {groupedProducts[category].map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} onAdd={addToCart} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <AboutContact />
      </main>

      {confirmation && <Confirmation order={confirmation} onClose={() => setConfirmation(null)} />}
      <CartDrawer
        open={cartOpen}
        cart={cart}
        total={total}
        onClose={() => setCartOpen(false)}
        onQty={updateQty}
        onCheckout={() => setCheckoutOpen(true)}
      />
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          total={total}
          onClose={() => setCheckoutOpen(false)}
          onPlaced={handleOrderPlaced}
        />
      )}
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="h-44 animate-pulse rounded-3xl bg-white/80 dark:bg-white/10" />
      ))}
    </div>
  );
}

function ProductCard({ product, index, onAdd }) {
  return (
    <article
      className="glass-panel group grid min-h-[172px] grid-cols-[118px_1fr] overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-tomato-200 sm:grid-cols-[132px_1fr]"
      style={{ animationDelay: `${index * 25}ms` }}
    >
      <div className="h-full min-h-[172px] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex min-w-0 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="mb-1 inline-flex rounded-full bg-tomato-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-tomato-600 dark:bg-tomato-500/15 dark:text-tomato-100">
              {productCategory(product)}
            </span>
            <h4 className="line-clamp-2 text-base font-black leading-tight">{product.name}</h4>
          </div>
          <p className="whitespace-nowrap text-base font-black text-tomato-600">{money(product.price)}</p>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-zinc-600 dark:text-zinc-300">{productSummary(product)}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
            <Clock size={14} /> 15-25 min
          </span>
          <button className="primary-btn px-4 py-2 text-sm" onClick={() => onAdd(product)}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}

function AboutContact() {
  return (
    <section className="border-t border-black/5 bg-white/70 py-14 dark:border-white/10 dark:bg-zinc-950/45">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <div id="about" className="scroll-mt-28">
          <p className="text-sm font-black uppercase tracking-wider text-tomato-600">About us</p>
          <h2 className="mt-2 text-3xl font-black">Twenty Five Chaats & Foods</h2>
          <p className="mt-4 max-w-2xl leading-7 text-zinc-600 dark:text-zinc-300">
            A quick-service food spot serving chaats, fries, rolls, burgers, sandwiches, pizzas, juices, shakes, momos, waffles, and crispy fried snacks. Twenty Five brings the full counter menu online with live updates from the kitchen dashboard.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['101+', 'Menu items'],
              ['Live', 'Order updates'],
              ['COD', 'Payment option']
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
                <p className="text-2xl font-black text-tomato-600">{value}</p>
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="contact" className="scroll-mt-28 rounded-3xl bg-zinc-950 p-6 text-white shadow-soft">
          <p className="text-sm font-black uppercase tracking-wider text-tomato-300">Contact us</p>
          <h2 className="mt-2 text-3xl font-black">Need help with an order?</h2>
          <div className="mt-6 space-y-4">
            <ContactLine icon={Phone} title="Phone" detail="+91 98765 43210" />
            <ContactLine icon={Mail} title="Email" detail="orders@twentyfive.local" />
            <ContactLine icon={MapPin} title="Address" detail="Twenty Five Chaats & Foods, your local food street" />
            <ContactLine icon={Clock} title="Hours" detail="11:00 AM - 11:00 PM" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactLine({ icon: Icon, title, detail }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/10 p-4">
      <Icon className="mt-0.5 text-tomato-300" size={20} />
      <div>
        <p className="font-black">{title}</p>
        <p className="text-sm leading-6 text-zinc-300">{detail}</p>
      </div>
    </div>
  );
}

function EmptyState({ title, detail }) {
  return (
    <div className="glass-panel rounded-3xl p-10 text-center">
      <Utensils className="mx-auto text-tomato-500" size={38} />
      <h3 className="mt-4 text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{detail}</p>
    </div>
  );
}

function CartDrawer({ open, cart, total, onClose, onQty, onCheckout }) {
  return (
    <div className={`fixed inset-0 z-40 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/35 transition ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition duration-300 dark:bg-zinc-950 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-white/10">
          <div>
            <h2 className="text-xl font-black">Your cart</h2>
            <p className="text-sm text-zinc-500">{cart.length} selected items</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close cart"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <EmptyState title="Cart is empty" detail="Add something delicious to begin." />
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-3xl border border-zinc-100 p-3 dark:border-white/10">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm font-semibold text-tomato-600">{money(item.price)}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button className="icon-btn h-8 w-8" onClick={() => onQty(item.id, item.quantity - 1)}>-</button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button className="icon-btn h-8 w-8" onClick={() => onQty(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-zinc-100 p-5 dark:border-white/10">
          <div className="mb-4 flex items-center justify-between text-lg font-black">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
          <button className="primary-btn w-full" disabled={cart.length === 0} onClick={onCheckout}>
            <CreditCard size={18} /> Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}

function CheckoutModal({ cart, total, onClose, onPlaced }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', paymentMethod: 'gpay' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const order = await api.placeOrder({
        customer: { name: form.name, phone: form.phone, address: form.address },
        paymentMethod: form.paymentMethod,
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      });
      onPlaced(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
      <form onSubmit={submit} className="glass-panel max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Checkout</h2>
            <p className="text-sm text-zinc-500">Total {money(total)}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close checkout"><X size={18} /></button>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_0.8fr]">
          <div className="space-y-3">
            <input className="field" placeholder="Customer name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
            <input className="field" placeholder="Phone number" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
            <textarea className="field min-h-28 resize-none" placeholder="Delivery address" value={form.address} onChange={(e) => update('address', e.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              {[
                ['gpay', 'GPay QR'],
                ['cod', 'Cash on delivery']
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => update('paymentMethod', value)}
                  className={`rounded-2xl border p-4 text-left font-bold transition ${form.paymentMethod === value ? 'border-tomato-500 bg-tomato-50 text-tomato-700 dark:bg-tomato-500/15 dark:text-tomato-100' : 'border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-200">{error}</p>}
          </div>

          <div className="rounded-3xl bg-zinc-950 p-5 text-white">
            {form.paymentMethod === 'gpay' ? (
              <>
                <p className="font-black">Simulated GPay QR</p>
                <div className="my-5 grid aspect-square place-items-center rounded-3xl bg-white p-5">
                  <div className="grid h-full w-full grid-cols-5 grid-rows-5 gap-2">
                    {Array.from({ length: 25 }).map((_, index) => (
                      <span key={index} className={`${[0, 2, 4, 6, 8, 10, 12, 16, 18, 20, 22, 24].includes(index) ? 'bg-zinc-950' : 'bg-tomato-500'} rounded-md`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-zinc-300">Payment is marked paid after placing the order.</p>
              </>
            ) : (
              <>
                <p className="font-black">Cash on delivery</p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  The admin must manually confirm cash collection before the order can be marked delivered.
                </p>
              </>
            )}
          </div>
        </div>
        <button className="primary-btn mt-6 w-full" disabled={loading}>
          {loading ? 'Placing order...' : 'Place order'}
        </button>
      </form>
    </div>
  );
}

function Confirmation({ order, onClose }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500 text-white"><BadgeCheck size={28} /></span>
            <div>
              <h2 className="text-2xl font-black">Order confirmed</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Order ID {order.id} has been sent to the kitchen.</p>
            </div>
          </div>
          <button className="secondary-btn" onClick={onClose}>Dismiss</button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Info label="Customer" value={order.customer.name} />
          <Info label="Payment" value={order.paymentMethod === 'cod' ? 'Cash on delivery' : 'GPay QR'} />
          <Info label="Status" value={order.status} />
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 dark:bg-zinc-950">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function AdminGate({ dark, setDark }) {
  const [token, setToken] = useState(() => localStorage.getItem('biteflow_admin_token'));
  return token ? (
    <AdminDashboard dark={dark} setDark={setDark} onLogout={() => {
      localStorage.removeItem('biteflow_admin_token');
      setToken(null);
    }} />
  ) : (
    <AdminLogin dark={dark} setDark={setDark} onLogin={setToken} />
  );
}

function AdminLogin({ dark, setDark, onLogin }) {
  const [email, setEmail] = useState('admin@twentyfive.local');
  const [password, setPassword] = useState('admin12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api.login({ email, password });
      localStorage.setItem('biteflow_admin_token', result.token);
      onLogin(result.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <form onSubmit={submit} className="glass-panel w-full max-w-md rounded-3xl p-7">
        <div className="mb-7 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-black"><ChefHat className="text-tomato-500" /> Twenty Five Admin</Link>
          <ThemeButton dark={dark} setDark={setDark} />
        </div>
        <h1 className="text-3xl font-black">Secure login</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Manage products, orders, payments, and sales analytics.</p>
        <div className="mt-6 space-y-3">
          <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <input className="field" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
        </div>
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-200">{error}</p>}
        <button className="primary-btn mt-6 w-full" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
    </main>
  );
}

function AdminDashboard({ dark, setDark, onLogout }) {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  const refreshOrders = async () => setOrders(await api.orders());
  const refreshProducts = async () => setProducts(await api.products());
  const refreshAnalytics = async () => setAnalytics(await api.analytics());

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([refreshOrders(), refreshProducts(), refreshAnalytics()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    const orderHandler = (order) => {
      setToast(`New order ${order.id}`);
      refreshOrders();
      refreshAnalytics();
      window.setTimeout(() => setToast(''), 3500);
    };
    const orderChangedHandler = () => {
      refreshOrders();
      refreshAnalytics();
    };
    const productChangedHandler = () => refreshProducts();

    socket.on('orders:new', orderHandler);
    socket.on('orders:changed', orderChangedHandler);
    socket.on('products:changed', productChangedHandler);
    return () => {
      socket.off('orders:new', orderHandler);
      socket.off('orders:changed', orderChangedHandler);
      socket.off('products:changed', productChangedHandler);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#fff8f4]/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#111013]/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 font-black"><ChefHat className="text-tomato-500" /> Twenty Five Admin</Link>
          <div className="flex items-center gap-2">
            <ThemeButton dark={dark} setDark={setDark} />
            <button className="secondary-btn" onClick={onLogout}><LogOut size={18} /> Logout</button>
          </div>
        </div>
      </header>

      {toast && (
        <div className="fixed right-4 top-20 z-50 animate-rise rounded-2xl bg-zinc-950 px-5 py-4 font-bold text-white shadow-soft">
          <Bell className="mr-2 inline text-tomato-400" size={18} /> {toast}
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">Operations dashboard</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Realtime orders, live menu controls, and sales visibility.</p>
          </div>
          <nav className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-1 shadow-sm dark:bg-zinc-900">
            {[
              ['orders', ReceiptText, 'Orders'],
              ['products', PackagePlus, 'Products'],
              ['analytics', BarChart3, 'Analytics']
            ].map(([key, Icon, label]) => (
              <button key={key} onClick={() => setTab(key)} className={`rounded-xl px-3 py-2 text-sm font-bold transition ${tab === key ? 'bg-tomato-500 text-white' : 'text-zinc-500 hover:text-tomato-600'}`}>
                <Icon className="mx-auto mb-1" size={18} /> {label}
              </button>
            ))}
          </nav>
        </div>

        {loading ? <LoadingGrid /> : null}
        {!loading && tab === 'orders' && <OrdersPanel orders={orders} onRefresh={refreshAll} />}
        {!loading && tab === 'products' && <ProductsPanel products={products} onRefresh={refreshProducts} />}
        {!loading && tab === 'analytics' && <AnalyticsPanel analytics={analytics} orders={orders} />}
      </main>
    </>
  );
}

function OrdersPanel({ orders, onRefresh }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const run = async (label, action) => {
    setBusy(label);
    setError('');
    try {
      await action();
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  if (orders.length === 0) return <EmptyState title="No orders yet" detail="New customer orders will appear here instantly." />;

  return (
    <section>
      {error && <p className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-200">{error}</p>}
      <div className="grid gap-4">
        {orders.map((order) => (
          <article key={order.id} className="glass-panel rounded-3xl p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-black">{order.id}</h2>
                  <StatusBadge status={order.status} />
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold dark:bg-zinc-950">
                    {order.paymentMethod === 'cod' ? 'COD' : 'GPay'} - {order.paymentStatus}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {order.customer.name} - {order.customer.phone} - {order.customer.address}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span key={`${order.id}-${item.productId}-${item.name}`} className="rounded-full bg-white px-3 py-1 text-sm font-semibold dark:bg-zinc-950">
                      {item.quantity} x {item.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="min-w-[240px]">
                <p className="mb-3 text-right text-2xl font-black text-tomato-600">{money(order.total)}</p>
                <div className="grid grid-cols-2 gap-2">
                  {order.status === 'Pending' && (
                    <button className="secondary-btn" disabled={busy} onClick={() => run(order.id, () => api.updateStatus(order.id, 'Accepted'))}>
                      <Check size={16} /> Accept
                    </button>
                  )}
                  {order.status !== 'Delivered' && (
                    <button className="secondary-btn" disabled={busy} onClick={() => run(order.id, () => api.updateStatus(order.id, 'Preparing'))}>
                      <ChefHat size={16} /> Preparing
                    </button>
                  )}
                  {order.paymentMethod === 'cod' && order.paymentStatus !== 'Confirmed' && (
                    <button className="secondary-btn col-span-2" disabled={busy} onClick={() => run(order.id, () => api.confirmPayment(order.id))}>
                      <IndianRupee size={16} /> Confirm COD
                    </button>
                  )}
                  {order.status !== 'Delivered' && (
                    <button className="primary-btn col-span-2" disabled={busy || (order.paymentMethod === 'cod' && order.paymentStatus !== 'Confirmed')} onClick={() => run(order.id, () => api.updateStatus(order.id, 'Delivered'))}>
                      <Truck size={16} /> Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductsPanel({ products, onRefresh }) {
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const reset = () => {
    setForm(emptyProduct);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) await api.updateProduct(editingId, form);
      else await api.createProduct(form);
      reset();
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const edit = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name, price: product.price, image: product.image, description: product.description });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (product) => {
    setLoading(true);
    setError('');
    try {
      await api.deleteProduct(product.id);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={submit} className="glass-panel h-fit rounded-3xl p-5">
        <h2 className="text-2xl font-black">{editingId ? 'Edit product' : 'Add product'}</h2>
        <div className="mt-5 space-y-3">
          <input className="field" placeholder="Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
          <input className="field" placeholder="Price" type="number" min="1" value={form.price} onChange={(e) => update('price', e.target.value)} required />
          <input className="field" placeholder="Image URL" value={form.image} onChange={(e) => update('image', e.target.value)} required />
          <textarea className="field min-h-28 resize-none" placeholder="Description" value={form.description} onChange={(e) => update('description', e.target.value)} required />
        </div>
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-200">{error}</p>}
        <div className="mt-5 flex gap-2">
          <button className="primary-btn flex-1" disabled={loading}><PackagePlus size={18} /> {editingId ? 'Save' : 'Add'}</button>
          {editingId && <button type="button" className="secondary-btn" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <div className="grid gap-4">
        {products.length === 0 && <EmptyState title="No products" detail="Add your first menu item to publish it live." />}
        {products.map((product) => (
          <article key={product.id} className="glass-panel grid gap-4 rounded-3xl p-4 sm:grid-cols-[140px_1fr_auto]">
            <img src={product.image} alt={product.name} className="h-32 w-full rounded-2xl object-cover sm:w-36" />
            <div>
              <h3 className="text-lg font-black">{product.name}</h3>
              <p className="text-sm font-bold text-tomato-600">{money(product.price)}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{product.description}</p>
            </div>
            <div className="flex gap-2 sm:flex-col">
              <button className="icon-btn" onClick={() => edit(product)} aria-label="Edit product"><Edit3 size={18} /></button>
              <button className="icon-btn" onClick={() => remove(product)} aria-label="Delete product"><Trash2 size={18} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AnalyticsPanel({ analytics, orders }) {
  const cards = [
    ['Daily sales', money(analytics?.dailySales), CreditCard],
    ['Monthly sales', money(analytics?.monthlySales), BarChart3],
    ['Total revenue', money(analytics?.totalRevenue), IndianRupee],
    ['Number of orders', analytics?.numberOfOrders || 0, ReceiptText]
  ];

  const recent = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="glass-panel rounded-3xl p-5">
            <Icon className="text-tomato-500" size={24} />
            <p className="mt-5 text-sm font-bold text-zinc-500 dark:text-zinc-400">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="glass-panel rounded-3xl p-5">
        <h2 className="text-xl font-black">Revenue trend</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.chart || []}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef3f37" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#ef3f37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => money(value)} />
              <Area type="monotone" dataKey="revenue" stroke="#ef3f37" strokeWidth={3} fill="url(#revenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass-panel rounded-3xl p-5">
        <h2 className="text-xl font-black">Order history</h2>
        <div className="mt-4 divide-y divide-zinc-100 dark:divide-white/10">
          {recent.length === 0 && <p className="py-8 text-center text-sm text-zinc-500">No history yet.</p>}
          {recent.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-black">{order.id}</p>
                <p className="text-sm text-zinc-500">{order.customer.name} - {order.items.length} items</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <p className="font-black text-tomato-600">{money(order.total)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default App;
