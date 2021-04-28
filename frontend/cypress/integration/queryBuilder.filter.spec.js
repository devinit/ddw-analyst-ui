/// <reference types="Cypress"/>

describe('The Query Builder: FILTER STEP', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      const { username, password } = users.find((user) => user.role === 'admin');

      cy.login(username, password);
    });
  });
  const operationName = 'My Test Dataset';
  const operationDescription = 'My Test Dataset Description';

  const firstFilterValue = '{downarrow}Country code{enter}';
  const secondFilterValue = '{downarrow}Country name{downarrow}';

  it('can add and delete a filter', () => {
    // Visit query builder type name and choose datasource
    cy.fillOperationForm(operationName, operationDescription);

    // Fill create step form with 2 filters
    cy.createFilterStep(firstFilterValue, secondFilterValue);

    // Delete first filter
    cy.get('[data-testid="qb-filter-delete-button"]').eq(0).click();

    // Check that first filter is not visible
    cy.contains('Country code').should('not.be.visible');

    // Check that second filter is visible
    cy.contains('Country name').should('be.visible');
  });

  it('shows information on filter options', () => {
    // Visit query builder type name and choose datasource
    cy.fillOperationForm(operationName, operationDescription);

    // Fill create step form with 2 filters
    cy.createFilterStep(firstFilterValue, secondFilterValue);

    cy.get('[data-testid="qb-filter-info-button"]').click();

    cy.contains('Multiple filter options').should('be.visible');
  });

  it('creates a filter step', () => {
    // Visit query builder, type name and choose datasource
    cy.fillOperationForm(operationName, operationDescription);

    // Make sure no filters exist before we add any
    cy.get('.list-group').should('not.exist');

    // Fill create step form with 2 filters
    cy.createFilterStep(firstFilterValue, secondFilterValue);

    // Save and create step
    cy.get('[data-testid="qb-step-preview-button"]').click();

    // Check that we now have 1 filter
    cy.get('.list-group').find('.list-group-item').should('have.length', 1);
  });

  it('makes a copy of a filter', () => {
    // Visit query builder, type name and choose datasource
    cy.fillOperationForm(operationName, operationDescription);

    // Fill create step form with 2 filters
    cy.createFilterStep(firstFilterValue, secondFilterValue);

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
