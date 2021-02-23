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

  it('that is not a draft requires both a name and description', () => {
    // Visit query builder type name and choose datasource
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
    cy.get('[data-testid="qb-select-columns"]').type('code{enter}');
    cy.get('[data-testid="qb-select-columns"]').type('name{enter}{esc}');

    // Save create step
    cy.get('[data-testid="qb-step-preview-button"]').click();

    // For published dataset, check that is_draft is not checked
    cy.get('.form-check-input').should('not.be.checked');

    // Check that validation for name cannot be seen
    cy.contains('Name is required').should('not.be.visible');

    // Check that validation for description cannot be seen
    cy.contains('Description is required').should('not.be.visible');
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

  xdescribe('FILTER step', () => {
    xit('can add and delete a filter', () => {
      // TODO: create test
    });

    xit('shows information on filter options', () => {
      // TODO: create test
    });

    xit('creates a filter step', () => {
      // TODO: create test
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
