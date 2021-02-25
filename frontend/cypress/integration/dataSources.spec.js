/// <reference types="Cypress"/>

describe('The Data Sources Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      const { username, password } = users.find((user) => user.role === 'admin');

      cy.login(username, password);
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
    cy.get('.sources-table').find('tbody').find('tr').should('have.length.lessThan', 11);
  });

  describe('sources table', () => {
    it('shows each row with action buttons', () => {
      cy.visit('/sources');
      cy.get('[data-testid=sources-table-row]').then((rows) => {
        cy.get('[data-testid=source-table-row-actions]').then((actions) => {
          expect(rows.length).to.equal(actions.length);
        });
      });
    });

    xit('actions buttons function properly', () => {
      // TODO: add test
    });
  });
});
