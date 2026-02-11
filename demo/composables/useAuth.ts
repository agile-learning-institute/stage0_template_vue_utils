import { ref, computed } from 'vue'

const accessToken = ref<string | null>(localStorage.getItem('access_token'))
const tokenExpiresAt = ref<string | null>(localStorage.getItem('token_expires_at'))
const storedRoles = localStorage.getItem('user_roles')
const roles = ref<string[]>(storedRoles ? JSON.parse(storedRoles) : [])

export function useAuth() {
  const isAuthenticated = computed(() => {
    if (!accessToken.value || !tokenExpiresAt.value) {
      return false
    }
    const expiresAt = new Date(tokenExpiresAt.value)
    return expiresAt > new Date()
  })

  async function login(subject?: string, rolesInput?: string[]) {
    try {
      const response = await fetch('/dev-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, roles: rolesInput }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Login failed' }))
        throw new Error(error.error || 'Login failed')
      }

      const data = await response.json()
      accessToken.value = data.access_token
      tokenExpiresAt.value = data.expires_at
      roles.value = data.roles || []
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('token_expires_at', data.expires_at)
      localStorage.setItem('user_roles', JSON.stringify(data.roles || []))
      
      return data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  function logout() {
    accessToken.value = null
    tokenExpiresAt.value = null
    roles.value = []
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user_roles')
  }

  return {
    isAuthenticated,
    roles: computed(() => roles.value),
    login,
    logout,
  }
}
