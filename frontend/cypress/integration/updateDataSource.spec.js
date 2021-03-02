/// <reference types="Cypress"/>

describe('The Update Data Source Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      const { username, password } = users.find((user) => user.role === 'admin');

      cy.login(username, password);
    });
  });

  it('should be navigated to from the sidebar', () => {
    cy.visit('/');
    cy.url().should('not.include', '/login');
    cy.get('[data-testid=sidebar-link-update]').click();
    cy.url().should('include', '/update');
  });

  it('renders its own help menu', () => {
    cy.visit('/update');
    cy.get('[id=help-nav-dropdown]').click();
    cy.get('.dropdown-menu.show .nav-link')
      .should('have.length.greaterThan', 0)
      .then((links) => {
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
      });
  });

  xdescribe('wizard STEP ONE', () => {
    xit('selects, downloads & shows a column data type mapping of a data source to update', () => {
      // TODO: create test
    });
  });

  xdescribe('wizard STEP TWO', () => {
    xit('selects and previews a CSV file', () => {
      // TODO: create test
    });
  });

  xdescribe('wizard STEP THREE', () => {
    xit('maps columns in the CSV file to columns in the data source table', () => {
      // TODO: create test
    });
  });

  xdescribe('wizard STEP FOUR', () => {
    xit('performs the upload', () => {
      // TODO: create test
    });
  });
});
