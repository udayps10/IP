import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react'
import { propertyApi } from '@/api'
import { EmptyState, PropertyGridSkeleton } from '@/components/EmptyState'
import { PropertyCard } from '@/components/PropertyCard'
import type { ListingType, Property, PropertyType } from '@/types'
import { LISTING_TYPES, PROPERTY_TYPES } from '@/types'

type SortKey = 'newest' | 'price-asc' | 'price-desc'

export function Properties() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [locationInput, setLocationInput] = useState(searchParams.get('location') ?? '')
  const [sort, setSort] = useState<SortKey>('newest')
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const location = searchParams.get('location') ?? ''
  const type = (searchParams.get('type') ?? '') as PropertyType | ''
  const listingType = (searchParams.get('listingType') ?? '') as ListingType | ''

  useEffect(() => {
    setLocationInput(location)
  }, [location])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')

    propertyApi
      .search({ location, type, listingType }, controller.signal)
      .then((results) => {
          setProperties(results)
          setError('')
        })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Could not load listings')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [location, type, listingType])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    updateParam('location', locationInput.trim())
  }

  const clearAll = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
    setLocationInput('')
  }

  const sorted = useMemo(() => {
    const items = [...properties]
    if (sort === 'price-asc') items.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') items.sort((a, b) => b.price - a.price)
    else items.sort((a, b) => b.propertyId - a.propertyId)
    return items
  }, [properties, sort])

  const hasFilters = Boolean(location || type || listingType)

  return (
    <div className="page container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Properties</span>
      </nav>

      <div className="page-head">
        <div>
          <h1>{hasFilters ? 'Search results' : 'All properties'}</h1>
          <p>
            {loading
              ? 'Loading listings…'
              : `${sorted.length} propert${sorted.length === 1 ? 'y' : 'ies'} found`}
          </p>
        </div>
      </div>

      <form className="filters" onSubmit={submitSearch}>
        <div className="field">
          <label htmlFor="filter-location">Location</label>
          <input
            id="filter-location"
            value={locationInput}
            onChange={(event) => setLocationInput(event.target.value)}
            placeholder="Search city, area or landmark"
          />
        </div>

        <div className="field">
          <label htmlFor="filter-type">Property type</label>
          <div className="select-wrap">
            <select
              id="filter-type"
              value={type}
              onChange={(event) => updateParam('type', event.target.value)}
            >
              <option value="">All types</option>
              {PROPERTY_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="filter-listing">Listing type</label>
          <div className="select-wrap">
            <select
              id="filter-listing"
              value={listingType}
              onChange={(event) => updateParam('listingType', event.target.value)}
            >
              <option value="">Rent &amp; sale</option>
              {LISTING_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option === 'SALE' ? 'For Sale' : 'For Rent'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn--primary">
          <Search size={16} /> Search
        </button>
      </form>

      <div className="row row--wrap row--between" style={{ marginBottom: 18 }}>
        <div className="chip-row">
          <button
            type="button"
            className={`chip${listingType === '' ? ' chip--active' : ''}`}
            onClick={() => updateParam('listingType', '')}
          >
            All
          </button>
          {LISTING_TYPES.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip${listingType === option ? ' chip--active' : ''}`}
              onClick={() => updateParam('listingType', option)}
            >
              {option === 'SALE' ? 'For Sale' : 'For Rent'}
            </button>
          ))}
          {PROPERTY_TYPES.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip${type === option ? ' chip--active' : ''}`}
              onClick={() => updateParam('type', type === option ? '' : option)}
            >
              {option.charAt(0) + option.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="row">
          <SlidersHorizontal size={16} color="var(--muted)" />
          <div className="select-wrap" style={{ minWidth: 160 }}>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} aria-label="Sort">
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
          {hasFilters && (
            <button type="button" className="btn btn--quiet btn--sm" onClick={clearAll}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 18 }}>{error}</div>}

      {loading ? (
        <PropertyGridSkeleton count={6} />
      ) : sorted.length ? (
        <div className="property-grid">
          {sorted.map((property) => (
            <PropertyCard key={property.propertyId} property={property} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No properties match your search"
          message="Try a different location, or clear the filters to see everything that is listed."
          action={
            <div className="row" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn--ghost" onClick={clearAll}>
                Clear filters
              </button>
              <Link to="/register" className="btn btn--primary">
                List your property <ArrowRight size={16} />
              </Link>
            </div>
          }
        />
      )}
    </div>
  )
}
