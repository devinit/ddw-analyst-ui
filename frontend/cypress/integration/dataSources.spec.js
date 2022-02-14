/// <reference types="Cypress"/>

describe('The Data Sources Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      const { username, password } = users.find((user) => user.role === 'admin');

      cy.login(username, password);
    });
  });

  it('should be navigated to from the sidebar', () => {
    cy.visit('/');
    cy.url().should('not.include', '/login');
    cy.get('[data-testid=sidebar-link-sources]').click();
    cy.url().should('include', '/sources');
  });

  it('renders the sources in a data table', () => {
    cy.visit('/sources');
    cy.get('.sources-table').find('tbody').find('tr').should('have.length.greaterThan', 0);
    cy.get('.sources-table').find('tbody').find('tr').should('have.length.lessThan', 11);
  });

  describe('sources table', () => {
    it('shows each row with action buttons', () => {
      cy.visit('/sources');
      cy.get('[data-testid=sources-table-row]').then((rows) => {
        cy.get('[data-testid=source-table-row-actions]').then((actions) => {
          expect(rows.length).to.equal(actions.length);
        });
      });
    });

    it('it does not paginate when sources do not exceed 10', () => {
      cy.fixture('dataSources').then((sources) => {
        sources.count = 10;
        sources.results = sources.results.slice(0, 10);
        cy.intercept('api/sources/?limit=10&offset=0', sources);
      });
      cy.visit('/sources');
      cy.url().should('eq', `${Cypress.config('baseUrl')}/sources/`);
      cy.get('[data-testid="pagination-results-count"]').should(
        'contain.text',
        'Showing 1 to 10 of 10',
      );
      cy.get('.pagination > li').its('length').should('eq', 3);
      cy.get('.pagination > li')
        .eq(0)
        .should('have.class', 'disabled')
        .and('contain.text', 'Previous');
      cy.get('.pagination > li').eq(1).should('have.class', 'active').and('contain.text', 1);
      cy.get('.pagination > li').eq(2).should('have.class', 'disabled').and('contain.text', 'Next');
    });

    it('it paginates when sources exceed 10', () => {
      cy.fixture('dataSources').then((sources) => {
        sources.count = 15;
        sources.results = sources.results.slice(0, 10);
        cy.intercept('api/sources/?limit=10&offset=0&search=', sources);
      });
      cy.fixture('dataSources').then((sources) => {
        sources.count = 15;
        sources.results = sources.results.slice(10, 15);
        cy.intercept('api/sources/?limit=10&offset=10&search=', sources);
      });
      cy.visit('/sources');
      cy.url().should('eq', `${Cypress.config('baseUrl')}/sources/`);
      cy.get('[data-testid="sources-table-row"]').its('length').should('eq', 10);
      cy.get('[data-testid="pagination-results-count"]').should(
        'contain.text',
        'Showing 1 to 10 of 15',
      );
      cy.get('.pagination > li').its('length').should('eq', 4);
      cy.get('.pagination > li')
        .eq(3)
        .should('not.have.class', 'disabled')
        .and('contain.text', 'Next');
      cy.get('.pagination > li').find('a').eq(2).click();
      cy.wait(100);
      cy.get('.pagination > li').eq(2).should('have.class', 'active');
      cy.url().should('eq', `${Cypress.config('baseUrl')}/sources/?page=2`);
      cy.get('[data-testid="pagination-results-count"]').should(
        'contain.text',
        'Showing 11 to 15 of 15',
      );
      cy.get('[data-testid="sources-table-row"]').its('length').should('eq', 5);
      cy.get('.pagination > li').find('a').eq(1).click();
      cy.get('.pagination > li').eq(1).should('have.class', 'active');
      cy.url().should('eq', `${Cypress.config('baseUrl')}/sources/?page=1`);
    });

    it('it filters by text', () => {
      cy.intercept('/api/sources/?limit=10&offset=0').as('datasources');

      cy.visit('/sources');
      cy.url().should('eq', `${Cypress.config('baseUrl')}/sources/`);

      cy.wait('@datasources').then((res) => {
        cy.get('[data-testid="sources-table-search"]').type('code{enter}');
        cy.url().should('eq', `${Cypress.config('baseUrl')}/sources/?page=1&search=code`);
        cy.get('[data-testid="sources-table-search"]').should('have.value', 'code');
        cy.getAccessToken().then((token) => {
          if (token) {
            const options = {
              url: `${Cypress.config('baseUrl')}/api/sources/?&offset=0&search=code`,
              headers: {
                Authorization: `token ${token.replaceAll('"', '')}`,
              },
            };
            cy.request(options).then((response) => {
              expect(res.response.body.count).to.not.equal(response.body.count);
            });
          }
        });
        cy.go('back');
        cy.url().should('eq', `${Cypress.config('baseUrl')}/sources/`);
        cy.get('[data-testid="sources-table-search"]').should('have.value', '');
      });
    });

    xit('actions buttons function properly', () => {
      // TODO: add test
    });
  });

  it('renders its own help menu', () => {
    cy.visit('/sources');
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

  describe('data source update', () => {
    it('freezes a data source', () => {
      cy.visit('/sources');
      cy.get('[data-testid="sources-table-search"]').type('FTS ISO codes{enter}').first();
      cy.get('[data-testid="sources-table-row"]')
        .first()
        .then(($element) => {
          cy.wrap($element).contains('Versions').click();
          cy.get('[data-testid="source-version-freeze-button"]').click();
          cy.get('[data-testid="frozen-data-form-message"]')
            .should('be.visible')
            .type('End-to-end test freeze data source');
          cy.get('[data-testid="frozen-data-form-save-button"]').should('be.visible').click();
          cy.get('[data-testid="frozen-dataset-refresh-button"]').first().click({ force: true });
        });
      cy.get('[data-testid="frozen-data-status"]').each((badge) => {
        expect(['Errored', 'Completed', 'Pending'].includes(badge[0].innerHTML)).to.be.true;
      });
      cy.get('[data-testid="frozen-data-description"]').contains(
        'End-to-end test freeze data source',
      );
    });

    it('downloads a successfully frozen data source', () => {
      cy.wait(100);
      cy.get('.dataset-row')
        .first()
        .then((row) => {
          const badge = row.find('[data-testid="frozen-data-status"]');
          if (badge[0].innerHTML === 'Completed') {
            cy.document().then((doc) => {
              const frozenDatasetUrl = doc
                .querySelector('[data-testid="frozen-source-download-button"]')
                .getAttribute('href');
              cy.request({
                url: `${Cypress.config('baseUrl')}${frozenDatasetUrl}`,
                encoding: 'base64',
              }).then((response) => {
                expect(response.status).to.equal(200);
              });
            });
          } else if (['Completed', 'Pending'].includes(badge[0].innerHTML)) {
            cy.get(row.find('[data-testid="frozen-source-download-button"]')).should('not.exist');
          }
        });
    });

    it('searches for frozen data source in sources', () => {
      cy.visit('/sources');
      cy.get('[data-testid="sources-table-search"]').type(
        'End-to-end test freeze data source{enter}',
      );
      cy.get('[data-testid="sources-table-row"]')
        .first()
        .contains('End-to-end test freeze data source');
    });

    it('querys a frozen data source', () => {
      cy.visit('/queries/build');
      cy.get('[name="name"]').focus().type('My Test Dataset');
      cy.get('[name="description"]').focus().type('My Test Dataset Description');
      cy.get('.search').eq(1).click({ force: true }).type('End-to-end test freeze data source');
      cy.get('.item', { timeout: 10000 }).eq(0).click();
      cy.get('[data-testid="qb-add-step-button"]').click();

      cy.get('[name="name"]').eq(1).type('Dataset Step Test');
      cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
      cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');
      cy.get('.selectColumnCheckbox > input').eq(0).check({ force: true });
      cy.get('[data-testid="qb-step-preview-button"]').click();
      cy.get('[data-testid="qb-save-button"]').click();
      cy.get('.dataset-row-footer').eq(0).contains('End-to-end test freeze data source');
    });

    it('deletes a frozen data source', () => {
      cy.visit('/sources');
      cy.get('[data-testid="sources-table-search"]').type('FTS ISO codes{enter}');
      cy.get('[data-testid="sources-table-row"]')
        .first()
        .then(($element) => {
          cy.wrap($element).contains('Versions').click();
          cy.get('.dataset-row')
            .its('length')
            .then((rowNumber) => {
              cy.wrap(rowNumber).as('dataSourceRowNumber');
            });
          cy.get('[data-testid="frozen-data-description"]')
            .first()
            .contains('End-to-end test freeze data source');
          cy.get('[data-testid="frozen-data-delete-button"]').first().dblclick({ force: true });

          // Check row count after deleting
          cy.get('@dataSourceRowNumber').then((dataSourceRowNumber) => {
            cy.get('.dataset-row').should('have.length', dataSourceRowNumber - 1);
          });
        });

      //  Confirm that frozen data source was deleted
      cy.visit('/sources');
      cy.get('[data-testid="sources-table-search"]').type(
        'End-to-end test freeze data source{enter}',
      );
      cy.get('.row').contains('No Data');
    });

    it('that info button logs error message incase of a datasource freeze error', () => {
      cy.intercept('GET', '/api/source/history/**', { fixture: 'erroredFrozenDataSource' });
      cy.visit('/sources');
      cy.get('[data-testid="sources-table-search"]').type('FTS ISO codes{enter}').first();
      cy.get('[data-testid="sources-table-row"]')
        .first()
        .then(($element) => {
          cy.wrap($element).contains('Versions').click();
          cy.get('[data-testid="frozen-data-status"]').contains('Errored');
          cy.get('[data-testid="frozen-source-info-button"]').first().click({ force: true });
          cy.get('.modal-body').should('be.visible').contains('Invalid dataset');
          cy.get('.modal-footer').contains('Close').click();
        });
    });
  });
});
