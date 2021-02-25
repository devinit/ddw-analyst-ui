/// <reference types="Cypress"/>

describe('The Login Page', () => {
  it('should be redirected to when a user is not logged in', () => {
    cy.visit('/');
    cy.url().should('includes', '/login');
  });

  it('renders a loading indicator', () => {
    cy.visit('/login');
    cy.contains('Loading...');
  });

  describe('login form', () => {
    it('requires an email and password', () => {
      cy.visit('/login');
      cy.wait(200);
      cy.get('button[type=submit]').click();
      cy.get('.invalid-feedback').contains('Email is required');
      cy.get('.invalid-feedback').contains('Password is required');
    });

    it('displays error message when login fails', () => {
      cy.visit('/login');
      cy.get('input[name=username]').type('test@email.com');
      cy.get('input[name=password]').type('fail_password');
      cy.get('button[type=submit]').click();
      cy.get('.alert').contains('Invalid username/password');
    });

    it('successfully performs a login action and logs out', () => {
      cy.visit('/');
      cy.wait(200);
      cy.fixture('users').then((users) => {
        const admin = users.find((user) => user.role === 'admin');

        if (admin) {
          cy.get('input[name=username]').type(admin.username);
          cy.get('input[name=password]').type(admin.password);
          cy.get('button[type=submit]').click();
          cy.url().should('not.include', '/login');

          cy.get('[data-cy=user-options]').click();
          cy.get('[data-cy=logout]').click();
          cy.url().should('include', '/login');
        }
      });
    });
  });
});
