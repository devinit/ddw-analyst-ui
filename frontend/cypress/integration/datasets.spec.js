/// <reference types="Cypress"/>

describe('The Datasets Pages', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      const { username, password } = users.find((user) => user.role === 'admin');

      cy.login(username, password);
    });
  });

  // TODO: run each test for both my datasets & published datasets

  it('that are published should be navigated to from the sidebar', () => {
    cy.visit('/');
    cy.url().should('not.include', '/login');
    cy.get('[data-testid=sidebar-link-published-datasets]').click();
    cy.url().should('include', '/datasets');
  });

  it('renders its own help menu', () => {
    cy.visit('/');
    cy.get('[id=help-nav-dropdown]').click();
    const checkLinks = (links) => {
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
    };
    cy.get('.dropdown-menu.show .nav-link').should('have.length.greaterThan', 0).then(checkLinks);
    // run same test for published datasets
    cy.visit('/datasets');
    cy.get('[id=help-nav-dropdown]').click();
    cy.get('.dropdown-menu.show .nav-link').should('have.length.greaterThan', 0).then(checkLinks);
  });

  xit('shows a list of paginated datasets', () => {
    // TODO: create test
  });

  xdescribe('dataset row', () => {
    xit('shows action buttons when hovered over', () => {
      // TODO: create test
    });

    xdescribe('action buttons', () => {
      xit('include a functional Edit button', () => {
        // TODO: create test - this test should fail for the published datasets page
      });

      xit('include a functional View Data button', () => {
        // TODO: create test
      });

      xit('include a functional SQL Query button', () => {
        // TODO: create test
      });

      xit('include a functional Export to CSV button', () => {
        // TODO: create test
      });

      xit('include a functional Versions button', () => {
        // TODO: create test
      });
    });

    xit('allows dataset filtering', () => {
      // TODO: create test
    });
  });

  it('makes a copy of my dataset', () => {
    cy.fixture('datasets').then((datasets) => {
      cy.intercept('api/datasets/mine/', datasets);
    });
    cy.visit('/');
    cy.get('[data-testid="dataset-duplicate"]').first().click({ force: true });
    cy.url().should('include', '/queries/build');
    cy.get('[data-testid="op-name-field"]').should('have.value', 'Copy of Test');
    cy.get('[data-testid="op-description-field"]').should('have.value', 'Test');
    cy.get('.form-check-input').should('be.checked');
    cy.get('[data-testid="active-data-source"]')
      .children()
      .eq(1)
      .not()
      .contains('Select Data Source');
  });

  it('makes a copy of a published dataset', () => {
    cy.fixture('datasets').then((datasets) => {
      datasets.results = datasets.results.map((dataset) => {
        dataset.is_draft = false;

        return dataset;
      });
      cy.intercept('api/datasets/', datasets);
    });
    cy.visit('/datasets/');
    cy.get('[data-testid="dataset-duplicate"]').first().click({ force: true });
    cy.url().should('include', '/queries/build');
    cy.get('[data-testid="op-name-field"]').should('have.value', 'Copy of Test');
    cy.get('[data-testid="op-description-field"]').should('have.value', 'Test');
    cy.get('.form-check-input').should('not.be.checked');
    cy.get('[data-testid="active-data-source"]')
      .children()
      .eq(1)
      .not()
      .contains('Select Data Source');
  });

  it('views data in datasets', () => {
    cy.fixture('datasets').then((datasets) => {
      cy.intercept('api/datasets/mine/', datasets);
    });
    cy.fixture('datasetTableData').then((data) => {
      cy.intercept('api/dataset/data/4', data);
    });

    // View dataset data in tabular form and export it as csv
    cy.visit('/');
    cy.get('.dataset-row')
      .eq(3)
      .then(($datasetRow) => {
        cy.wrap($datasetRow)
          .contains('View Data')
          .click({ force: true })
          .then(() => {
            cy.get('[data-testid="dataset-table-body"]').children().should('have.length', 10);
            cy.get('[data-testid="dataset-data-export-form"]').then(($form) => {
              cy.wrap($form).should('have.attr', 'method', 'POST');
              cy.wrap($form).should('have.attr', 'action', '/api/export/4/');
            });
            cy.get('[data-testid="dataset-export-button"]')
              .should('be.visible')
              .should('have.attr', 'type', 'submit');
          });
      });
  });

  it('freezes a dataset', () => {
    cy.visit('/');
    cy.get('.dataset-row').eq(0).contains('Versions').click({ force: true });
    cy.get('[data-testid="dataset-freeze-button"]').click();
    cy.get('[data-testid="dataset-frozen-data-description"]')
      .should('be.visible')
      .type('Test dataset freeze');
    cy.get('[data-testid="dataset-frozen-data-save-button"]').should('be.visible').click();
    cy.get('[data-testid="dataset-frozen-data-refresh-button"]').first().click({ force: true });
    cy.get('[data-testid="dataset-frozen-data-status"]').each((badge) => {
      expect(['Errored', 'Completed', 'Pending'].includes(badge[0].innerHTML)).to.be.true;
    });
    cy.get('.dataset-row-title').contains('Test dataset freeze');
  });

  it('downloads a successfully frozen dataset', () => {
    cy.getAccessToken().then((token) => {
      if (token) {
        const options = {
          url: `${Cypress.config('baseUrl')}/api/savedquerysets/`,
          headers: {
            Authorization: `token ${token.replaceAll('"', '')}`,
          },
        };
        cy.request(options).then((response) => {
          const currentDataDatasetId = Math.max(...response.body.map((data) => Number(data.id)));
          const currentFrozenDataset = response.body.find(
            (item) => Number(item.id) === currentDataDatasetId,
          );
          cy.get('[data-testid="datasetRows"]').each((row) => {
            const badge = row.find('[data-testid="dataset-frozen-data-status"]');
            if (badge[0].innerHTML === 'Completed') {
              row
                .find('[data-testid="frozen-dataset-download-button"]')
                .should('not.be.visible')
                .should(
                  'have.attr',
                  'href',
                  `/api/tables/download/${currentFrozenDataset.saved_query_db_table}/dataset/`,
                );
            } else if (['Completed', 'Pending'].includes(badge[0].innerHTML)) {
              row.find('[data-testid="frozen-dataset-download-button"]').should('not.exist');
            }
          });
        });
      }
    });
  });

  it('that info button logs error message incase of a dataset freeze error', () => {
    cy.intercept('GET', '/api/dataset/history/**', { fixture: 'erroredFrozenDataset' });
    cy.visit('/');
    cy.get('.dataset-row').eq(0).contains('Versions').click({ force: true });
    cy.get('[data-testid="frozen-dataset-info-button"]').click({ force: true });
    cy.get('.modal-body').should('be.visible').contains('Invalid dataset');
    cy.get('.modal-footer').contains('Close').click();
  });

  it('deletes a frozen dataset', () => {
    // Get initial frozen datasets row count
    cy.get('[data-testid="datasetRows"]')
      .its('length')
      .then((rowNumber) => {
        cy.wrap(rowNumber).as('datasetRowNumber');
      });

    // Delete frozen dataset
    cy.get('[data-testid="frozen-dataset-delete-button"]').first().dblclick({ force: true });
    cy.get('@datasetRowNumber').then((datasetRowNumber) => {
      cy.get('[data-testid="datasetRows"]').should('have.length', datasetRowNumber - 1);
    });
  });
});
