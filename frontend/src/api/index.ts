import { api } from './client'
import type { LoginResponse, Property, PropertyFilters, PropertyRequest, RegisterRequest, User } from '@/types'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { email, password }),

  register: (payload: RegisterRequest) => api.post<User>('/api/users/register', payload),

  me: () => api.get<User>('/api/users/me'),
}

export const propertyApi = {
  list: () => api.get<Property[]>('/api/properties'),

  search: (filters: PropertyFilters, signal?: AbortSignal) => {
    const params = new URLSearchParams()
    if (filters.location) params.set('location', filters.location)
    if (filters.type) params.set('type', filters.type)
    if (filters.listingType) params.set('listingType', filters.listingType)
    const query = params.toString()
    return api.get<Property[]>(`/api/properties/search${query ? `?${query}` : ''}`, signal)
  },

  getById: (id: number) => api.get<Property>(`/api/properties/${id}`),

  listByUser: (userId: number) => api.get<Property[]>(`/api/properties/user/${userId}`),

  create: (payload: PropertyRequest) => api.post<Property>('/api/properties', payload),

  update: (id: number, payload: PropertyRequest) => api.put<Property>(`/api/properties/${id}`, payload),

  remove: (id: number) => api.delete<void>(`/api/properties/${id}`),

  addImages: (id: number, files: File[]) => {
    const form = new FormData()
    files.forEach((file) => form.append('files', file))
    return api.upload<Property>(`/api/properties/${id}/images`, form)
  },

  removeImage: (propertyId: number, imageId: number) =>
    api.delete<void>(`/api/properties/${propertyId}/images/${imageId}`),
}
