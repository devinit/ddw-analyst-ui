/// <reference types="Cypress"/>

describe('The Update Data Source Page', () => {
  beforeEach(() => {
    cy.setupUser();
  });

  it('should be navigated to from the sidebar', () => {
    cy.navFromSidebar('[data-testid=sidebar-link-update]', '/update');
  });

  it('renders its own help menu', () => {
    cy.checkRenderOwnMenu();
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
