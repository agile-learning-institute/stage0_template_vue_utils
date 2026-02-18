<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="text-h5 text-center pa-4">
            Developer Login
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="subject"
                label="Subject (User ID)"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                data-automation-id="login-subject-input"
              />
              <v-text-field
                v-model="rolesInput"
                label="Roles (comma-separated)"
                variant="outlined"
                density="comfortable"
                hint="e.g., admin, developer"
                persistent-hint
                class="mb-4"
                data-automation-id="login-roles-input"
              />
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4"
                data-automation-id="login-error-alert"
              >
                {{ error }}
              </v-alert>
              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
                data-automation-id="login-submit-button"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export interface LoginPageProps {
  /** Login function - (subject, roles) => Promise. Called on form submit. */
  loginFn: (subject?: string, roles?: string[]) => Promise<void>
  /** Default redirect path after successful login */
  defaultRedirect?: string
}

const props = withDefaults(defineProps<LoginPageProps>(), {
  defaultRedirect: '/',
})

const router = useRouter()
const route = useRoute()

const subject = ref('dev-user-1')
const rolesInput = ref('developer')
const loading = ref(false)
const error = ref<string | null>(null)

async function handleLogin() {
  loading.value = true
  error.value = null

  try {
    const roles = rolesInput.value
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0)

    await props.loginFn(subject.value || undefined, roles.length > 0 ? roles : undefined)

    const redirect = (route.query.redirect as string) || props.defaultRedirect
    router.push(redirect)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
