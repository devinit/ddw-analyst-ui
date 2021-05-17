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
          cy.get('[data-testid="frozen-data-form-message"]').should('be.visible').type('test');
          cy.get('[data-testid="frozen-data-form-save-button"]').should('be.visible').click();
          cy.get('[data-testid="frozen-dataset-refresh-button"]').first().click({ force: true });
        });
      cy.get('[data-testid="frozen-data-status"]').each((badge) => {
        expect(['Errored', 'Completed', 'Pending'].includes(badge[0].innerHTML)).to.be.true;
      });
      cy.get('[data-testid="frozen-data-description"]').contains('test');
    });

    it('downloads a successfully frozen data source', () => {
      cy.getAccessToken().then((token) => {
        if (token) {
          const options = {
            url: `${Cypress.config('baseUrl')}/api/frozendata/`,
            headers: {
              Authorization: `token ${token.replaceAll('"', '')}`,
            },
          };
          cy.request(options).then((response) => {
            const currentDataSourceId = Math.max(...response.body.map((data) => Number(data.id)));
            const currentFrozenDataSource = response.body.find(
              (item) => Number(item.id) === currentDataSourceId,
            );
            cy.get('.dataset-row').each((row) => {
              const badge = row.find('[data-testid="frozen-data-status"]');
              if (badge[0].innerHTML === 'Completed') {
                row
                  .find('[data-testid="frozen-source-download-button"]')
                  .should('not.be.visible')
                  .should(
                    'have.attr',
                    'href',
                    `/api/tables/download/${currentFrozenDataSource.frozen_db_table}/archives/`,
                  );
              } else if (['Completed', 'Pending'].includes(badge[0].innerHTML)) {
                row.find('[data-testid="frozen-source-download-button"]').should('not.exist');
              }
            });
          });
        }
      });
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

    it('searches for frozen data source in sources', () => {
      cy.visit('/sources');
      cy.get('[data-testid="sources-table-search"]').type('FTS ISO codes test{enter}');
      cy.get('[data-testid="sources-table-row"]').first().contains('FTS ISO codes test');
    });

    it('querys a frozen data source', () => {
      cy.visit('/queries/build');
      cy.get('[name="name"]').focus().type('My Test Dataset');
      cy.get('[name="description"]').focus().type('My Test Dataset Description');
      cy.get('.search', { timeout: 10000 }).eq(1).click({ force: true });
      cy.get('.search').eq(1).type('FTS ISO codes test{enter}{esc}');
      cy.get('[data-testid="qb-add-step-button"]').click();

      cy.get('[name="name"]').eq(1).type('Dataset Step Test');
      cy.get('[name="description"]').eq(1).type('Dataset Step Test Description');
      cy.get('[data-testid="qb-step-select-query"]').type('select{enter}');
      cy.get('.selectColumnCheckbox > input').eq(0).check({ force: true });
      cy.get('[data-testid="qb-step-preview-button"]').click();
      cy.get('[data-testid="qb-save-button"]').click();
      cy.get('.dataset-row-footer').eq(0).contains('Frozen FTS ISO codes test');
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
          cy.get('[data-testid="frozen-data-description"]').first().contains('test');
          cy.get('[data-testid="frozen-data-delete-button"]').first().dblclick({ force: true });

          // Check row count after deleting
          cy.get('@dataSourceRowNumber').then((dataSourceRowNumber) => {
            cy.get('.dataset-row').should('have.length', dataSourceRowNumber - 1);
          });
        });

      //  Confirm that frozen data source was deleted
      cy.visit('/sources');
      cy.get('[data-testid="sources-table-search"]').type('FTS ISO codes test{enter}');
      cy.get('.row').contains('No Data');
    });
  });
});
