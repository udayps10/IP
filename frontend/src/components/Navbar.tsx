import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu as MenuIcon, Search, User as UserIcon, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { initials } from '@/utils/format'

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('location') ?? '')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(searchParams.get('location') ?? '')
  }, [searchParams])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('location', query.trim())
    navigate(`/properties?${params.toString()}`)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="logo" onClick={() => setMobileOpen(false)}>
          <span className="logo__mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
            </svg>
          </span>
          Havenly
        </Link>

        <nav className="nav">
          <NavLink to="/properties">Browse</NavLink>
          <NavLink to="/properties?listingType=SALE">Buy</NavLink>
          <NavLink to="/properties?listingType=RENT">Rent</NavLink>
          {isAuthenticated && <NavLink to="/dashboard">Dashboard</NavLink>}
        </nav>

        <form className="header__search" onSubmit={submitSearch} role="search">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by location…"
            aria-label="Search properties by location"
          />
        </form>

        <div className="spacer" />

        {isAuthenticated ? (
          <div className="menu" ref={menuRef}>
            <button
              type="button"
              className="avatar"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Account menu"
            >
              {initials(user?.name ?? 'U')}
            </button>
            {menuOpen && (
              <div className="menu__panel">
                <div className="menu__header">
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                </div>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link to="/dashboard?tab=listings" onClick={() => setMenuOpen(false)}>
                  <UserIcon size={16} /> My listings
                </Link>
                <button type="button" onClick={handleLogout}>
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="row">
            <Link to="/login" className="btn btn--ghost btn--sm">
              Sign in
            </Link>
            <Link to="/register" className="btn btn--primary btn--sm">
              Get started
            </Link>
          </div>
        )}

        <button
          type="button"
          className="btn btn--quiet btn--icon mobile-toggle"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="container mobile-nav">
          <form className="mobile-nav__search" onSubmit={submitSearch} role="search">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by location…"
              aria-label="Search properties by location"
            />
          </form>
          <NavLink to="/properties" onClick={() => setMobileOpen(false)}>
            Browse all
          </NavLink>
          <NavLink to="/properties?listingType=SALE" onClick={() => setMobileOpen(false)}>
            Buy
          </NavLink>
          <NavLink to="/properties?listingType=RENT" onClick={() => setMobileOpen(false)}>
            Rent
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>
              Dashboard
            </NavLink>
          )}
        </div>
      )}
    </header>
  )
}
