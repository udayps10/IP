import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Building2,
  CalendarDays,
  Home,
  Mail,
  MapPin,
  Mountain,
  Pencil,
  Phone,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { api } from '@/api/client'
import { propertyApi } from '@/api'
import { EmptyState } from '@/components/EmptyState'
import { ImageUploader } from '@/components/ImageUploader'
import { Modal } from '@/components/Modal'
import { PropertyCard } from '@/components/PropertyCard'
import { PropertyForm } from '@/components/PropertyForm'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { Property, User } from '@/types'
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS, STATUS_LABELS } from '@/types'
import { formatPrice } from '@/utils/format'

const typeIcons: Record<Property['propertyType'], typeof Home> = {
  APARTMENT: Building2,
  HOUSE: Home,
  PLOT: Mountain,
}

export function PropertyDetail() {
  const { id } = useParams()
  const propertyId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notify } = useToast()

  const [property, setProperty] = useState<Property | null>(null)
  const [owner, setOwner] = useState<User | null>(null)
  const [similar, setSimilar] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await propertyApi.getById(propertyId)
      setProperty(data)
      setError('')

      api
        .get<User>(`/api/users/${data.ownerId}`)
        .then(setOwner)
        .catch(() => setOwner(null))

      propertyApi
        .list()
        .then((all) =>
          setSimilar(
            all
              .filter(
                (item) =>
                  item.propertyId !== data.propertyId &&
                  (item.propertyType === data.propertyType || item.location === data.location),
              )
              .slice(0, 3),
          ),
        )
        .catch(() => undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Property not found')
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    void load()
  }, [load])

  const isOwner = Boolean(user && property && user.userId === property.ownerId)

  const remove = async () => {
    if (!property) return
    try {
      await propertyApi.remove(property.propertyId)
      notify('Listing deleted', 'success')
      navigate('/dashboard')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not delete listing', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="page container">
        <div className="skeleton" style={{ height: 320, marginBottom: 24 }} />
        <div className="detail-layout">
          <div className="skeleton" style={{ height: 320 }} />
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="page container">
        <EmptyState
          title="Property not found"
          message={error || 'This listing may have been removed by the owner.'}
          action={
            <Link to="/properties" className="btn btn--primary">
              Browse all properties
            </Link>
          }
        />
      </div>
    )
  }

  const TypeIcon = typeIcons[property.propertyType] ?? Home
  const images = property.images ?? []

  return (
    <div className="page container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/properties">Properties</Link>
        <span>/</span>
        <span>{property.title}</span>
      </nav>

      <div className="gallery">
        {images.length ? (
          images.slice(0, 5).map((image) => (
            <button
              type="button"
              className="gallery__item"
              key={image.imageId}
              onClick={() => setLightbox(image.url)}
              aria-label="View photo"
            >
              <img src={image.url} alt={property.title} />
              {image === images[0] && images.length > 1 && (
                <span className="gallery__count">+{images.length - 1} photos</span>
              )}
            </button>
          ))
        ) : (
          <div className="media-placeholder" style={{ gridColumn: '1 / -1', gridRow: '1 / 3' }}>
            <TypeIcon size={48} />
          </div>
        )}
      </div>

      <div className="detail-layout">
        <div>
          <div className="row row--wrap" style={{ gap: 8, marginBottom: 10 }}>
            <span className={`badge badge--${property.listingType.toLowerCase()}`}>
              {LISTING_TYPE_LABELS[property.listingType]}
            </span>
            <span className={`badge badge--${property.status.toLowerCase()}`}>
              {STATUS_LABELS[property.status]}
            </span>
            <span className="badge">
              <TypeIcon size={12} /> {PROPERTY_TYPE_LABELS[property.propertyType]}
            </span>
          </div>

          <h1 className="detail-title">{property.title}</h1>
          <p className="row" style={{ color: 'var(--muted)', marginTop: 8 }}>
            <MapPin size={16} /> {property.location}
          </p>

          <div className="detail-price" style={{ marginTop: 18 }}>
            {formatPrice(property.price, property.listingType)}
          </div>

          <div className="panel" style={{ marginTop: 26 }}>
            <h3>About this property</h3>
            <p className="prose">{property.description || 'The owner has not added a description yet.'}</p>
          </div>

          <div className="panel">
            <h3>Property details</h3>
            <div className="spec-grid">
              <div className="spec">
                <span>Property type</span>
                <strong>{PROPERTY_TYPE_LABELS[property.propertyType]}</strong>
              </div>
              <div className="spec">
                <span>Listing type</span>
                <strong>{LISTING_TYPE_LABELS[property.listingType]}</strong>
              </div>
              <div className="spec">
                <span>Status</span>
                <strong>{STATUS_LABELS[property.status]}</strong>
              </div>
              <div className="spec">
                <span>Location</span>
                <strong>{property.location}</strong>
              </div>
              <div className="spec">
                <span>Listing ID</span>
                <strong>#{property.propertyId}</strong>
              </div>
              <div className="spec">
                <span>Listed by</span>
                <strong>{property.ownerName}</strong>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="panel">
              <h3>Manage photos</h3>
              <ImageUploader
                propertyId={property.propertyId}
                images={images}
                canEdit
                onChange={(next) => setProperty((current) => (current ? { ...current, images: next } : current))}
              />
            </div>
          )}
        </div>

        <aside>
          <div className="panel">
            <h3>Listed by</h3>
            <div className="owner">
              <span className="avatar avatar--lg">{property.ownerName.slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>{property.ownerName}</strong>
                <span>Property owner</span>
              </div>
            </div>

            <div className="stack" style={{ marginTop: 18 }}>
              {owner?.phone && (
                <a className="btn btn--ghost btn--block" href={`tel:${owner.phone}`}>
                  <Phone size={16} /> {owner.phone}
                </a>
              )}
              {owner?.email && (
                <a className="btn btn--primary btn--block" href={`mailto:${owner.email}`}>
                  <Mail size={16} /> Contact owner
                </a>
              )}
              {!owner && (
                <button type="button" className="btn btn--primary btn--block" onClick={() => navigate('/login')}>
                  Sign in to contact
                </button>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="panel">
              <h3>Owner actions</h3>
              <div className="stack">
                <button type="button" className="btn btn--ghost btn--block" onClick={() => setEditing(true)}>
                  <Pencil size={16} /> Edit listing
                </button>
                <button type="button" className="btn btn--danger btn--block" onClick={() => setDeleting(true)}>
                  <Trash2 size={16} /> Delete listing
                </button>
              </div>
            </div>
          )}

          <div className="panel">
            <h3>Quick facts</h3>
            <div className="stack" style={{ gap: 12 }}>
              <div className="row row--between">
                <span className="row" style={{ color: 'var(--muted)' }}>
                  <Tag size={15} /> Type
                </span>
                <strong>{PROPERTY_TYPE_LABELS[property.propertyType]}</strong>
              </div>
              <div className="row row--between">
                <span className="row" style={{ color: 'var(--muted)' }}>
                  <CalendarDays size={15} /> Availability
                </span>
                <strong>{STATUS_LABELS[property.status]}</strong>
              </div>
              <div className="row row--between">
                <span className="row" style={{ color: 'var(--muted)' }}>
                  <MapPin size={15} /> City
                </span>
                <strong>{property.location}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Similar properties</h2>
              <p>More options around {property.location}.</p>
            </div>
          </div>
          <div className="property-grid">
            {similar.map((item) => (
              <PropertyCard key={item.propertyId} property={item} />
            ))}
          </div>
        </section>
      )}

      {editing && (
        <Modal title="Edit listing" onClose={() => setEditing(false)}>
          <PropertyForm
            property={property}
            ownerId={property.ownerId}
            onCancel={() => setEditing(false)}
            onSaved={(updated) => {
              setProperty(updated)
              setEditing(false)
              void load()
            }}
          />
        </Modal>
      )}

      {deleting && (
        <Modal
          title="Delete this listing?"
          onClose={() => setDeleting(false)}
          footer={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setDeleting(false)}>
                Keep listing
              </button>
              <button type="button" className="btn btn--danger" onClick={() => void remove()}>
                Delete permanently
              </button>
            </>
          }
        >
          <p style={{ color: 'var(--muted)' }}>
            “{property.title}” and all of its photos will be removed. This cannot be undone.
          </p>
        </Modal>
      )}

      {lightbox && (
        <div className="backdrop" onClick={() => setLightbox(null)} role="dialog" aria-label="Photo viewer">
          <button type="button" className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">
            <X size={20} />
          </button>
          <img src={lightbox} alt={property.title} />
        </div>
      )}
    </div>
  )
}
