import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="logo">
              <span className="logo__mark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5 9.5V21h14V9.5" />
                </svg>
              </span>
              Havenly
            </div>
            <p style={{ marginTop: 14, maxWidth: 300, fontSize: '0.9rem' }}>
              A simple, modern marketplace for apartments, houses and plots — built with React and Spring Boot.
            </p>
          </div>

          <div>
            <h4>Explore</h4>
            <Link to="/properties">All listings</Link>
            <Link to="/properties?listingType=SALE">Buy a property</Link>
            <Link to="/properties?listingType=RENT">Rent a property</Link>
          </div>

          <div>
            <h4>Account</h4>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Create account</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>

          <div>
            <h4>Property types</h4>
            <Link to="/properties?type=APARTMENT">Apartments</Link>
            <Link to="/properties?type=HOUSE">Houses</Link>
            <Link to="/properties?type=PLOT">Plots</Link>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Havenly. Demo project.</span>
          <span>React + TypeScript · Spring Boot · MySQL · MinIO</span>
        </div>
      </div>
    </footer>
  )
}
