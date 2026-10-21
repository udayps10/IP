const TOKEN_KEY = 'havenly.token'

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  status: number
  body: Record<string, unknown> | null

  constructor(status: number, message: string, body: Record<string, unknown> | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }

  /** Field level messages returned by the backend validation handler. */
  get fieldErrors(): Record<string, string> {
    const errors = this.body?.errors
    return errors && typeof errors === 'object' ? (errors as Record<string, string>) : {}
  }
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

interface RequestOptions {
  method?: string
  body?: unknown
  isFormData?: boolean
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, isFormData = false, signal } = options

  const headers: Record<string, string> = {}
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    // A cancelled request is not a failure - let callers ignore it.
    if (signal?.aborted) {
      throw new DOMException('The request was aborted.', 'AbortError')
    }
    throw new ApiError(0, 'Cannot reach the server. Is the backend running on port 8080?')
  }

  if (response.status === 204) return undefined as T

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : await response.text()

  if (!response.ok) {
    const body = (payload && typeof payload === 'object' ? payload : null) as Record<string, unknown> | null
    const message = body
      ? ((body.message as string) || `Request failed with status ${response.status}`)
      : response.status >= 500
        ? 'Cannot reach the server. Is the backend running on port 8080?'
        : `Request failed with status ${response.status}`

    if (response.status === 401 && tokenStore.get()) {
      tokenStore.clear()
      window.dispatchEvent(new Event('havenly:unauthorized'))
    }

    throw new ApiError(response.status, message, body)
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData, isFormData: true }),
}
