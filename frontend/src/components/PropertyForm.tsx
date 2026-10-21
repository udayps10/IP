import { useState } from 'react'
import { propertyApi } from '@/api'
import { ApiError } from '@/api/client'
import { useToast } from '@/context/ToastContext'
import type { Property, PropertyRequest, PropertyStatus, PropertyType, ListingType } from '@/types'
import { LISTING_TYPES, PROPERTY_STATUSES, PROPERTY_TYPES } from '@/types'

interface FormState {
  title: string
  price: string
  location: string
  propertyType: PropertyType
  listingType: ListingType
  status: PropertyStatus
  description: string
}

const emptyForm: FormState = {
  title: '',
  price: '',
  location: '',
  propertyType: 'APARTMENT',
  listingType: 'SALE',
  status: 'AVAILABLE',
  description: '',
}

export function PropertyForm({
  property,
  ownerId,
  onSaved,
  onCancel,
}: {
  property?: Property | null
  ownerId?: number
  onSaved: (property: Property) => void
  onCancel: () => void
}) {
  const { notify } = useToast()
  const [form, setForm] = useState<FormState>(() =>
    property
      ? {
          title: property.title,
          price: String(property.price),
          location: property.location,
          propertyType: property.propertyType,
          listingType: property.listingType,
          status: property.status,
          description: property.description ?? '',
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.title.trim()) next.title = 'Title is required'
    else if (form.title.trim().length > 200) next.title = 'Keep the title under 200 characters'

    if (!form.location.trim()) next.location = 'Location is required'
    else if (form.location.trim().length > 255) next.location = 'Keep the location under 255 characters'

    const price = Number(form.price)
    if (!form.price.trim()) next.price = 'Price is required'
    else if (!Number.isFinite(price) || price <= 0) next.price = 'Enter a price greater than zero'

    if (form.description.length > 2000) next.description = 'Keep the description under 2000 characters'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    const payload: PropertyRequest = {
      title: form.title.trim(),
      price: Number(form.price),
      location: form.location.trim(),
      propertyType: form.propertyType,
      listingType: form.listingType,
      status: form.status,
      description: form.description.trim() || null,
      userId: ownerId,
    }

    setSaving(true)
    try {
      const saved = property
        ? await propertyApi.update(property.propertyId, payload)
        : await propertyApi.create(payload)
      notify(property ? 'Listing updated' : 'Listing published', 'success')
      onSaved(saved)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors)
        setFormError(error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'Something went wrong')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="stack" style={{ gap: 16 }}>
      {formError && <div className="form-error">{formError}</div>}

      <div className="form-grid">
        <div className={`field field--full${errors.title ? ' field--error' : ''}`}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder="3 BHK apartment in Andheri West"
            maxLength={200}
          />
          {errors.title && <span className="field__error">{errors.title}</span>}
        </div>

        <div className={`field${errors.price ? ' field--error' : ''}`}>
          <label htmlFor="price">Price (₹)</label>
          <input
            id="price"
            type="number"
            min="0"
            step="1000"
            value={form.price}
            onChange={(event) => update('price', event.target.value)}
            placeholder="7500000"
          />
          {errors.price && <span className="field__error">{errors.price}</span>}
        </div>

        <div className={`field${errors.location ? ' field--error' : ''}`}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            value={form.location}
            onChange={(event) => update('location', event.target.value)}
            placeholder="Andheri West, Mumbai"
            maxLength={255}
          />
          {errors.location && <span className="field__error">{errors.location}</span>}
        </div>

        <div className="field">
          <label htmlFor="propertyType">Property type</label>
          <div className="select-wrap">
            <select
              id="propertyType"
              value={form.propertyType}
              onChange={(event) => update('propertyType', event.target.value as PropertyType)}
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="listingType">Listing type</label>
          <div className="select-wrap">
            <select
              id="listingType"
              value={form.listingType}
              onChange={(event) => update('listingType', event.target.value as ListingType)}
            >
              {LISTING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === 'SALE' ? 'For Sale' : 'For Rent'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field field--full">
          <label htmlFor="status">Status</label>
          <div className="select-wrap">
            <select
              id="status"
              value={form.status}
              onChange={(event) => update('status', event.target.value as PropertyStatus)}
            >
              {PROPERTY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`field field--full${errors.description ? ' field--error' : ''}`}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            placeholder="Describe the layout, amenities, nearby landmarks…"
            maxLength={2000}
          />
          {errors.description && <span className="field__error">{errors.description}</span>}
        </div>
      </div>

      <div className="row row--between" style={{ marginTop: 6 }}>
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving && <span className="spinner" />}
          {property ? 'Save changes' : 'Publish listing'}
        </button>
      </div>
    </form>
  )
}
