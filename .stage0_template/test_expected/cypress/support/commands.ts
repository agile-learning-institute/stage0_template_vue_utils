// Custom Cypress commands for spa_utils E2E tests
// These commands provide reusable, consistent patterns for test setup and interaction

function seedDemoAuth(win: Window, roles?: string[]) {
  const exp = new Date()
  exp.setFullYear(exp.getFullYear() + 1)
  win.localStorage.setItem('access_token', 'cypress-test-token')
  win.localStorage.setItem('token_expires_at', exp.toISOString())
  win.localStorage.setItem('user_roles', JSON.stringify(roles?.length ? roles : ['admin']))
}

/**
 * Seed localStorage with a valid-looking auth session (no dev-login API).
 *
 * @param roles - Optional array of roles to assign to the user (defaults to ['admin'])
 */
Cypress.Commands.add('login', (roles?: string[]) => {
  cy.visit('/', {
    onBeforeLoad(win) {
      seedDemoAuth(win, roles)
    },
  })
  cy.url({ timeout: 10000 }).should('not.include', '/login')
  cy.wait(300)
})

/**
 * Logout command - logs out via the navigation drawer
 * Ensures clean state for subsequent tests
 */
Cypress.Commands.add('logout', () => {
  cy.get('body').then(($body) => {
    const drawerToggle = $body.find('[data-automation-id="nav-drawer-toggle"]')

    if (drawerToggle.length > 0) {
      cy.get('[data-automation-id="nav-drawer-toggle"]').then(() => {
        cy.get('body').then(($bodyCheck) => {
          const logoutLink = $bodyCheck.find('[data-automation-id="nav-logout-link"]')
          if (logoutLink.length === 0 || !logoutLink.is(':visible')) {
            cy.get('[data-automation-id="nav-drawer-toggle"]').click()
            cy.wait(500)
          }
        })
      })

      cy.get('[data-automation-id="nav-logout-link"]', { timeout: 5000 })
        .should('exist')
        .scrollIntoView()
        .click({ force: true })

      cy.url({ timeout: 5000 }).should('include', '/login')
    }
  })
})

Cypress.Commands.add('waitForDemoPage', () => {
  cy.url({ timeout: 10000 }).should('include', '/demo')
  cy.contains('h1, h2, h3, h4', 'spa_utils Component Testing', { timeout: 10000 })
    .should('be.visible')
})

Cypress.Commands.add('waitForAdminPage', () => {
  cy.url({ timeout: 5000 }).should('include', '/admin')
  cy.contains('Admin - Configuration', { timeout: 10000 })
    .should('be.visible')
})

Cypress.Commands.add('waitForLoginPage', () => {
  cy.url({ timeout: 5000 }).should('include', '/login')
  cy.contains('Sign in required', { timeout: 5000 }).should('be.visible')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(roles?: string[]): Chainable<void>
      logout(): Chainable<void>
      waitForDemoPage(): Chainable<void>
      waitForAdminPage(): Chainable<void>
      waitForLoginPage(): Chainable<void>
    }
  }
}

export {}
