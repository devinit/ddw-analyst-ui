// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
import { Base64 } from 'js-base64';
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    url: '/api/auth/login/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Base64.encode(`${email}:${password}`)}`,
    },
  }).then(({ body, status }) => {
    expect(status).to.eq(200);
    expect(body).to.have.property('token');
    expect(body).to.have.property('user');
    const localStorarePrefix = 'ddw-analyst-ui/ddw_store/';

    window.localStorage.setItem(`${localStorarePrefix}API_KEY`, JSON.stringify(body.token));
    window.localStorage.setItem(`${localStorarePrefix}USER`, JSON.stringify(body.user));

    return body;
  });
});

Cypress.Commands.add('fillOperationForm', (name, description, dataSource = 'CRS ISO codes') => {
  // Visit query builder type name and choose datasource
  cy.visit('/queries/build');
  cy.get('[name="name"]').focus().type(name);
  cy.get('[name="description"]').focus().type(description);
  cy.get('.search').eq(1).click({ force: true }).type(dataSource);
  cy.get('.item', { timeout: 10000 }).eq(0).click();
});

Cypress.Commands.add('createFilterStep', (firstFilterValue, secondFilterValue) => {
  // Add step
  cy.get('[data-testid="qb-add-step-button"]').click();

  // Fill create query step form
  cy.get('[name="name"]').eq(1).type('Dataset Step Test');
  cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
  cy.get('[data-testid="qb-step-select-query"]').type('{downarrow}filter{enter}');

  // Add first filter
  cy.get('[data-testid="qb-filter-add-button"]').click();
  cy.get('[data-testid="qb-filter-select-column"]>input')
    .eq(0)
    .click({ force: true })
    .type(firstFilterValue);
  cy.get('[data-testid="qb-filter-select-operation"]')
    .click({ force: true })
    .type('{downarrow}{enter}{esc}');
  cy.get('[name="value"]').type('2');

  // Add second filter
  cy.get('[data-testid="qb-filter-add-button"]').click();
  cy.get('[data-testid="qb-filter-select-column"]')
    .eq(1)
    .click({ force: true })
    .type(secondFilterValue);
  cy.get('[data-testid="qb-filter-select-operation"]')
    .eq(1)
    .click({ force: true })
    .type('{downarrow}{enter}{esc}');
  cy.get('[name="value"]').eq(1).type('3');
});

Cypress.Commands.add('createSelectStep', () => {
  // Fill create step form
  cy.get('[name="name"]').eq(1).type('Dataset Step Test');
  cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
  cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');

  // Check all checkboxes
  cy.get('[data-testid="qb-select-all-button"]').click();

  // Save and create step
  cy.get('[data-testid="qb-step-preview-button"]').click();
});

Cypress.Commands.add('getAccessToken', () => {
  const localStoragePrefix = 'ddw-analyst-ui/ddw_store/';
  const token = window.localStorage.getItem(`${localStoragePrefix}API_KEY`);

  return token;
});

Cypress.Commands.add('freezeDataSource', () => {
  cy.visit('/sources');
  cy.get('[data-testid="sources-table-search"]').type('FTS ISO codes{enter}').first();
  cy.get('[data-testid="sources-table-row"]')
    .first()
    .then(($element) => {
      cy.wrap($element).contains('Versions').click();
      cy.get('[data-testid="source-version-freeze-button"]').click();
      cy.get('[data-testid="frozen-data-form-message"]').should('be.visible').type('test');
      cy.get('[data-testid="frozen-data-form-save-button"]').should('be.visible').click();
      cy.get('[data-testid="frozen-dataset-refresh-button"]').first().click({ force: true });
    });
});

Cypress.Commands.add('deleteFrozenDataSource', () => {
  cy.visit('/sources');
  cy.get('[data-testid="sources-table-search"]').type('FTS ISO codes{enter}');
  cy.get('[data-testid="sources-table-row"]')
    .first()
    .then(($element) => {
      cy.wrap($element).contains('Versions').click();
      cy.get('[data-testid="frozen-data-description"]').first().contains('test');
      cy.get('[data-testid="frozen-data-delete-button"]').first().dblclick({ force: true });
    });
});

Cypress.Commands.add('freezeDataset', () => {
  cy.visit('/');
  cy.get('.dataset-row').eq(0).contains('Versions').click({ force: true });
  cy.get('[data-testid="dataset-freeze-button"]').click();
  cy.get('[data-testid="dataset-frozen-data-description"]')
    .should('be.visible')
    .type('Test dataset freeze');
  cy.get('[data-testid="dataset-frozen-data-save-button"]').should('be.visible').click();
  cy.get('[data-testid="dataset-frozen-data-refresh-button"]').first().click({ force: true });
});

//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
