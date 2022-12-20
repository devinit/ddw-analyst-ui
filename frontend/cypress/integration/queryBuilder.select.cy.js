/// <reference types="Cypress"/>

const startCreateStep = (operationName, operationDescription, filterStepDataSource) => {
  // Visit query builder, type name and choose datasource
  cy.fillOperationForm(operationName, operationDescription, filterStepDataSource);

  cy.get('[data-testid="qb-add-step-button"]', { timeout: 10000 }).click({ force: true });

  // Create select query step
  cy.createSelectStep();
};

const createAnotherStepForm = (downArrows, inputSelect) => {
  // Go to create another query step form
  cy.get('[data-testid="qb-add-step-button"]', { timeout: 10000 }).click();

  cy.get('[name="name"]').eq(1).type('Dataset Step Test');
  cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
  cy.get('[data-testid="qb-step-select-query"]').type(downArrows);
  cy.get(inputSelect).type('{downarrow}add{enter}', { force: true });
};

const saveAndCheckStep = () => {
  // Save and create step
  cy.get('[data-testid="qb-step-preview-button"]', { timeout: 10000 }).click();

  cy.get('.list-group').find('.list-group-item').eq(0).click({ force: true });

  // Uncheck the first checkbox
  cy.get('.selectColumnCheckbox > input').eq(0).uncheck({ force: true });

  cy.get('.modal-content').should('be.visible');
};

const enterColumns = (column_selector, operational_value) => {
  cy.get(column_selector).type('{enter}', { force: true });
  cy.get(column_selector).type(operational_value, { force: true });
};

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
    cy.get('[data-testid="qb-add-step-button"]', { timeout: 10000 }).click({ force: true });

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
    cy.get('[data-testid="qb-add-step-button"]', { timeout: 10000 }).click({ force: true });

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

    cy.get('[data-testid="qb-add-step-button"]', { timeout: 10000 }).click({ force: true });

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
    cy.get('[data-testid="qb-add-step-button"]', { timeout: 10000 }).click({ force: true });

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
    cy.get('[data-testid="qb-add-step-button"]', { timeout: 10000 }).click({ force: true });

    // Fill create step form
    cy.get('[name="name"]').eq(1).type('Dataset Step Test');
    cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
    cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');

    cy.get('[data-testid="qb-select-column-order-button"]').click();
    cy.get('[data-testid="qb-select-no-column-message"]').contains('No columns selected');
  });

  describe('warns for breaking changes', () => {
    const filterStepDataSource = 'Financial Tracking Service';

    it('affecting the FILTER step', () => {
      startCreateStep(operationName, operationDescription, filterStepDataSource);

      // Fill create step form with 2 filters
      cy.createFilterStep('amount{enter}', '{downarrow}boundary{downarrow}');

      saveAndCheckStep();
    });

    it('affecting the JOIN step', () => {
      startCreateStep(operationName, operationDescription, filterStepDataSource);

      // Go to create another query step form
      cy.get('[data-testid="qb-add-step-button"]', { timeout: 10000 }).click();

      // Create join step
      cy.get('[name="name"]').eq(1).type('Dataset Step Test');
      cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
      cy.get('[data-testid="qb-step-select-query"]').type('{downarrow}{downarrow}{enter}');
      cy.get('[data-testid="qb-join-type"]').type('inner{enter}');
      cy.get('[data-testid="qb-join-dataset-select"]').click();
      cy.get('[name="source"] .item', { timeout: 10000 }).eq(0).click();

      cy.get('[data-testid="qb-join-add-mapping-button"]', { timeout: 10000 }).click();

      enterColumns('[data-testid="qb-join-primary-column-select"]', '{enter}');

      saveAndCheckStep();
    });

    it('affecting the AGGREGATE step', () => {
      startCreateStep(operationName, operationDescription, filterStepDataSource);

      // Go to create another query step form
      cy.get('[data-testid="qb-add-step-button"]', { timeout: 10000 }).click();

      cy.get('[name="name"]').eq(1).type('Dataset Step Test');
      cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
      cy.get('[data-testid="qb-step-select-query"]').type(
        '{downarrow}{downarrow}{downarrow}{enter}',
      );
      cy.get('[data-testid="qb-aggregate-function-select"]').type('average{enter}');
      cy.get('[name="operational_column"] > input').eq(0).type('{enter}', { force: true });
      cy.get('[name="group_by"] > input').eq(0).type('{enter}', { force: true });
      cy.get('[name="group_by"] > input').eq(0).type('{downarrow}{enter}', { force: true });

      saveAndCheckStep();
    });

    it('affecting the SCALAR TRANSFORM step', () => {
      startCreateStep(operationName, operationDescription, filterStepDataSource);
      createAnotherStepForm(
        '{downarrow}{downarrow}{downarrow}{downarrow}{enter}',
        '[name="trans_func_name"] > input',
      );
      cy.get('[name="trans_func_name"] > input').type('{downarrow}add{enter}', { force: true });
      cy.get('[name="operational_column"] > input').type('{enter}', { force: true });
      cy.get('[name="operational_value"]').type('5', { force: true });

      saveAndCheckStep();
    });

    it('affecting the MULTI TRANSFORM step', () => {
      startCreateStep(operationName, operationDescription, filterStepDataSource);

      createAnotherStepForm(
        '{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{enter}',
        '[name="trans_func_name"] > input',
      );
      enterColumns('[name="operational_columns"] > input', '{downarrow}{enter}');
      saveAndCheckStep();
    });

    it('affecting the WINDOW step', () => {
      startCreateStep(operationName, operationDescription, filterStepDataSource);

      createAnotherStepForm(
        '{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{enter}',
        '[name="window_fn"] > input',
      );
      cy.get('[name="term"] > input').type('{enter}', { force: true });
      cy.get('[name="over"] > input').type('{downarrow}{enter}', { force: true });
      cy.get('[name="order_by"] > input').type('{downarrow}{enter}', { force: true });
      enterColumns('[name="columns"] > input', '{downarrow}{enter}');

      saveAndCheckStep();
    });
  });
});
