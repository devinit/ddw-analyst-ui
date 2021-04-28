/// <reference types="Cypress"/>

describe('The Query Builder: SELECT STEP', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      const { username, password } = users.find((user) => user.role === 'admin');

      cy.login(username, password);
    });
  });
  const operationName = 'My Test Dataset';
  const operationDescription = 'My Test Dataset Description';

  it('can select and deselect a column', () => {
    // Visit query builder, type name and choose datasource
    cy.fillOperationForm(operationName, operationDescription);

    // Add step
    cy.get('[data-testid="qb-add-step-button"]').click();

    // Fill create step form
    cy.get('[name="name"]').eq(1).type('Dataset Step Test');
    cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
    cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');

    // Check the first checkbox
    cy.get('.selectColumnCheckbox > input').eq(0).check({ force: true });

    // Make sure first checkbox is checked
    cy.get('.selectColumnCheckbox > input').eq(0).should('be.checked');

    // Uncheck the first checkbox
    cy.get('.selectColumnCheckbox > input').eq(0).uncheck({ force: true });

    // Make sure first checkbox is unchecked
    cy.get('.selectColumnCheckbox > input').eq(0).should('not.be.checked');
  });

  it('can select & deselect all columns', () => {
    // Visit query builder type name and choose datasource
    cy.fillOperationForm(operationName, operationDescription);

    // Add step
    cy.get('[data-testid="qb-add-step-button"]').click();

    // Fill create step form
    cy.get('[name="name"]').eq(1).type('Dataset Step Test');
    cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
    cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');

    // Check all checkboxes
    cy.get('[data-testid="qb-select-all-button"').click({ force: true });

    // Make sure all checkboxes are checked
    cy.get('.selectColumnCheckbox > input').should('be.checked');

    // Uncheck all checkboxes
    cy.get('[data-testid="qb-select-none-button"').click({ force: true });

    // Make sure all checkboxes are unchecked
    cy.get('.selectColumnCheckbox > input').should('not.be.checked');
  });

  it('creates a select step', () => {
    // Visit query builder, type name and choose datasource
    cy.fillOperationForm(operationName, operationDescription);

    cy.get('[data-testid="qb-add-step-button"]').click();

    // Fill create step form
    cy.get('[name="name"]').eq(1).type('Dataset Step Test');
    cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
    cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');

    // Check the first checkbox
    cy.get('.selectColumnCheckbox > input').eq(0).check({ force: true });

    // Save and create step
    cy.get('[data-testid="qb-step-preview-button"]').click();

    // Check that we now have 1 step
    cy.get('.list-group').find('.list-group-item').should('have.length', 1);
  });

  it('shows selected columns for ordering in a select step', () => {
    // Visit query builder, type name and choose datasource
    cy.fillOperationForm(operationName, operationDescription);

    // Add step
    cy.get('[data-testid="qb-add-step-button"]').click();

    // Fill create step form
    cy.get('[name="name"]').eq(1).type('Dataset Step Test');
    cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
    cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');

    // Check the first three checkboxes
    cy.get('.selectColumnCheckbox > input').eq(0).check({ force: true });
    cy.get('.selectColumnCheckbox > input').eq(1).check({ force: true });
    cy.get('.selectColumnCheckbox > input').eq(2).check({ force: true });

    //  Show selected columns in order column view
    cy.get('[data-testid="qb-select-column-order-button"]').click();
    cy.get('[data-testid="qb-select-column-order"]').eq(0).contains('Country code');
    cy.get('[data-testid="qb-select-column-order"]').eq(1).contains('Country name');
    cy.get('[data-testid="qb-select-column-order"]').eq(2).contains('ISO Alpha 3');
  });

  it('shows message when no columns are selected for ordering in a select step', () => {
    // Visit query builder, type name and choose datasource
    cy.fillOperationForm(operationName, operationDescription);

    // Add step
    cy.get('[data-testid="qb-add-step-button"]').click();

    // Fill create step form
    cy.get('[name="name"]').eq(1).type('Dataset Step Test');
    cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
    cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');

    cy.get('[data-testid="qb-select-column-order-button"]').click();
    cy.get('[data-testid="qb-select-no-column-message"]').contains('No columns selected');
  });
});
