import { useEffect, useState } from 'react';
import './Header.css';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getCartItemsCount } = useCart();
  const { getFavoritesCount } = useFavorites();
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => navigate('/');
  const handleAuthClick = () => navigate('/login');
  const handleProfileClick = () => navigate('/profile');
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const getInitials = () => {
    if (!user) return 'П';
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    return user.email ? user.email.charAt(0).toUpperCase() : 'П';
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header__container">
        <div className="header__logo" onClick={handleLogoClick}>
          <div className="logo__icon">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 16C16 10 20 6 26 6C26 12 22 16 16 16Z" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2"/>
              <path d="M16 16C16 22 12 26 6 26C6 20 10 16 16 16Z" fill="#8BC9A1" stroke="#C7A7E7" strokeWidth="2"/>
              <path d="M16 16C10 16 6 12 6 6C12 6 16 10 16 16Z" fill="#A8D5BA" stroke="#8BC9A1" strokeWidth="2"/>
              <path d="M16 16C22 16 26 20 26 26C20 26 16 22 16 16Z" fill="#C7A7E7" stroke="#8BC9A1" strokeWidth="2"/>
              <circle cx="16" cy="16" r="4" fill="#F5ECD7" stroke="#8BC9A1" strokeWidth="2"/>
            </svg>
          </div>
          <span className="logo__text">Floral Bliss</span>
        </div>

        <nav className={`header__nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav__link" onClick={closeMenu}>Главная</Link>
          <Link to="/bouquets" className="nav__link" onClick={closeMenu}>Букеты</Link>
          <Link to="/plants" className="nav__link" onClick={closeMenu}>Растения</Link>
          <Link to="/compositions" className="nav__link" onClick={closeMenu}>Композиции</Link>
          <Link to="/about" className="nav__link" onClick={closeMenu}>О нас</Link>
          <Link to="/delivery" className="nav__link" onClick={closeMenu}>Доставка</Link>
          
          <div className="nav__icons">
            <Link to="/favorites" className="icon__button" onClick={closeMenu}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="none" strokeWidth="1.5"/>
              </svg>
              <span className="icon__badge">{getFavoritesCount()}</span>
            </Link>
            
            <Link to="/cart" className="icon__button" onClick={closeMenu}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="none" strokeWidth="1.5"/>
              </svg>
              <span className="icon__badge">{getCartItemsCount()}</span>
            </Link>
            
            {isLoggedIn ? (
              <div className="user-menu">
                <button className="user-avatar" onClick={handleProfileClick}>
                  <span className="avatar-initials">{getInitials()}</span>
                </button>
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={closeMenu}>Мой профиль</Link>
                  <button onClick={handleLogout} className="dropdown-item logout">Выйти</button>
                </div>
              </div>
            ) : (
              <button className="nav__button" onClick={handleAuthClick}>Войти</button>
            )}
          </div>
        </nav>

        <div 
          className={`burger ${menuOpen ? 'active' : ''}`} 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="burger__line"></span>
          <span className="burger__line"></span>
          <span className="burger__line"></span>
        </div>
      </div>
    </header>
  );
}