/// <reference types="Cypress"/>

describe('The Datasets Pages', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      const { username, password } = users.find((user) => user.role === 'admin');

      cy.login(username, password);
    });
  });

  // TODO: run each test for both my datasets & published datasets

  it('that are published should be navigated to from the sidebar', () => {
    cy.visit('/');
    cy.url().should('not.include', '/login');
    cy.get('[data-testid=sidebar-link-published-datasets]').click();
    cy.url().should('include', '/datasets');
  });

  it('renders its own help menu', () => {
    cy.visit('/');
    cy.get('[id=help-nav-dropdown]').click();
    const checkLinks = (links) => {
      Array.prototype.forEach.call(links, (link, index) => {
        if (index === links.length - 1) {
          expect(link.href).to.equal('https://github.com/devinit/ddw-analyst-ui/issues/new');
          expect(link.innerHTML).to.equal('Report Issue');
        } else {
          if (index === 0) {
            expect(link.innerHTML).to.equal('About Page');
          }
          expect(link.href).to.contain('docs.google');
        }
      });
    };
    cy.get('.dropdown-menu.show .nav-link').should('have.length.greaterThan', 0).then(checkLinks);
    // run same test for published datasets
    cy.visit('/datasets');
    cy.get('[id=help-nav-dropdown]').click();
    cy.get('.dropdown-menu.show .nav-link').should('have.length.greaterThan', 0).then(checkLinks);
  });

  xit('shows a list of paginated datasets', () => {
    // TODO: create test
  });

  xdescribe('dataset row', () => {
    xit('shows action buttons when hovered over', () => {
      // TODO: create test
    });

    xdescribe('action buttons', () => {
      xit('include a functional Edit button', () => {
        // TODO: create test - this test should fail for the published datasets page
      });

      xit('include a functional View Data button', () => {
        // TODO: create test
      });

      xit('include a functional SQL Query button', () => {
        // TODO: create test
      });

      xit('include a functional Export to CSV button', () => {
        // TODO: create test
      });

      xit('include a functional Versions button', () => {
        // TODO: create test
      });
    });

    xit('allows dataset filtering', () => {
      // TODO: create test
    });
  });
});
