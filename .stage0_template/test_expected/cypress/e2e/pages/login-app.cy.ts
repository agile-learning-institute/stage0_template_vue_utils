/**
 * Generic Login Page E2E tests for consuming apps (e.g. vue_vuetify template).
 * Tests the shared LoginPage component from spa_utils without app-specific routes like /demo.
 */
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display login page', () => {
    cy.get('[data-automation-id="login-submit-button"]').should('be.visible')
  })

  it('should login successfully', () => {
    cy.get('[data-automation-id="login-submit-button"]').click()
    cy.url().should('not.include', '/login')
  })

  it('should redirect to login when accessing protected routes', () => {
    cy.clearLocalStorage()
    cy.visit('/admin')
    cy.url().should('include', '/login')
  })
})
