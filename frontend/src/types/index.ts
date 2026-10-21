export type PropertyType = 'APARTMENT' | 'HOUSE' | 'PLOT'
export type ListingType = 'SALE' | 'RENT'
export type PropertyStatus = 'AVAILABLE' | 'SOLD' | 'RENTED'

export interface PropertyImage {
  imageId: number
  objectKey: string
  url: string
}

export interface Property {
  propertyId: number
  title: string
  description: string | null
  price: number
  location: string
  propertyType: PropertyType
  listingType: ListingType
  status: PropertyStatus
  ownerId: number
  ownerName: string
  images: PropertyImage[]
}

export interface PropertyRequest {
  title: string
  description?: string | null
  price: number
  location: string
  propertyType: PropertyType
  listingType: ListingType
  status?: PropertyStatus | null
  userId?: number
}

export interface User {
  userId: number
  name: string
  email: string
  phone: string | null
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string
}

export interface LoginResponse {
  token: string
  tokenType: string
}

export interface PropertyFilters {
  location?: string
  type?: PropertyType | ''
  listingType?: ListingType | ''
}

export const PROPERTY_TYPES: PropertyType[] = ['APARTMENT', 'HOUSE', 'PLOT']
export const LISTING_TYPES: ListingType[] = ['SALE', 'RENT']
export const PROPERTY_STATUSES: PropertyStatus[] = ['AVAILABLE', 'SOLD', 'RENTED']

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  APARTMENT: 'Apartment',
  HOUSE: 'House',
  PLOT: 'Plot',
}

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  SALE: 'For Sale',
  RENT: 'For Rent',
}

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  AVAILABLE: 'Available',
  SOLD: 'Sold',
  RENTED: 'Rented',
}
