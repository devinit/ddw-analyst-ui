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
