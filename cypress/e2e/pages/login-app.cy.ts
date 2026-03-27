/**
 * Sign-in gate E2E tests for the spa_utils demo (auth via localStorage / URL hash, not dev-login).
 */
describe('Login Flow', () => {
  it('should display sign-in gate', () => {
    cy.clearLocalStorage()
    cy.visit('/login')
    cy.contains('Sign in required').should('be.visible')
    cy.get('[data-automation-id="sign-in-hash-hint"]').should('be.visible')
  })

  it('should continue to app after auth is seeded', () => {
    cy.clearLocalStorage()
    cy.visit('/login', {
      onBeforeLoad(win) {
        const exp = new Date()
        exp.setFullYear(exp.getFullYear() + 1)
        win.localStorage.setItem('access_token', 'cypress-test-token')
        win.localStorage.setItem('token_expires_at', exp.toISOString())
        win.localStorage.setItem('user_roles', JSON.stringify(['admin']))
      },
    })
    cy.reload()
    cy.get('[data-automation-id="continue-to-app-button"]').should('not.be.disabled')
    cy.get('[data-automation-id="continue-to-app-button"]').click()
    cy.url({ timeout: 5000 }).should('include', '/demo')
  })

  it('should redirect to login when accessing protected routes', () => {
    cy.clearLocalStorage()
    cy.visit('/admin')
    cy.url().should('include', '/login')
  })
})
