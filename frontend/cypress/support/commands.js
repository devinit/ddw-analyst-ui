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
        'Authorization': `Basic ${Base64.encode(`${email}:${password}`)}`
      }
    })
    .then(({body, status}) => {
      expect(status).to.eq(200);
      expect(body).to.have.property('token');
      expect(body).to.have.property('user');
      const localStorarePrefix = 'ddw-analyst-ui/ddw_store/';

      window.localStorage.setItem(`${localStorarePrefix}API_KEY`, JSON.stringify(body.token));
      window.localStorage.setItem(`${localStorarePrefix}USER`, JSON.stringify(body.user));

      return body;
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
