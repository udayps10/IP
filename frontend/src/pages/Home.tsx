import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Camera, KeyRound, Search, Sparkles } from 'lucide-react'
import { propertyApi } from '@/api'
import { PropertyCard } from '@/components/PropertyCard'
import { PropertyGridSkeleton } from '@/components/EmptyState'
import { useAuth } from '@/context/AuthContext'
import type { ListingType, Property, PropertyType } from '@/types'
import { LISTING_TYPES, PROPERTY_TYPES } from '@/types'
import { formatCompactPrice } from '@/utils/format'

export function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [location, setLocation] = useState('')
  const [type, setType] = useState<PropertyType | ''>('')
  const [listingType, setListingType] = useState<ListingType | ''>('')
  const [featured, setFeatured] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let active = true
    propertyApi
      .list()
      .then((properties) => {
        if (!active) return
        setFeatured(properties.slice(0, 6))
        setTotal(properties.length)
      })
      .catch(() => undefined)
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const search = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (location.trim()) params.set('location', location.trim())
    if (type) params.set('type', type)
    if (listingType) params.set('listingType', listingType)
    navigate(`/properties?${params.toString()}`)
  }

  const averageRent = featured.length
    ? featured.filter((p) => p.listingType === 'RENT').reduce((sum, p) => sum + p.price, 0) /
      Math.max(1, featured.filter((p) => p.listingType === 'RENT').length)
    : 0

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <span className="hero__eyebrow">
              <Sparkles size={14} /> {total > 0 ? `${total} live listings` : 'Fresh listings every week'}
            </span>
            <h1>
              Find a place that feels like <em>home</em>.
            </h1>
            <p className="hero__lede">
              Apartments, houses and plots for rent and sale — browse verified listings, compare prices and
              list your own property in minutes.
            </p>

            <div className="hero__cta">
              <Link to="/properties" className="btn btn--accent">
                Browse listings <ArrowRight size={17} />
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn--ghost">
                  List your property
                </Link>
              )}
            </div>

            <div className="hero__stats">
              <div>
                <strong>{total || '—'}</strong>
                <span>Properties listed</span>
              </div>
              <div>
                <strong>{PROPERTY_TYPES.length}</strong>
                <span>Property types</span>
              </div>
              <div>
                <strong>{averageRent ? formatCompactPrice(averageRent) : '—'}</strong>
                <span>Average monthly rent</span>
              </div>
            </div>
          </div>

          <div className="hero__card">
            <h3>Search homes</h3>
            <form onSubmit={search} className="hero__form">
              <div className="field field--full">
                <label htmlFor="hero-location">Location</label>
                <input
                  id="hero-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Andheri West, Mumbai"
                />
              </div>

              <div className="field">
                <label htmlFor="hero-type">Property type</label>
                <div className="select-wrap">
                  <select
                    id="hero-type"
                    value={type}
                    onChange={(event) => setType(event.target.value as PropertyType | '')}
                  >
                    <option value="">Any type</option>
                    {PROPERTY_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0) + option.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="hero-listing">Listing type</label>
                <div className="select-wrap">
                  <select
                    id="hero-listing"
                    value={listingType}
                    onChange={(event) => setListingType(event.target.value as ListingType | '')}
                  >
                    <option value="">Buy or rent</option>
                    {LISTING_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option === 'SALE' ? 'For Sale' : 'For Rent'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn--primary btn--block field--full">
                <Search size={17} /> Search properties
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <div>
            <h2>Latest listings</h2>
            <p>Freshly added properties from verified owners.</p>
          </div>
          <Link to="/properties" className="btn btn--ghost btn--sm">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <PropertyGridSkeleton count={3} />
        ) : featured.length ? (
          <div className="property-grid">
            {featured.map((property) => (
              <PropertyCard key={property.propertyId} property={property} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No listings yet</h3>
            <p>Be the first to publish a property on Havenly.</p>
            <Link to="/register" className="btn btn--primary">
              Create an account
            </Link>
          </div>
        )}
      </section>

      <section className="container section">
        <div className="section-head">
          <div>
            <h2>How it works</h2>
            <p>Three simple steps between you and a new place.</p>
          </div>
        </div>

        <div className="property-grid">
          {[
            {
              icon: <Search size={20} />,
              title: 'Search & shortlist',
              text: 'Filter by location, property type and rent or sale, then save the ones you like.',
            },
            {
              icon: <Camera size={20} />,
              title: 'Tour with photos',
              text: 'Every listing carries real photos, pricing and location details in one clean view.',
            },
            {
              icon: <KeyRound size={20} />,
              title: 'Make it yours',
              text: 'Owners publish directly from the dashboard and update status as deals progress.',
            },
          ].map((step) => (
            <div className="panel" key={step.title}>
              <div className="empty__icon" style={{ margin: '0 0 14px' }}>
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p style={{ color: 'var(--muted)', marginTop: 6 }}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="panel" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
          <div style={{ flex: '1 1 320px' }}>
            <h3>Have a property to sell or rent out?</h3>
            <p style={{ color: 'var(--muted)', marginTop: 6 }}>
              Publish your listing with photos and reach thousands of buyers and tenants.
            </p>
          </div>
          <div className="row row--wrap">
            <span className="badge badge--available">
              <CheckCircle2 size={13} /> Free to list
            </span>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn--primary">
              Start listing <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
