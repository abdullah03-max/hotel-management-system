import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleOneTapLogin } from '@react-oauth/google';
import { useSettings } from '../../context/SettingsContext'; // Add this import
import { useAuth } from '../../context/AuthContext';
import { GOOGLE_CLIENT_ID } from '../../config';
import './HotelHomepage.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const navigate = useNavigate();
  const { settings } = useSettings(); // Use settings from context
  const { user, loginWithGoogle } = useAuth();

  // Hero Images
  const heroImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80'
  ];

  // Gallery Images
  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=400&q=80',
      title: 'Luxury Suite'
    },
    {
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80',
      title: 'Infinity Pool'
    },
    {
      url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=400&q=80',
      title: 'Spa & Wellness'
    },
    {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80',
      title: 'Fine Dining'
    },
    {
      url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=400&q=80',
      title: 'Executive Room'
    },
    {
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
      title: 'Fitness Center'
    },
    {
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
      title: 'Ocean View'
    },
    {
      url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80',
      title: 'Lobby Area'
    }
  ];

  // Auto Image Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      if (!credentialResponse?.credential) {
        return;
      }

      const result = await loginWithGoogle(credentialResponse.credential);
      if (result?.success) {
        navigate('/guest/panel');
      }
    },
    onError: () => {
      // Keep silent; One Tap can fail if blocked by browser/privacy settings.
    },
    disabled: !GOOGLE_CLIENT_ID || !!user
  });

  return (
    <div className="hotel-homepage">

      {/* HEADER - Using dynamic hotel name */}
      <header className="header">
        <div className="container">
          <div className="nav-container">
            <h1 className="logo">{settings.hotelName}</h1>
            <nav className="nav">
              <button className="nav-btn login-btn" onClick={() => navigate('/login')}>Login</button>
              <button className="nav-btn register-btn" onClick={() => navigate('/register')}>Register</button>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-slideshow">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        <div className="hero-content">
          <h2>Experience Unparalleled Luxury</h2>
          <p>Where comfort meets elegance</p>
          <button className="cta-button" onClick={() => navigate('/rooms')}>
            Explore Rooms
          </button>
        </div>
      </section>

      {/* ABOUT SECTION - Using dynamic hotel name */}
      <section className="about">
        <div className="container about-container">
          <div className="about-text">
            <h2>Welcome to {settings.hotelName}</h2>
            <p>
              Discover a world of premium accommodation, exceptional experiences,
              and world-class services. Whether you're planning a family staycation,
              business trip, or romantic getaway — we offer rooms designed for every need.
            </p>
            <button className="about-btn" onClick={() => navigate('/rooms')}>
              View Rooms & Rates
            </button>
          </div>
          <img
            className="about-img"
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
            alt="About hotel"
          />
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="gallery">
        <div className="container">
          <h2 className="gallery-title">Discover Our World</h2>
          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <div key={index} className="gallery-item">
                <img src={image.url} alt={image.title} />
                <div className="gallery-overlay">
                  <h3>{image.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOATING QUICK-ACTION MENU */}
      <div className="floating-menu">
        <button
          className="fab-main"
          type="button"
          aria-expanded={isFabOpen}
          aria-label="Toggle quick action menu"
          onClick={() => setIsFabOpen(prev => !prev)}
        >
          ☰
        </button>
        <div className={`fab-options ${isFabOpen ? 'open' : ''}`}>
          <button onClick={() => { setIsFabOpen(false); navigate('/rooms'); }}>View Rooms</button>
          <button onClick={() => { setIsFabOpen(false); navigate('/rooms'); }}>Quick Booking</button>
          <button onClick={() => { setIsFabOpen(false); navigate('/contact'); }}>Contact</button>
          <button onClick={() => { setIsFabOpen(false); navigate('/login'); }}>Login</button>
        </div>
      </div>

      {/* FOOTER - Using dynamic contact information */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>{settings.hotelName}</h3>
              <p>Experience the epitome of comfort and hospitality.</p>
            </div>
            <div className="footer-section">
              <h4>Contact Info</h4>
              <p>📍 {settings.address}</p>
              <p>📞 {settings.phone}</p>
              <p>✉️ {settings.email}</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><button onClick={() => navigate('/')}>Home</button></li>
                <li><button onClick={() => navigate('/rooms')}>Rooms</button></li>
                <li><button>Dining</button></li>
                <li><button>Spa & Wellness</button></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 {settings.hotelName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
