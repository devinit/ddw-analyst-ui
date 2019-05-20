/// <reference types="Cypress"/>

describe('The Data Sources Page', () => {
  beforeEach(() => {
    cy.fixture('users').then(users => {
      const { username, email } = users.find(user => user.role === 'admin');

      cy.login(username, email);
    });
  });

  it('should be navigated to from the sidebar', () => {
    cy.visit('/');
    cy.url().should('not.include', '/login');
    cy.get('[data-testid=sidebar-link-sources]').click();
    cy.url().should('include', '/sources');
  });

  it('renders the sources in a data table', () => {
    cy.visit('/sources');
    cy.get('.sources-table').find('tbody').find('tr').should('have.length.greaterThan', 0);
  });

  it('renders a 3 item tab to show the details of a selected source', () => {
    cy.visit('/sources');
    cy.get('.source-details').find('.nav-item').should('have.length', 3);
  });

  describe('sources table', () => {
    it('has the first item selected by default', () => {
      cy.visit('/sources');
      cy.get('.sources-table').find('tbody').find('tr').first().should('have.class', 'table-danger');
    });

    it('updates the details tab when a table row is clicked', () => {
      cy.visit('/sources');
      // FIXME: find a better way to write this test
      cy.get('.source-columns-table').find('tbody').find('tr').then(columns => {
        cy.get('.sources-table').find('tbody').find('tr').last().click();
        cy.get('.source-columns-table').find('tbody').find('tr').should('not.have.length', columns.length);
      });
    });
  });
});
