import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, LayoutGrid, LogOut, Pencil, Plus, Trash2, TrendingUp, User as UserIcon } from 'lucide-react'
import { propertyApi } from '@/api'
import { EmptyState } from '@/components/EmptyState'
import { ImageUploader } from '@/components/ImageUploader'
import { Modal } from '@/components/Modal'
import { PropertyForm } from '@/components/PropertyForm'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { Property } from '@/types'
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS, STATUS_LABELS } from '@/types'
import { formatCompactPrice, formatPrice, initials } from '@/utils/format'

type Tab = 'overview' | 'listings' | 'account'

export function Dashboard() {
  const { user, logout } = useAuth()
  const { notify } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'overview')
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Property | null>(null)
  const [pendingImages, setPendingImages] = useState<Property | null>(null)
  const [deleting, setDeleting] = useState<Property | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      setProperties(await propertyApi.listByUser(user.userId))
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not load your listings', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, notify])

  useEffect(() => {
    void load()
  }, [load])

  // Keep the tab in sync when the URL changes (e.g. the navbar "My listings" shortcut).
  useEffect(() => {
    const next = (searchParams.get('tab') as Tab) || 'overview'
    setTab(next)
  }, [searchParams])

  const changeTab = (next: Tab) => {
    setTab(next)
    const params = new URLSearchParams(searchParams)
    if (next === 'overview') params.delete('tab')
    else params.set('tab', next)
    setSearchParams(params, { replace: true })
  }

  const stats = useMemo(() => {
    const available = properties.filter((p) => p.status === 'AVAILABLE').length
    const closed = properties.length - available
    const value = properties.reduce((sum, p) => sum + p.price, 0)
    return { total: properties.length, available, closed, value }
  }, [properties])

  const remove = async () => {
    if (!deleting) return
    try {
      await propertyApi.remove(deleting.propertyId)
      notify('Listing deleted', 'success')
      setDeleting(null)
      void load()
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not delete listing', 'error')
    }
  }

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0] ?? 'there'}</h1>
          <p>Manage the properties you have listed on Havenly.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}>
          <Plus size={17} /> Add property
        </button>
      </div>

      <div className="dash">
        <aside className="dash__side">
          <div className="dash__profile">
            <span className="avatar avatar--lg">{initials(user?.name ?? 'U')}</span>
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>

          <nav className="dash__nav">
            <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => changeTab('overview')}>
              <TrendingUp size={16} /> Overview
            </button>
            <button type="button" className={tab === 'listings' ? 'active' : ''} onClick={() => changeTab('listings')}>
              <LayoutGrid size={16} /> My listings ({stats.total})
            </button>
            <button type="button" className={tab === 'account' ? 'active' : ''} onClick={() => changeTab('account')}>
              <UserIcon size={16} /> Account
            </button>
            <button type="button" onClick={logout}>
              <LogOut size={16} /> Sign out
            </button>
          </nav>
        </aside>

        <div>
          {tab === 'overview' && (
            <>
              <div className="stat-row">
                <div className="stat">
                  <span>Total listings</span>
                  <strong>{stats.total}</strong>
                </div>
                <div className="stat">
                  <span>Available</span>
                  <strong>{stats.available}</strong>
                </div>
                <div className="stat">
                  <span>Closed</span>
                  <strong>{stats.closed}</strong>
                </div>
                <div className="stat">
                  <span>Portfolio value</span>
                  <strong>{stats.value ? formatCompactPrice(stats.value) : '—'}</strong>
                </div>
              </div>

              {loading ? (
                <div className="skeleton" style={{ height: 240 }} />
              ) : properties.length ? (
                <div className="panel">
                  <div className="row row--between" style={{ marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>Recent listings</h3>
                    <button type="button" className="btn btn--quiet btn--sm" onClick={() => changeTab('listings')}>
                      View all
                    </button>
                  </div>
                  <ListingTable
                    properties={properties.slice(0, 4)}
                    onEdit={setEditing}
                    onDelete={setDeleting}
                  />
                </div>
              ) : (
                <EmptyState
                  title="You have not listed anything yet"
                  message="Publish your first property and it will show up here straight away."
                  action={
                    <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}>
                      <Plus size={16} /> Add your first property
                    </button>
                  }
                />
              )}
            </>
          )}

          {tab === 'listings' && (
            <div className="panel">
              <div className="row row--between" style={{ marginBottom: 14 }}>
                <h3 style={{ margin: 0 }}>My listings</h3>
                <button type="button" className="btn btn--primary btn--sm" onClick={() => setCreating(true)}>
                  <Plus size={15} /> Add property
                </button>
              </div>

              {loading ? (
                <div className="skeleton" style={{ height: 220 }} />
              ) : properties.length ? (
                <ListingTable properties={properties} onEdit={setEditing} onDelete={setDeleting} />
              ) : (
                <EmptyState
                  title="Nothing here yet"
                  message="Once you publish a property it will appear in this list."
                  action={
                    <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}>
                      <Plus size={16} /> Add property
                    </button>
                  }
                />
              )}
            </div>
          )}

          {tab === 'account' && (
            <div className="panel">
              <h3>Account details</h3>
              <div className="stat-row" style={{ marginBottom: 0 }}>
                <div className="stat">
                  <span>Name</span>
                  <strong style={{ fontSize: '1rem' }}>{user?.name}</strong>
                </div>
                <div className="stat">
                  <span>Email</span>
                  <strong style={{ fontSize: '1rem' }}>{user?.email}</strong>
                </div>
                <div className="stat">
                  <span>Phone</span>
                  <strong style={{ fontSize: '1rem' }}>{user?.phone || 'Not provided'}</strong>
                </div>
                <div className="stat">
                  <span>User ID</span>
                  <strong style={{ fontSize: '1rem' }}>#{user?.userId}</strong>
                </div>
              </div>

              <div className="row" style={{ marginTop: 20 }}>
                <Link to="/properties" className="btn btn--ghost">
                  <Building2 size={16} /> Browse marketplace
                </Link>
                <button type="button" className="btn btn--danger" onClick={logout}>
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {creating && (
        <Modal title="Add a new property" onClose={() => setCreating(false)}>
          <PropertyForm
            ownerId={user?.userId}
            onCancel={() => setCreating(false)}
            onSaved={(created) => {
              setCreating(false)
              void load()
              setPendingImages(created)
            }}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit listing" onClose={() => setEditing(null)}>
          <PropertyForm
            property={editing}
            ownerId={editing.ownerId}
            onCancel={() => setEditing(null)}
            onSaved={(updated) => {
              setEditing(null)
              void load()
              setPendingImages(updated)
            }}
          />
        </Modal>
      )}

      {pendingImages && (
        <Modal
          title="Add photos"
          onClose={() => {
            setPendingImages(null)
            void load()
          }}
          footer={
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setPendingImages(null)
                void load()
              }}
            >
              Done
            </button>
          }
        >
          <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
            Listings with photos get far more enquiries. Upload a few images of your property.
          </p>
          <ImageUploader
            propertyId={pendingImages.propertyId}
            images={pendingImages.images ?? []}
            canEdit
            onChange={(images) =>
              setPendingImages((current) => (current ? { ...current, images } : current))
            }
          />
        </Modal>
      )}

      {deleting && (
        <Modal
          title="Delete this listing?"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setDeleting(null)}>
                Keep listing
              </button>
              <button type="button" className="btn btn--danger" onClick={() => void remove()}>
                Delete permanently
              </button>
            </>
          }
        >
          <p style={{ color: 'var(--muted)' }}>
            “{deleting.title}” will be removed along with its photos. This cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  )
}

function ListingTable({
  properties,
  onEdit,
  onDelete,
}: {
  properties: Property[]
  onEdit: (property: Property) => void
  onDelete: (property: Property) => void
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="dash-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Price</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.propertyId}>
              <td>
                <div className="row" style={{ minWidth: 220 }}>
                  {property.images?.[0]?.url ? (
                    <img className="dash-table__thumb" src={property.images[0].url} alt={property.title} />
                  ) : (
                    <div className="dash-table__thumb media-placeholder" />
                  )}
                  <div>
                    <Link
                      to={`/properties/${property.propertyId}`}
                      style={{ fontWeight: 600, display: 'block' }}
                    >
                      {property.title}
                    </Link>
                    <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                      {LISTING_TYPE_LABELS[property.listingType]} · {property.location}
                    </span>
                  </div>
                </div>
              </td>
              <td>{PROPERTY_TYPE_LABELS[property.propertyType]}</td>
              <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                {formatPrice(property.price, property.listingType)}
              </td>
              <td>
                <span className={`badge badge--${property.status.toLowerCase()}`}>
                  {STATUS_LABELS[property.status]}
                </span>
              </td>
              <td>
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn--quiet btn--icon"
                    onClick={() => onEdit(property)}
                    aria-label="Edit listing"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn--quiet btn--icon"
                    onClick={() => onDelete(property)}
                    aria-label="Delete listing"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
