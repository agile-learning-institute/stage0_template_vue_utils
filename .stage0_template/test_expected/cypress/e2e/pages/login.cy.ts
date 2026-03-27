describe('Login Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })
  })

  it('should show sign-in gate when unauthenticated', () => {
    cy.visit('/')
    cy.wait(500)
    cy.url().should('include', '/login')
    cy.url().should('include', 'redirect=/demo')
    cy.contains('Sign in required').should('be.visible')
    cy.get('[data-automation-id="continue-to-app-button"]').should('be.disabled')
  })

  it('should reach demo after seeding auth and continuing', () => {
    cy.visit('/demo', {
      onBeforeLoad(win) {
        const exp = new Date()
        exp.setFullYear(exp.getFullYear() + 1)
        win.localStorage.setItem('access_token', 'cypress-token')
        win.localStorage.setItem('token_expires_at', exp.toISOString())
        win.localStorage.setItem('user_roles', JSON.stringify(['admin']))
      },
    })
    cy.reload()
    cy.url().should('include', '/demo')
  })

  it('should redirect to admin after auth when using redirect query', () => {
    cy.visit('/admin')
    cy.url().should('include', 'login?redirect=/admin')

    cy.visit('/login?redirect=/admin', {
      onBeforeLoad(win) {
        const exp = new Date()
        exp.setFullYear(exp.getFullYear() + 1)
        win.localStorage.setItem('access_token', 'cypress-token')
        win.localStorage.setItem('token_expires_at', exp.toISOString())
        win.localStorage.setItem('user_roles', JSON.stringify(['admin']))
      },
    })
    cy.reload()
    cy.get('[data-automation-id="continue-to-app-button"]').should('not.be.disabled').click()
    cy.url().should('include', '/admin')
    cy.contains('Admin - Configuration').should('be.visible')
  })
})
