/// <reference types="Cypress"/>

describe('The Data Sources Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      const { username, password } = users.find((user) => user.role === 'admin');

      cy.login(username, password);
    });
  });

  // it('should be navigated to from the sidebar', () => {
  //   cy.visit('/');
  //   cy.url().should('not.include', '/login');
  //   cy.get('[data-testid=sidebar-link-sources]').click();
  //   cy.url().should('include', '/sources');
  // });

  // it('renders the sources in a data table', () => {
  //   cy.visit('/sources');
  //   cy.get('.sources-table').find('tbody').find('tr').should('have.length.greaterThan', 0);
  //   cy.get('.sources-table').find('tbody').find('tr').should('have.length.lessThan', 11);
  // });

  // describe('sources table', () => {
  //   it('shows each row with action buttons', () => {
  //     cy.visit('/sources');
  //     cy.get('[data-testid=sources-table-row]').then((rows) => {
  //       cy.get('[data-testid=source-table-row-actions]').then((actions) => {
  //         expect(rows.length).to.equal(actions.length);
  //       });
  //     });
  //   });

  //   xit('actions buttons function properly', () => {
  //     // TODO: add test
  //   });
  // });

  // it('renders its own help menu', () => {
  //   cy.visit('/sources');
  //   cy.get('[id=help-nav-dropdown]').click();
  //   cy.get('.dropdown-menu.show .nav-link')
  //     .should('have.length.greaterThan', 0)
  //     .then((links) => {
  //       Array.prototype.forEach.call(links, (link, index) => {
  //         if (index === links.length - 1) {
  //           expect(link.href).to.equal('https://github.com/devinit/ddw-analyst-ui/issues/new');
  //           expect(link.innerHTML).to.equal('Report Issue');
  //         } else {
  //           if (index === 0) {
  //             expect(link.innerHTML).to.equal('About Page');
  //           }
  //           expect(link.href).to.contain('docs.google');
  //         }
  //       });
  //     });
  // });

  describe('data source update', () => {
    it('creates a frozen data source', () => {
      // Freeze data source
      cy.visit('/sources');
      cy.get('[data-testid="sources-table-search"]').type('FTS ISO codes{enter}').first();
      cy.get('[data-testid="sources-table-row"]')
        .first()
        .then(($element) => {
          cy.wrap($element).contains('Versions').click();
          cy.get('[data-testid="source-version-freeze-button"]').click();
          cy.get('[data-testid="frozen-data-form-message"]').should('be.visible').type('test');
          cy.get('[data-testid="frozen-data-form-save-button"]').should('be.visible').click();
          cy.get('[data-testid="frozen-dataset-refresh-button"]').first().click({ force: true });
        });
      cy.get('[data-testid="frozen-data-status"]').contains('Completed');

      // Check if new frozen data source can  be accesses like others
      cy.visit('/sources');
      cy.get('[data-testid="sources-table-search"]').type('FTS ISO codes test{enter}');
      cy.get('[data-testid="sources-table-row"]').first().contains('FTS ISO codes test');

      // Delete new version
      cy.visit('/sources');
      cy.get('[data-testid="sources-table-search"]').type('FTS ISO codes{enter}');
      cy.get('[data-testid="sources-table-row"]')
        .first()
        .then(($element) => {
          cy.wrap($element).contains('Versions').click();
          cy.get('[data-testid="frozen-data-description"]').first().contains('test');
          cy.get('[data-testid="frozen-data-delete-button"]').first().dblclick({ force: true });
        });

      //  Confirm that frozen data source version was deleted
      cy.visit('/sources');
      cy.get('[data-testid="sources-table-search"]').type('FTS ISO codes test{enter}');
      cy.get('.row').contains('No Data');
    });
  });
});
