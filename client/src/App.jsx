import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import GiftFinder from './pages/GiftFinder.jsx';
import Results from './pages/Results.jsx';
import Shop from './pages/Shop.jsx';
import Occasions from './pages/Occasions.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import MyOrders from './pages/MyOrders.jsx';
import Wishlist from './pages/Wishlist.jsx';
import { Login, Register } from './pages/AuthPages.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/find-a-gift" element={<GiftFinder />} />
              <Route path="/find-a-gift/results" element={<Results />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/occasions" element={<Occasions />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Login required */}
              <Route element={<ProtectedRoute />}>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/wishlist" element={<Wishlist />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
