import { Link } from 'react-router-dom'
import { Building2, Home, MapPin, Mountain, User } from 'lucide-react'
import type { Property } from '@/types'
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS, STATUS_LABELS } from '@/types'
import { formatPrice } from '@/utils/format'

const typeIcons: Record<Property['propertyType'], typeof Home> = {
  APARTMENT: Building2,
  HOUSE: Home,
  PLOT: Mountain,
}

export function PropertyCard({ property }: { property: Property }) {
  const TypeIcon = typeIcons[property.propertyType] ?? Home
  const cover = property.images?.[0]?.url

  return (
    <Link to={`/properties/${property.propertyId}`} className="property-card">
      <div className="property-card__media">
        {cover ? (
          <img src={cover} alt={property.title} loading="lazy" />
        ) : (
          <div className="media-placeholder">
            <TypeIcon size={40} />
          </div>
        )}
        <div className="property-card__badges">
          <span className={`badge badge--${property.listingType.toLowerCase()}`}>
            {LISTING_TYPE_LABELS[property.listingType]}
          </span>
          {property.status !== 'AVAILABLE' && (
            <span className={`badge badge--${property.status.toLowerCase()}`}>
              {STATUS_LABELS[property.status]}
            </span>
          )}
        </div>
        <span className="property-card__price">{formatPrice(property.price, property.listingType)}</span>
      </div>

      <div className="property-card__body">
        <h3 className="property-card__title">{property.title}</h3>
        <p className="property-card__meta">
          <MapPin size={14} /> {property.location}
        </p>
        <p className="property-card__meta">
          <TypeIcon size={14} /> {PROPERTY_TYPE_LABELS[property.propertyType]}
        </p>

        <div className="property-card__footer">
          <User size={14} />
          <span>{property.ownerName}</span>
        </div>
      </div>
    </Link>
  )
}
