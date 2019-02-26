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
      credentials: 'omit',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Base64.encode(`${email}:${password}`)}`
      }
    })
    .then(resp => {
      expect(resp.status).to.eq(200);
      expect(resp.body).to.have.property('token');
      window.localStorage.setItem(
        'ddw-analyst-ui/ddw_store/API_KEY',
        resp.body.token
      );
      cy.visit('/');
    });
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
