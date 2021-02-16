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
