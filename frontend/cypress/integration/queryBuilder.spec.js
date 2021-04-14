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
    cy.visit('/queries/build');
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

    // Check the first and second checkbox
    cy.get('.selectColumnCheckbox > input').eq(0).check({force: true});
    cy.get('.selectColumnCheckbox > input').eq(1).check({force: true});

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

  it('that creates a copy of a step', () => {
    cy.fixture('datasets').then((datasets) => {
      cy.intercept('api/dataset/3/', datasets.results[2]);
    });
    cy.visit('/queries/build/3/');
    cy.get('[data-testid="step-duplicate"]').click({ force: true });
    cy.url().should('include', '/queries/build');
    cy.get('[data-testid="op-step-name"]').should('have.value', 'Copy of Select');
  });

  xit('with an active data source has a button to add a step', () => {
    // TODO: create test
  });

  describe('SELECT step', () => {
    it('can select and deselect a column', () => {
      // Visit query builder, type name and choose datasource
      cy.useCrsIsoCodes();

      // Add step
      cy.get('[data-testid="qb-add-step-button"]').click();

      // Fill create step form
      cy.get('[name="name"]').eq(1).type('Dataset Step Test');
      cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
      cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');

      // Check the first checkbox
      cy.get('.selectColumnCheckbox > input').eq(0).check({force: true});

      // Make sure first checkbox is checked
      cy.get('.selectColumnCheckbox > input').eq(0).should('be.checked');

      // Uncheck the first checkbox
      cy.get('.selectColumnCheckbox > input').eq(0).uncheck({force: true});

      // Make sure first checkbox is unchecked
      cy.get('.selectColumnCheckbox > input').eq(0).should('not.be.checked');

    });

    it('can select & deselect all columns', () => {
      // Visit query builder type name and choose datasource
      cy.useCrsIsoCodes();

      // Add step
      cy.get('[data-testid="qb-add-step-button"]').click();

      // Fill create step form
      cy.get('[name="name"]').eq(1).type('Dataset Step Test');
      cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
      cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');

      // Check all checkboxes
      cy.get('[data-testid="qb-select-all-button"').click({force: true});

      // Make sure all checkboxes are checked
      cy.get('.selectColumnCheckbox > input').should('be.checked');

      // Uncheck all checkboxes
      cy.get('[data-testid="qb-select-none-button"').click({force: true});

      // Make sure all checkboxes are unchecked
      cy.get('.selectColumnCheckbox > input').should('not.be.checked');
    });

    it('creates a select step', () => {
      // Visit query builder, type name and choose datasource
      cy.useCrsIsoCodes();

      cy.get('[data-testid="qb-add-step-button"]').click();

      // Fill create step form
      cy.get('[name="name"]').eq(1).type('Dataset Step Test');
      cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
      cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');

      // Check the first checkbox
      cy.get('.selectColumnCheckbox > input').eq(0).check({force: true});

      // Save and create step
      cy.get('[data-testid="qb-step-preview-button"]').click();

      // Check that we now have 1 step
      cy.get('.list-group').find('.list-group-item').should('have.length', 1);

    });
  });

  describe('FILTER step', () => {
    it('can add and delete a filter', () => {
      // Visit query builder type name and choose datasource
      cy.useCrsIsoCodes();

      // Fill create step form with 2 filters
      cy.createCRSFilterStep();

      // Delete first filter
      cy.get('[data-testid="qb-filter-delete-button"]').eq(0).click();

      // Check that first filter is not visible
      cy.contains('Country code').should('not.be.visible');

      // Check that second filter is visible
      cy.contains('Country name').should('be.visible');
    });

    it('shows information on filter options', () => {
      // Visit query builder type name and choose datasource
      cy.useCrsIsoCodes();

      // Fill create step form with 2 filters
      cy.createCRSFilterStep();

      cy.get('[data-testid="qb-filter-info-button"]').click();

      cy.contains('Multiple filter options').should('be.visible');
    });

    it('creates a filter step', () => {
      // Visit query builder, type name and choose datasource
      cy.useCrsIsoCodes();

      // Make sure no filters exist before we add any
      cy.get('.list-group').should('not.exist');

      // Fill create step form with 2 filters
      cy.createCRSFilterStep();

      // Save and create step
      cy.get('[data-testid="qb-step-preview-button"]').click();

      // Check that we now have 1 filter
      cy.get('.list-group').find('.list-group-item').should('have.length', 1);
    });

    it('makes a copy of a filter', () => {
      // Visit query builder, type name and choose datasource
      cy.fillOperationForm();

      // Fill create step form with 2 filters
      cy.fillStepForm();

      // Save and create step
      cy.get('[data-testid="qb-step-preview-button"]').click();

      // Click on the step
      cy.get('[data-testid="qb-step-wrapper"]').click();

      // Click filter duplicate button
      cy.get('[data-testid="qb-filter-duplicate-button"]').first().click();

      //Check that a copy of the filter has been made with the value field being empty
      cy.get('[data-testid="qb-filter-select-column"]').eq(2).contains('Country code');
      cy.get('[data-testid="qb-filter-select-operation"]').eq(2).contains('is Less Than Or Equal');
      cy.get('[data-testid="qb-filter-value"]').eq(2).should('be.empty');
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

  describe('Warning for breaking changes', () => {
    it('Filter step', () => {
      // Visit query builder, type name and choose datasource
      cy.useFTS();

      cy.get('[data-testid="qb-add-step-button"]').click();

      // Create select query step
      cy.createGenericSelectStep();

      // Fill create step form with 2 filters
      cy.createFTSFilterStep();

      // Save and create step
      cy.get('[data-testid="qb-step-preview-button"]').click();

      cy.get('.list-group').find('.list-group-item').eq(0).click({force: true});

      // Uncheck the first checkbox
      cy.get('.selectColumnCheckbox > input').eq(0).uncheck({force: true});

      cy.get('.modal-content').should('be.visible');

    });

    it('Join step', () => {
      // Visit query builder, type name and choose FTS datasource
      cy.useFTS();

      cy.get('[data-testid="qb-add-step-button"]').click();

      // Create select query step
      cy.createGenericSelectStep();

      // Go to create another query step form
      cy.get('[data-testid="qb-add-step-button"]').click();

      // Create join step
      cy.get('[name="name"]').eq(1).type('Dataset Step Test');
      cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
      cy.get('[data-testid="qb-step-select-query"]').type('{downarrow}{downarrow}{enter}');
      cy.get('[data-testid="qb-join-type"]').type('inner{enter}');      
      cy.get('[data-testid="qb-join-dataset-select"]').type('{enter}');
      
      cy.get('[data-testid="qb-join-add-mapping-button"]').click();

      cy.get('[data-testid="qb-join-primary-column-select"]').type('{enter}');
      cy.get('[data-testid="qb-join-secondary-column-select"]').type('{enter}');

      // Save and create join step
      cy.get('[data-testid="qb-step-preview-button"]').click();

      cy.get('.list-group').find('.list-group-item').eq(0).click({force: true});

      // Uncheck the first checkbox
      cy.get('.selectColumnCheckbox > input').eq(0).uncheck({force: true});

      cy.get('.modal-content').should('be.visible');

    });

    it('Aggregate step', () => {
      // Visit query builder, type name and choose datasource
      cy.useFTS();

      cy.get('[data-testid="qb-add-step-button"]').click();

      // Create select query step
      cy.createGenericSelectStep();

      // Go to create another query step form
      cy.get('[data-testid="qb-add-step-button"]').click();

      cy.get('[name="name"]').eq(1).type('Dataset Step Test');
      cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
      cy.get('[data-testid="qb-step-select-query"]').type('{downarrow}{downarrow}{downarrow}{enter}');
      cy.get('[data-testid="qb-aggregate-function-select"]').type('average{enter}');      
      cy.get('[name="operational_column"] > input').eq(0).type('{enter}', {force: true});
      cy.get('[name="group_by"] > input').eq(0).type('{enter}', {force: true});
      cy.get('[name="group_by"] > input').eq(0).type('{downarrow}{enter}', {force: true});
      
      // Save and create step
      cy.get('[data-testid="qb-step-preview-button"]').click();

      cy.get('.list-group').find('.list-group-item').eq(0).click({force: true});

      // // Uncheck the first checkbox
      cy.get('.selectColumnCheckbox > input').eq(0).uncheck({force: true});

      cy.get('.modal-content').should('be.visible');

    });

    it('Scalar transform step', () => {
      // Visit query builder, type name and choose datasource
      cy.useFTS();

      cy.get('[data-testid="qb-add-step-button"]').click();

      // Create select query step
      cy.createGenericSelectStep();

      // Go to create another query step form
      cy.get('[data-testid="qb-add-step-button"]').click();

      cy.get('[name="name"]').eq(1).type('Dataset Step Test');
      cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
      cy.get('[data-testid="qb-step-select-query"]').type('{downarrow}{downarrow}{downarrow}{downarrow}{enter}');      
      cy.get('[name="trans_func_name"] > input').type('{downarrow}add{enter}', {force: true});
      cy.get('[name="operational_column"] > input').type('{enter}', {force: true});
      cy.get('[name="operational_value"]').type('5', {force: true});
      
      // Save and create step
      cy.get('[data-testid="qb-step-preview-button"]').click();

      cy.get('.list-group').find('.list-group-item').eq(0).click({force: true});

      // Uncheck the first checkbox
      cy.get('.selectColumnCheckbox > input').eq(0).uncheck({force: true});

      cy.get('.modal-content').should('be.visible');

    });

  it('Multi tranform step', () => {
    // Visit query builder, type name and choose datasource
    cy.useFTS();

    cy.get('[data-testid="qb-add-step-button"]').click();

    // Create select query step
    cy.createGenericSelectStep();

    // Go to create another query step form
    cy.get('[data-testid="qb-add-step-button"]').click();

    cy.get('[name="name"]').eq(1).type('Dataset Step Test');
    cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
    cy.get('[data-testid="qb-step-select-query"]').type('{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{enter}');              
    cy.get('[name="trans_func_name"] > input').type('{downarrow}add{enter}', {force: true});
    
    cy.get('[name="operational_columns"] > input').type('{enter}', {force: true});    
    cy.get('[name="operational_columns"] > input').type('{downarrow}{enter}', {force: true});
    
    // Save and create step
    cy.get('[data-testid="qb-step-preview-button"]').click();

    cy.get('.list-group').find('.list-group-item').eq(0).click({force: true});

    // Uncheck the first checkbox
    cy.get('.selectColumnCheckbox > input').eq(0).uncheck({force: true});

    cy.get('.modal-content').should('be.visible');
  });

  it('Window step', () => {
    // Visit query builder, type name and choose datasource
    cy.useFTS();

    cy.get('[data-testid="qb-add-step-button"]').click();

    // Create select query step
    cy.createGenericSelectStep();

    // Go to create another query step form
    cy.get('[data-testid="qb-add-step-button"]').click();

    cy.get('[name="name"]').eq(1).type('Dataset Step Test');
    cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
    cy.get('[data-testid="qb-step-select-query"]').type('{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{enter}');              
    cy.get('[name="window_fn"] > input').type('{downarrow}add{enter}', {force: true});
    
    cy.get('[name="term"] > input').type('{enter}', {force: true});    
    cy.get('[name="over"] > input').type('{downarrow}{enter}', {force: true});
    cy.get('[name="order_by"] > input').type('{downarrow}{enter}', {force: true});
    cy.get('[name="columns"] > input').type('{enter}', {force: true});
    cy.get('[name="columns"] > input').type('{downarrow}{enter}', {force: true});
    
    // Save and create step
    cy.get('[data-testid="qb-step-preview-button"]').click();

    cy.get('.list-group').find('.list-group-item').eq(0).click({force: true});

    // Uncheck the first checkbox
    cy.get('.selectColumnCheckbox > input').eq(0).uncheck({force: true});

    cy.get('.modal-content').should('be.visible');

  });
});

  xit('creates a dataset', () => {
    // TODO: create test
  });

  xit('previews a dataset', () => {
    // TODO: create test
  });
});
