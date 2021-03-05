/// <reference types="Cypress"/>

describe('The Query Builder', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      const { username, password } = users.find((user) => user.role === 'admin');

      cy.login(username, password);
    });
  });

  it('should be navigated to from the sidebar', () => {
    cy.visit('/');
    cy.url().should('not.include', '/login');
    cy.get('[data-testid=sidebar-link-query-builder]').click();
    cy.url().should('include', '/queries/build');
  });

  it('renders its own help menu', () => {
    cy.visit('/queries/build');
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

  it('that is not a draft requires both a name and description', () => {
    // Visit query builder type in name and choose datasource
    cy.get('[data-testid=sidebar-link-query-builder]').click();
    cy.get('[name="name"]').focus().type('My Test Dataset');
    cy.get('[name="description"]').focus().type('My Test Dataset Description');
    cy.get('.search').eq(1).click({ force: true });
    cy.wait(5000);
    cy.get('.search').eq(1).type('CRS ISO Codes{enter}');

    // Add step
    cy.get('[data-testid="qb-add-step-button"]').click();

    // Fill in create step form
    cy.get('[name="name"]').eq(1).type('Dataset Step Test');
    cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
    cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');
    cy.get('[data-testid="qb-select-columns"]').type('code{enter}');
    cy.get('[data-testid="qb-select-columns"]').type('name{enter}{esc}');

    // Save create step
    cy.get('[data-testid="qb-step-preview-button"]').click();

    // For published dataset, check that is_draft is not checked
    cy.get('.form-check-input').should('not.be.checked');

    // Check that all validation elements are hidden
    cy.get('.invalid-feedback').should('not.be.visible');
  });

  it('that encountered an error or interruption during alias creation shows a warning', () => {
    // Mock datasets route
    cy.fixture('datasets').then((datasets) => {
      const aliasPendingDataset = datasets.results.find(
        (dataset) => (dataset.alias_creation_status = 'p'),
      );
      cy.intercept('api/dataset/1/', aliasPendingDataset);
    });

    cy.visit('/queries/build/1/');
    cy.get('[data-testid="qb-alert"] p').contains(
      'There was interruption while creating column aliases for this dataset. Please save the dataset again',
    );
  });

  it('that has logs displays them in an alert', () => {
    // Mock datasets route
    cy.fixture('datasets').then((datasets) => {
      cy.intercept('api/dataset/2/', datasets.results[1]);
    });

    cy.visit('/queries/build/2/');
    cy.get('[data-testid="qb-alert"] p')
      .first()
      .contains(`Columns donor_code, donor_name used in steps 1 are obsolete.`);
  });

  xit('with an active data source has a button to add a step', () => {
    // TODO: create test
  });

  xdescribe('SELECT step', () => {
    xit('can select and deselect a column', () => {
      // TODO: create test
    });

    xit('can select & deselect all columns', () => {
      // TODO: create test
    });

    xit('creates a select step', () => {
      // TODO: create test
    });
  });

  describe('FILTER step', () => {
    it('can add and delete a filter', () => {
      // Visit query builder type name and choose datasource
      cy.fillOperationForm();

      // Fill create step form with 2 filters
      cy.fillStepForm();

      // Delete first filter
      cy.get('[data-testid="qb-filter-delete-button"]').eq(0).click();

      // Check that first filter is not visible
      cy.contains('Country code').should('not.be.visible');

      // Check that second filter is visible
      cy.contains('Country name').should('be.visible');
    });

    it('shows information on filter options', () => {
      // Visit query builder type name and choose datasource
      cy.fillOperationForm();

      // Fill create step form with 2 filters
      cy.fillStepForm();

      cy.get('[data-testid="qb-filter-info-button"]').click();

      cy.contains('Multiple filter options').should('be.visible');
    });

    it('creates a filter step', () => {
      // Visit query builder, type name and choose datasource
      cy.fillOperationForm();

      // Make sure no filters exist before we add any
      cy.get('.list-group').should('not.exist');

      // Fill create step form with 2 filters
      cy.fillStepForm();

      // Save and create step
      cy.get('[data-testid="qb-step-preview-button"]').click();

      // Check that we now have 1 filter
      cy.get('.list-group').find('.list-group-item').should('have.length', 1);
    });
  });

  xit('creates a JOIN step', () => {
    // TODO: create test
  });

  xdescribe('creates an AGGREGATE step', () => {
    // TODO: create test
  });

  xit('creates a SCALAR TRANSFORM step', () => {
    // TODO: create test
  });

  xit('creates a MULTI TRANSFORM step', () => {
    // TODO: create test
  });

  xit('creates a dataset', () => {
    // TODO: create test
  });

  xit('previews a dataset', () => {
    // TODO: create test
  });

  xit('makes a copy of a dataset', () => {
    // TODO: create test
  });
});
