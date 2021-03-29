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

Cypress.Commands.add('fillOperationForm', () => {
  // Visit query builder type name and choose datasource
  cy.visit('/queries/build');
  cy.get('[name="name"]').focus().type('My Test Dataset');
  cy.get('[name="description"]').focus().type('My Test Dataset Description');
  cy.get('.search').eq(1).click({ force: true });
  cy.wait(5000);
  cy.get('.search').eq(1).type('CRS ISO codes{enter}{esc}');
});

Cypress.Commands.add('useFTS', () => {
  // Visit query builder type name and choose datasource
  cy.visit('/queries/build');
  cy.get('[name="name"]').focus().type('My Test Dataset');
  cy.get('[name="description"]').focus().type('My Test Dataset Description');
  cy.get('.search').eq(1).click({ force: true });
  cy.wait(5000);
  cy.get('.search').eq(1).type('Financial Tracking Service{enter}{esc}');
});

Cypress.Commands.add('fillStepForm', () => {
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
    .type('{downarrow}Country code{enter}');
  cy.get('[data-testid="qb-filter-select-operation"]')
    .click({ force: true })
    .type('{downarrow}{enter}{esc}');
  cy.get('[name="value"]').type('2');

  // Add second filter
  cy.get('[data-testid="qb-filter-add-button"]').click();
  cy.get('[data-testid="qb-filter-select-column"]')
    .eq(1)
    .click({ force: true })
    .type('{downarrow}Country name{downarrow}');
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
