import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout.jsx';
import { Home } from './pages/Home.jsx';
import { Shop } from './pages/Shop.jsx';
import { Deals } from './pages/Deals.jsx';
import { NewArrivals } from './pages/NewArrivals.jsx';
import { ProductDetail } from './pages/ProductDetail.jsx';
import { Blog, BlogPost } from './pages/Blog.jsx';
import { Contact } from './pages/Contact.jsx';
import { Info } from './pages/Info.jsx';
import { Checkout } from './pages/Checkout.jsx';
import { OrderConfirmation } from './pages/OrderConfirmation.jsx';
import { Account } from './pages/Account.jsx';
import { Login, Signup } from './pages/Auth.jsx';
import { Admin } from './pages/Admin.jsx';
import { NotFound } from './pages/NotFound.jsx';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="deals" element={<Deals />} />
        <Route path="new-arrivals" element={<NewArrivals />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="contact" element={<Contact />} />
        <Route path="info/:slug" element={<Info />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order/:reference" element={<OrderConfirmation />} />
        <Route path="account" element={<Account />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
