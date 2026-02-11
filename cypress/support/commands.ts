// Custom Cypress commands for spa_utils E2E tests
// These commands provide reusable, consistent patterns for test setup and interaction

/**
 * Login command - authenticates via the dev-login UI
 * Token acquisition happens naturally through the login flow
 * 
 * @param roles - Optional array of roles to assign to the user (defaults to ['admin'])
 * @example
 * cy.login() // Login with default admin role
 * cy.login(['admin', 'developer']) // Login with multiple roles
 * cy.login(['developer']) // Login as non-admin
 */
Cypress.Commands.add('login', (roles?: string[]) => {
  cy.visit('/login')
  // Wait for login form to be visible
  cy.get('[data-automation-id="login-submit-button"]', { timeout: 5000 })
    .should('be.visible')
  
  // If roles specified, update the roles input
  if (roles && roles.length > 0) {
    cy.get('[data-automation-id="login-roles-input"]')
      .find('input')
      .clear()
      .type(roles.join(','))
  }
  
  // Submit login form
  cy.get('[data-automation-id="login-submit-button"]').click()
  
  // Wait for navigation away from login page (indicates successful login)
  cy.url({ timeout: 10000 }).should('not.include', '/login')
  // Small wait for any post-login processing (config load, etc.)
  cy.wait(300)
})

/**
 * Logout command - logs out via the navigation drawer
 * Ensures clean state for subsequent tests
 */
Cypress.Commands.add('logout', () => {
  // Check if we're authenticated (hamburger menu should be visible)
  cy.get('body').then(($body) => {
    const drawerToggle = $body.find('[data-automation-id="nav-drawer-toggle"]')
    
    if (drawerToggle.length > 0) {
      // Open navigation drawer if not already open
      cy.get('[data-automation-id="nav-drawer-toggle"]').then(($toggle) => {
        // Check if drawer is already open by looking for the link
        cy.get('body').then(($bodyCheck) => {
          const logoutLink = $bodyCheck.find('[data-automation-id="nav-logout-link"]')
          if (logoutLink.length === 0 || !logoutLink.is(':visible')) {
            // Drawer not open, click toggle
            cy.get('[data-automation-id="nav-drawer-toggle"]').click()
            cy.wait(500) // Wait for drawer animation
          }
        })
      })
      
      // Click logout link - scroll into view to ensure it's accessible
      // Use force: true since the element may not be considered "visible" due to CSS positioning
      cy.get('[data-automation-id="nav-logout-link"]', { timeout: 5000 })
        .should('exist')
        .scrollIntoView()
        .click({ force: true })
      
      // Verify redirect to login page
      cy.url({ timeout: 5000 }).should('include', '/login')
    }
  })
})

/**
 * Wait for demo page to be ready
 * Verifies URL and page content are loaded
 */
Cypress.Commands.add('waitForDemoPage', () => {
  // First ensure we're on the demo page
  cy.url({ timeout: 10000 }).should('include', '/demo')
  // Wait for any heading that contains the text (more flexible)
  cy.contains('h1, h2, h3, h4', 'spa_utils Component Testing', { timeout: 10000 })
    .should('be.visible')
})

/**
 * Wait for admin page to be ready
 * Verifies URL and page content are loaded
 */
Cypress.Commands.add('waitForAdminPage', () => {
  cy.url({ timeout: 5000 }).should('include', '/admin')
  cy.contains('Admin - Configuration', { timeout: 10000 })
    .should('be.visible')
})

/**
 * Wait for login page to be ready
 * Verifies login form is visible
 */
Cypress.Commands.add('waitForLoginPage', () => {
  cy.url({ timeout: 5000 }).should('include', '/login')
  cy.get('[data-automation-id="login-submit-button"]', { timeout: 5000 })
    .should('be.visible')
})

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login via the dev-login UI
       * @param roles - Optional array of roles (defaults to ['admin'])
       */
      login(roles?: string[]): Chainable<void>
      
      /**
       * Logout via the navigation drawer
       */
      logout(): Chainable<void>
      
      /**
       * Wait for demo page to be ready
       */
      waitForDemoPage(): Chainable<void>
      
      /**
       * Wait for admin page to be ready
       */
      waitForAdminPage(): Chainable<void>
      
      /**
       * Wait for login page to be ready
       */
      waitForLoginPage(): Chainable<void>
    }
  }
}

export {}
