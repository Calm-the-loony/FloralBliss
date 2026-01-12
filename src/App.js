import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import BouquetShowcase from './components/BouquetShowcase/BouquetShowcase';
import Advantages from './components/Advantages/Advantages';
import Footer from './components/Footer/Footer';
import AuthForm from './pages/Auth/AuthForm';
import Profile from './pages/Profile/Profile';
import TermsOfService from './pages/safety/TermsOfService';
import PrivacyPolicy from './pages/safety/PrivacyPolicy';
import AboutUs from './pages/AboutUs/AboutUs';
import Delivery from './pages/Delivery/Delivery';
import Cart from './pages/Cart/Cart';
import Favorites from './pages/Favorites/Favorites';
import Bouquets from './pages/Bouquets/Bouquets';
import Plants from './pages/Plants/Plants';
import Compositions from './pages/Compositions/Compositions';
import CustomBouquet from './pages/CustomBouquet/CustomBouquet';
import NotFound from './pages/ErrorPages/NotFound';
import ServerError from './pages/ErrorPages/ServerError';
import AccessDenied from './pages/ErrorPages/AccessDenied';
import NetworkError from './pages/ErrorPages/NetworkError';
import './App.css';

function CartProviderWrapper({ children }) {
  const { user } = useAuth();
  const userId = user?.id_user || user?.id;
  
  return (
    <CartProvider userId={userId}>
      {children}
    </CartProvider>
  );
}

function FavoritesProviderWrapper({ children }) {
  const { user } = useAuth();
  const userId = user?.id_user || user?.id;
  
  return (
    <FavoritesProvider userId={userId}>
      {children}
    </FavoritesProvider>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <Advantages />
      <BouquetShowcase />
    </>
  );
}

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthForm type="login" />} />
            <Route path="/register" element={<AuthForm type="register" />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/bouquets" element={<Bouquets />} />
            <Route path="/plants" element={<Plants />} />
            <Route path="/compositions" element={<Compositions />} />
            <Route path="/custom-bouquet" element={<CustomBouquet />} />
            <Route path="/custom-composition" element={<CustomBouquet />} />

            {/* Страницы ошибок */}
            <Route path="/500" element={<ServerError />} />
            <Route path="/403" element={<AccessDenied />} />
            <Route path="/network-error" element={<NetworkError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProviderWrapper>
          <FavoritesProviderWrapper>
            <AppContent />
          </FavoritesProviderWrapper>
        </CartProviderWrapper>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;