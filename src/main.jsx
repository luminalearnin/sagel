import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Heart, Menu, Minus, Plus, Search, ShoppingBag, Star, UserRound, X } from 'lucide-react';
import { products } from './catalog.js';
import './styles.css';

const money = value => `₹${value.toLocaleString('en-IN')}`;
const collectionOf = name => {
  const n = name.toLowerCase();
  if (n.includes('jodha') || n.includes('mastani') || n.includes('drape') || n.includes('saree')) return 'drapes';
  if (n.includes('lehenga') || n.includes('rajkumari') || n.includes('indumati') || n.includes('seema') || n.includes('rekha') || n.includes('kavita') || n.includes('farshi') || n.includes('butter geet')) return 'festive';
  if (n.includes('set')) return 'co-ord';
  return 'everyday';
};
const moodImage = (terms) => products.find(p => terms.some(term => p.name.toLowerCase().includes(term)))?.image || products[0].image;

function ProductModal({ product, onClose, onAdd }) {
  const [size, setSize] = useState('M');
  return <div className="modal-layer" onMouseDown={onClose}><div className="product-modal" onMouseDown={e => e.stopPropagation()}>
    <button className="modal-close" onClick={onClose}><X size={18}/></button>
    <div className="modal-photo" style={{ backgroundImage: `url(${product.image})` }}><span>01 / 02</span></div>
    <div className="modal-info"><p className="eyebrow">{product.type} · made for plans</p><h2>{product.name}</h2><strong className="modal-price">{money(product.price)}</strong><p className="modal-description">A little colour, a little ease, and a silhouette that does not ask you to stand still. Made for repeat wears and very good entrances.</p><div className="size-heading"><span>Choose your size</span><button>Size guide <ArrowUpRight size={13}/></button></div><div className="size-picker">{['XS','S','M','L','XL'].map(s => <button className={size === s ? 'selected' : ''} onClick={() => setSize(s)} key={s}>{s}</button>)}</div><button className="primary-button wide" onClick={() => { onAdd(product, size); onClose(); }}>Add to bag <Plus size={15}/></button><p className="modal-note"><Check size={14}/> Easy returns · Free delivery above ₹2,500</p></div>
  </div></div>;
}

function CartDrawer({ cart, onClose, onUpdate, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  return <div className="drawer-layer" onMouseDown={onClose}><aside className="cart-panel" onMouseDown={e => e.stopPropagation()}><div className="panel-head"><div><p className="eyebrow">Your edit</p><h2>Bag <span>({cart.reduce((sum, item) => sum + item.qty, 0)})</span></h2></div><button className="modal-close" onClick={onClose}><X size={18}/></button></div>{cart.length ? <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.key}><div className="cart-thumb" style={{ backgroundImage: `url(${item.image})` }}/><div className="cart-copy"><span>{item.name}</span><small>Size {item.size} · {money(item.price)}</small><div className="quantity"><button onClick={() => onUpdate(item.key, -1)}><Minus size={12}/></button><b>{item.qty}</b><button onClick={() => onUpdate(item.key, 1)}><Plus size={12}/></button></div></div></div>)}</div><div className="cart-total"><div><span>Subtotal</span><strong>{money(total)}</strong></div><p>UPI and cash on delivery available. Shipping is free above ₹2,500.</p><button className="primary-button wide" onClick={onCheckout}>Continue to checkout <ArrowRight size={15}/></button></div></> : <div className="empty-bag"><ShoppingBag size={28}/><h3>Your bag is waiting.</h3><p>Start with the piece you keep thinking about.</p></div>}</aside></div>;
}

function AccountDrawer({ onClose, onSave, signedIn }) {
  const [details, setDetails] = useState({ email: '', phone: '', address: '' });
  return <div className="account-layer" onMouseDown={onClose}>
    <aside className="account-panel" onMouseDown={e => e.stopPropagation()}>
      <div className="panel-head"><div><p className="eyebrow">{signedIn ? 'Your details' : 'For your next order'}</p><h2>{signedIn ? 'Account' : 'Sign in'}</h2></div><button className="modal-close" onClick={onClose}><X size={18}/></button></div>
      <p className="account-intro">Save your delivery address and contact details once, then checkout feels effortless. This preview sign-in is for presentation only.</p>
      <form className="account-form" onSubmit={e => { e.preventDefault(); onSave(details); }}>
        <label>Email address<input type="email" required autoComplete="email" value={details.email} onChange={e => setDetails({ ...details, email: e.target.value })} placeholder="you@example.com" /></label>
        <label>Mobile number<input type="tel" required autoComplete="tel" value={details.phone} onChange={e => setDetails({ ...details, phone: e.target.value })} placeholder="+91 98765 43210" /></label>
        <label>Delivery address<textarea required autoComplete="street-address" value={details.address} onChange={e => setDetails({ ...details, address: e.target.value })} placeholder="House / flat, street, city, PIN" rows="3" /></label>
        <button className="primary-button wide" type="submit">Save details & continue <ArrowRight size={15}/></button>
      </form>
      <p className="account-note"><Check size={14}/> We’ll only use these details to prepare your order.</p>
    </aside>
  </div>;
}

function App() {
  const [filter, setFilter] = useState('all');
  const searchRef = useRef(null);
  const searchModalRef = useRef(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState('featured');
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [cart, setCart] = useState([]);
  const [saved, setSaved] = useState([]);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { if (!searchOpen) return; const onKey = e => e.key === 'Escape' && setSearchOpen(false); window.addEventListener('keydown', onKey); searchModalRef.current?.focus(); return () => window.removeEventListener('keydown', onKey); }, [searchOpen]);
  const filtered = useMemo(() => {
    let list = filter === 'all' ? products : filter === 'sale' ? products.filter(p => p.price < 2000) : products.filter(p => collectionOf(p.name) === filter);
    if (search.trim()) list = list.filter(p => `${p.name} ${p.type}`.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [filter, search, sort]);
  const add = (product, size = 'M') => setCart(current => { const key = `${product.id}-${size}`; const found = current.find(item => item.key === key); return found ? current.map(item => item.key === key ? { ...item, qty: item.qty + 1 } : item) : [...current, { ...product, key, size, qty: 1 }]; });
  const update = (key, delta) => setCart(current => current.map(item => item.key === key ? { ...item, qty: item.qty + delta } : item).filter(item => item.qty > 0));
  const jump = collection => { setFilter(collection); document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };
  return <div className="site-shell">
    <div className="topline"><span>Free delivery above ₹2,500</span><span>Easy returns · Made in India</span><span>UPI + COD available</span></div>
    <header className="site-header"><button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}><Menu size={19}/></button><a className="wordmark" href="#top">SAGEL<sup>™</sup></a><nav className={menuOpen ? 'open' : ''}><button onClick={() => jump('festive')}>Festive</button><button onClick={() => jump('everyday')}>Everyday ethnic</button><button onClick={() => jump('co-ord')}>Co-ord sets</button><button onClick={() => jump('drapes')}>Drapes</button><button onClick={() => jump('sale')}>Sale</button></nav><div className="header-actions"><button className="account-action" onClick={() => setAccountOpen(true)}><UserRound size={15}/><span>{signedIn ? 'Account' : 'Sign in'}</span></button><label className="search-box"><Search size={15}/><input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pieces" aria-label="Search pieces"/></label><button className="icon-action"><Heart size={18}/><span>{saved.length}</span></button><button className="bag-action" onClick={() => setBagOpen(true)}><ShoppingBag size={18}/><span>Bag {cart.reduce((sum, item) => sum + item.qty, 0)}</span></button></div></header>
    <main id="top">
      <section className="editorial-hero"><div className="hero-copy"><p className="eyebrow">The new SAGEL edit · 2026</p><h1>Come for the<br/><em>colour.</em><br/>Stay for the feeling.</h1><p className="hero-lede">Ethnic pieces for the friend who always knows where the good light is. Easy silhouettes, unexpected colour and a little extra drama for ordinary days.</p><button className="primary-button" onClick={() => jump('all')}>Shop the new edit <ArrowRight size={15}/></button><div className="hero-signoff"><span>Styled in Mumbai</span><span className="scribble">with love, always</span></div></div><div className="hero-visual"><div className="hero-image" style={{ backgroundImage: `url(${products[0].image})` }}/><div className="hero-note">for the<br/><i>main character</i><br/>in you <span>↗</span></div><div className="hero-stamp">SAGEL<br/><small>made for plans</small></div></div></section>
      <section className="human-strip"><div className="strip-mark">S</div><p>Not just ethnicwear.<br/><strong>Something to feel good in.</strong></p><span>01</span><p className="strip-aside">Thoughtful cuts, playful colour<br/>and the freedom to wear it your way.</p></section>
      <section className="mood-section"><div className="section-intro"><p className="eyebrow">Pick a mood</p><h2>What are you<br/><em>dressing for?</em></h2><p>Start with the plan. We will take care of the outfit.</p></div><div className="mood-grid"><button onClick={() => jump('festive')} className="mood-card mood-saffron"><div style={{ backgroundImage: `url(${moodImage(['jodha','mastani'])})` }}/><span>Festive plans <ArrowUpRight size={15}/></span></button><button onClick={() => jump('everyday')} className="mood-card mood-blue"><div style={{ backgroundImage: `url(${moodImage(['aasmani','veronica','cherry'])})` }}/><span>Everyday, elevated <ArrowUpRight size={15}/></span></button><button onClick={() => jump('sale')} className="mood-card mood-rose"><div style={{ backgroundImage: `url(${moodImage(['poo corset','cassata corset'])})` }}/><span>One more thing <ArrowUpRight size={15}/></span></button></div></section>
      <section className="shop-section" id="shop"><div className="shop-heading"><div><p className="eyebrow">The collection</p><h2>Pieces with<br/><em>personality.</em></h2></div><p className="shop-note">{products.length} pieces, picked for<br/>the next version of you.</p></div><div className="shop-controls"><div className="category-tabs">{[['all','All pieces'],['festive','Festive'],['everyday','Everyday ethnic'],['co-ord','Co-ord sets'],['drapes','Drapes'],['sale','Sale']].map(([id, label]) => <button className={filter === id ? 'active' : ''} onClick={() => setFilter(id)} key={id}>{label}</button>)}</div><label className="sort-control">Sort by <select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price low</option><option value="high">Price high</option></select><ChevronDown size={14}/></label></div>{search && <p className="search-result">Showing pieces for “{search}” · <button onClick={() => setSearch('')}>Clear search</button></p>}<div className="garment-grid">{filtered.map((product, index) => <article className="garment-card" key={product.id}><div className="garment-image" role="button" tabIndex="0" onClick={() => setActive(product)} onKeyDown={e => e.key === 'Enter' && setActive(product)}><img className="garment-photo" src={product.image} alt={product.name} loading={index < 4 ? 'eager' : 'lazy'} decoding="async" fetchPriority={index < 4 ? 'high' : 'auto'} /><span className="garment-number">{String(index + 1).padStart(2,'0')}</span><span className="quick-view">Quick view <ArrowUpRight size={14}/></span><button className="save-button" onClick={e => { e.stopPropagation(); setSaved(items => items.includes(product.id) ? items.filter(id => id !== product.id) : [...items, product.id]); }}><Heart size={16} fill={saved.includes(product.id) ? 'currentColor' : 'none'}/></button></div><div className="garment-meta"><div><small>{collectionOf(product.name)} · {product.stock ? 'in stock' : 'limited'}</small><h3>{product.name}</h3></div><strong>{money(product.price)}</strong></div><button className="add-line" onClick={() => add(product)}>Add to bag <Plus size={14}/></button></article>)}</div></section>
      <section className="journal-section"><div className="journal-image" style={{ backgroundImage: `url(${products[7].image})` }}/><div className="journal-copy"><p className="eyebrow">A note from SAGEL</p><h2>Wear the<br/><em>good feeling.</em></h2><p>There is no perfect way to wear a piece. There is only the way you make it yours — with sneakers, with jhumkas, with your mother’s dupatta, with a little bit of nerve.</p><div className="journal-byline"><span>Ritu, founder of SAGEL</span><span>Made in India · worn everywhere</span></div><button className="text-button" onClick={() => jump('all')}>Meet the collection <ArrowRight size={15}/></button></div></section>
    </main>
    <footer className="site-footer"><div><a className="wordmark" href="#top">SAGEL<sup>™</sup></a><p>Ethnic, but make it feel like you.</p></div><div className="footer-links"><div><b>Shop</b><button onClick={() => jump('festive')}>Festive</button><button onClick={() => jump('everyday')}>Everyday ethnic</button><button onClick={() => jump('sale')}>Sale</button></div><div><b>Need help?</b><a href="mailto:hello@sagel.in">Contact us</a><a href="#shop">Size guide</a><a href="#top">Shipping</a></div><div><b>Follow along</b><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a><a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a></div></div><div className="footer-bottom"><span>© 2026 SAGEL™</span><span>Made for the next plan.</span></div></footer>
    <div className="floating-dock" aria-label="Quick navigation"><button className="dock-active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><span>⌂</span><small>Home</small></button><button onClick={() => jump('all')}><span><ShoppingBag size={15}/></span><small>Shop</small></button><button onClick={() => setSearchOpen(true)}><span><Search size={15}/></span><small>Search</small></button><button onClick={() => setBagOpen(true)}><span><ShoppingBag size={15}/></span><small>Bag <b>{cart.reduce((sum, item) => sum + item.qty, 0)}</b></small></button></div>
    {searchOpen && <div className="search-layer" onMouseDown={() => setSearchOpen(false)}><section className="search-sheet" onMouseDown={e => e.stopPropagation()}><div className="search-sheet-head"><div><p className="eyebrow">Find your next feeling</p><h3>Search SAGEL</h3></div><button className="modal-close" onClick={() => setSearchOpen(false)}><X size={18}/></button></div><label className="search-sheet-input"><Search size={17}/><input ref={searchModalRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Try Poo, saree, kurti..." autoComplete="off"/></label><div className="search-sheet-results">{search.trim() ? filtered.slice(0, 8).map(product => <button key={product.id} onClick={() => { setActive(product); setSearchOpen(false); }}><span>{product.name}</span><small>{money(product.price)} <ArrowUpRight size={13}/></small></button>) : <><p className="search-hint">Browse the full edit by name, colour, or mood.</p><div className="search-chips"><button onClick={() => setSearch('saree')}>Sarees</button><button onClick={() => setSearch('kurti')}>Kurtis</button><button onClick={() => setSearch('set')}>Sets</button><button onClick={() => setSearch('pink')}>Pink pieces</button></div></>}</div></section></div>}
    {active && <ProductModal product={active} onClose={() => setActive(null)} onAdd={add}/>} {bagOpen && <CartDrawer cart={cart} onClose={() => setBagOpen(false)} onUpdate={update} onCheckout={() => { setBagOpen(false); setAccountOpen(true); }}/>} {accountOpen && <AccountDrawer signedIn={signedIn} onClose={() => setAccountOpen(false)} onSave={() => { setSignedIn(true); setAccountOpen(false); }}/>} 
  </div>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
