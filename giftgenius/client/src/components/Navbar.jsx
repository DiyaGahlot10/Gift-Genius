import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, LogOut, Menu, Package, ShoppingBag, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/find-a-gift', label: 'Find a Gift' },
  { to: '/shop', label: 'Shop' },
  { to: '/occasions', label: 'Occasions' },
];

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? 'bg-lavender-100 text-plum-700' : 'text-ink/70 hover:bg-lavender-50 hover:text-plum-700'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menus on navigation.
  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [location.pathname]);

  // Close the account menu when clicking elsewhere.
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-plum-600/10 bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/find-a-gift" className="btn-primary hidden !px-4 !py-2 lg:inline-flex">
            <Sparkles className="h-4 w-4" /> Find a gift
          </Link>

          <Link
            to="/cart"
            aria-label={`Cart, ${cart.itemCount} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-plum-600 transition hover:bg-lavender-100"
          >
            <ShoppingBag className="h-5 w-5" />
            {cart.itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blush-400 px-1 text-[11px] font-bold text-white">
                {cart.itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-lavender-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plum-600 text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate text-sm font-medium">{user.name.split(' ')[0]}</span>
                <ChevronDown className="h-4 w-4 text-plum-500" />
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift">
                  <Link to="/my-orders" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-lavender-50">
                    <Package className="h-4 w-4 text-plum-500" /> My Orders
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-lavender-50">
                    <Heart className="h-4 w-4 text-plum-500" /> Wishlist
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-lavender-50"
                  >
                    <LogOut className="h-4 w-4 text-plum-500" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-secondary hidden !px-5 !py-2 md:inline-flex">
              Log in
            </Link>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full text-plum-600 hover:bg-lavender-100 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-plum-600/10 bg-cream px-4 pb-5 pt-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to="/my-orders" className={linkClass}>My Orders</NavLink>
                <NavLink to="/wishlist" className={linkClass}>Wishlist</NavLink>
                <button onClick={handleLogout} className="rounded-full px-4 py-2 text-left text-sm font-medium text-ink/70 hover:bg-lavender-50">
                  Log out ({user.name.split(' ')[0]})
                </button>
              </>
            ) : (
              <NavLink to="/login" className={linkClass}>Log in / Register</NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
