describe('Login Page', () => {
  beforeEach(() => {
    // Clear all state to ensure unauthenticated
    cy.clearLocalStorage()
    cy.clearCookies()
    // Clear any session storage
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })
  })

  it('should show login form when unauthenticated', () => {
    cy.visit('/')
    cy.wait(1000)
    cy.url().should('include', '/login')
    cy.url().should('include', 'redirect=/demo')
    cy.get('[data-automation-id="login-subject-input"]').should('be.visible')
    cy.get('[data-automation-id="login-roles-input"]').should('be.visible')
    cy.get('[data-automation-id="login-submit-button"]').should('be.visible')
  })
  
  it('should redirect to demo after successful login', () => {
    cy.visit('/demo')
    cy.get('[data-automation-id="login-submit-button"]').should('exist').click()
    cy.url().should('not.include', 'login')
    cy.url().should('include', '/demo')
    
    // visit demo page when authenticated
    cy.visit('/demo')
    cy.url().should('not.include', '/login')
    cy.url().should('include', '/demo')
  })
  
  it('should redirect to original path after login with redirect query param', () => {
    cy.visit('/admin')
    cy.url().should('include', 'login?redirect=/admin')
    
    // Login
    cy.get('[data-automation-id="login-subject-input"]').find('input').clear().type('e2e-user')
    cy.get('[data-automation-id="login-roles-input"]').find('input').clear().type('admin')
    cy.get('[data-automation-id="login-submit-button"]').click()
    
    // Should redirect to /admin after login
    cy.url().should('include', '/admin')
    cy.contains('Admin - Configuration').should('be.visible')
  })
  
  it('should handle empty subject (subject is optional)', () => {
    cy.visit('/login')
    cy.get('[data-automation-id="login-submit-button"]').should('be.visible')
    cy.get('[data-automation-id="login-subject-input"]').find('input').clear()
    cy.get('[data-automation-id="login-roles-input"]').find('input').clear().type('admin')
    cy.get('[data-automation-id="login-submit-button"]').click()
    
    // Should login successfully (subject is optional in dev-login)
    cy.url({ timeout: 10000 }).should('not.include', '/login')
  })
  
  it('should handle empty roles (defaults to no roles)', () => {
    cy.visit('/login')
    cy.get('[data-automation-id="login-subject-input"]').find('input').clear().type('e2e-user')
    cy.get('[data-automation-id="login-roles-input"]').find('input').clear()
    cy.get('[data-automation-id="login-submit-button"]').click()
    
    // Should login successfully with no roles - wait for redirect
    cy.url({ timeout: 10000 }).should('not.include', '/login')
    // Navigate to demo to check admin link
    cy.visit('/demo')
    // Admin link should not be visible
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    cy.get('[data-automation-id="nav-admin-link"]').should('not.exist')
  })
  
  it('should show loading state during login', () => {
    cy.visit('/login')
    // Intercept and delay the login request
    cy.intercept('POST', '**/dev-login', {
      delay: 500,
      statusCode: 200,
      body: { access_token: 'test-token', expires_at: new Date(Date.now() + 3600000).toISOString(), roles: ['admin'] }
    }).as('loginDelay')
    
    cy.get('[data-automation-id="login-subject-input"]').find('input').clear().type('e2e-user')
    cy.get('[data-automation-id="login-roles-input"]').find('input').clear().type('admin')
    cy.get('[data-automation-id="login-submit-button"]').click()
    
    // Button should show loading state
    cy.get('[data-automation-id="login-submit-button"]').should('have.attr', 'aria-busy', 'true')
  })
})
