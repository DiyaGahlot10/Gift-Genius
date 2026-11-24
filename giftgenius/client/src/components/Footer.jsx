import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

const columns = [
  {
    title: 'Discover',
    links: [
      { to: '/find-a-gift', label: 'Find a Gift' },
      { to: '/shop', label: 'Shop all gifts' },
      { to: '/occasions', label: 'Shop by occasion' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { to: '/shop?category=Personalized%20Gifts', label: 'Personalized Gifts' },
      { to: '/shop?category=Books%20and%20Stationery', label: 'Books and Stationery' },
      { to: '/shop?category=Home%20Decor', label: 'Home Decor' },
      { to: '/shop?category=Art%20and%20DIY%20Kits', label: 'Art and DIY Kits' },
    ],
  },
  {
    title: 'Your account',
    links: [
      { to: '/my-orders', label: 'My Orders' },
      { to: '/wishlist', label: 'Wishlist' },
      { to: '/cart', label: 'Cart' },
      { to: '/login', label: 'Log in' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-plum-800 text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs font-display text-lg text-white">
            Because every person deserves a thoughtful gift.
          </p>
          <p className="mt-3 max-w-xs text-sm text-white/60">
            Tell us about someone special and we will help you find something they will truly love.
          </p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <h3 className="font-sans text-sm font-semibold uppercase tracking-wider !text-blush-300">{c.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} GiftGenius. An academic e-commerce project.</p>
          <p>Demo store: online payments are simulated and no real money is charged.</p>
        </div>
      </div>
    </footer>
  );
}
