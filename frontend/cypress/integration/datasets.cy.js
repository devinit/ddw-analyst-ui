/// <reference types="Cypress"/>

const checkCopiedDataset = (checkedStatus) => {
  cy.get('[data-testid="dataset-duplicate"]').first().click({ force: true });
  cy.url().should('include', '/queries/build');
  cy.get('[data-testid="op-name-field"]').should('have.value', 'Copy of Test');
  cy.get('[data-testid="op-description-field"]').should('have.value', 'Test');
  cy.get('.form-check-input').should(checkedStatus);
  cy.get('[data-testid="active-data-source"]')
    .children()
    .eq(1)
    .not()
    .contains('Select Data Source');
};

describe('The Datasets Pages', () => {
  beforeEach(() => {
    cy.setupUser();
  });

  // TODO: run each test for both my datasets & published datasets

  it('that are published should be navigated to from the sidebar', () => {
    cy.navFromSidebar('[data-testid=sidebar-link-published-datasets]', '/datasets');
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

  it('filters datasets by search text', () => {
    cy.intercept('/api/datasets/*').as('datasets');

    cy.visit('/datasets/');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/datasets/`);

    cy.wait('@datasets').then((res) => {
      cy.get('[data-testid="sources-table-search"]').type('iati{enter}');
      cy.url().should('eq', `${Cypress.config('baseUrl')}/datasets/?page=1&search=iati`);
      cy.get('[data-testid="sources-table-search"]').should('have.value', 'iati');
      cy.getAccessToken().then((token) => {
        if (token) {
          const options = {
            url: `${Cypress.config('baseUrl')}/api/datasets/?&offset=0&search=iati`,
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
      cy.url().should('eq', `${Cypress.config('baseUrl')}/datasets/`);
      cy.get('[data-testid="sources-table-search"]').should('have.value', '');
    });
  });

  it('filters datasets by data source', () => {
    cy.intercept('/api/datasets/*').as('datasets');

    cy.visit('/datasets/');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/datasets/`);

    cy.wait('@datasets').then((res) => {
      cy.get('.search').first().click({ force: true });
      cy.get('.search').first().type('FTS dependency codenames{enter}', { delay: 200 });
      cy.url().should('eq', `${Cypress.config('baseUrl')}/datasets/?page=1&source=43`);
      cy.get('.text').eq(1).should('have.text', 'FTS dependency codenames');
      cy.getAccessToken().then((token) => {
        if (token) {
          const options = {
            url: `${Cypress.config('baseUrl')}/api/source/datasets/43/?limit=10&offset=0&search=`,
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
      cy.url().should('eq', `${Cypress.config('baseUrl')}/datasets/`);
      cy.get('.text').eq(1).should('have.text', 'Filter by data source');
    });
  });

  it('it does not paginate when datasets are less than or equal to 10', () => {
    cy.fixture('datasets').then((datasets) => {
      datasets.results = datasets.results.slice(0, 10);
      datasets.count = datasets.results.length;
      cy.intercept('/api/datasets/*', datasets).as('fetchDatasets');
    });

    cy.visit('/datasets');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/datasets/`);
    cy.wait('@fetchDatasets');
    cy.countPagination();
  });

  it('paginates when datasets exceed 10', () => {
    cy.fixture('datasets').then((datasets) => {
      datasets.count = 15;
      datasets.results = datasets.results.slice(0, 10);
      cy.intercept('/api/datasets/?limit=10&offset=0&search=', datasets);
    });
    cy.fixture('datasets').then((datasets) => {
      datasets.count = 15;
      datasets.results = datasets.results.slice(10, 15);
      cy.intercept('/api/datasets/?limit=10&offset=10&search=', datasets);
    });

    cy.visit('/datasets');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/datasets/`);
    cy.get('.dataset-row').its('length').should('eq', 10);
    cy.checkPaginationNext();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/datasets/?page=2`);
    cy.get('[data-testid="pagination-results-count"]').should(
      'contain.text',
      'Showing 11 to 15 of 15',
    );
    cy.get('.dataset-row').its('length').should('eq', 5);
    cy.get('.pagination > li').find('a').eq(1).click();
    cy.get('.pagination > li').eq(1).should('have.class', 'active');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/datasets/?page=1`);
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
    cy.intercept('/api/datasets/mine/?limit=10&offset=0&search=', { fixture: 'datasets' }).as(
      'getMyDatasets',
    );
    cy.visit('/');
    cy.wait('@getMyDatasets');
    checkCopiedDataset('be.checked');
  });

  it('makes a copy of a published dataset', () => {
    cy.fixture('datasets').then((datasets) => {
      datasets.results = datasets.results.map((dataset) => {
        dataset.is_draft = false;

        return dataset;
      });
      cy.intercept('/api/datasets/?limit=10&offset=0&search=', datasets);
    });
    cy.visit('/datasets/');
    checkCopiedDataset('not.be.checked');
  });

  it('views data in datasets', () => {
    cy.fixture('datasets').then((datasets) => {
      cy.intercept('/api/datasets/mine/?limit=10&offset=0&search=', datasets).as('datasets');
    });
    cy.fixture('datasetTableData').then((data) => {
      cy.intercept('/api/dataset/data/346', data);
    });

    // View dataset data in tabular form
    cy.visit('/');
    cy.wait('@datasets');
    cy.get('.dataset-row')
      .eq(16)
      .then(($datasetRow) => {
        cy.wrap($datasetRow)
          .contains('View Data')
          .click({ force: true })
          .then(() => {
            cy.get('[data-testid="dataset-table-body"]').children().should('have.length', 15);
            cy.get('[data-testid="dataset-export-button"]').should('be.visible');
          });
      });
  });

  it('freezes a dataset', () => {
    cy.visit('/datasets/');
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
    cy.intercept(`/api/dataset/history/*/?limit=10&offset=0`).as('getFrozenDatasets');

    cy.visit('/datasets/');
    cy.get('.dataset-row').eq(0).contains('Versions').click({ force: true });

    let currentFrozenDataset;
    cy.wait('@getFrozenDatasets').then((interception) => {
      const currentDataDatasetId = Math.max(
        ...interception.response.body.results.map((data) => Number(data.id)),
      );
      currentFrozenDataset = interception.response.body.results.find(
        (item) => Number(item.id) === currentDataDatasetId,
      );
    });
    cy.get('[data-testid="datasetRows"]')
      .children()
      .first()
      .then((row) => {
        const badge = row.find('[data-testid="dataset-frozen-data-status"]');
        if (badge[0].innerHTML === 'Completed') {
          const button = row.find('[data-testid="frozen-dataset-download-button"]');
          expect(button).to.not.be.visible;
          expect(button).to.have.attr(
            'href',
            `/api/tables/download/${currentFrozenDataset.saved_query_db_table}/dataset/`,
          );
        } else if (['Completed', 'Pending'].includes(badge[0].innerHTML)) {
          const downloadButton = row.find('[data-testid="frozen-dataset-download-button"]');
          expect(downloadButton).to.not.exist;
        }
      });
  });

  it('deletes a frozen dataset', () => {
    cy.intercept(`/api/dataset/history/*/?limit=10&offset=0`).as('getFrozenDatasets');

    cy.visit('/datasets/');
    cy.get('.dataset-row').eq(0).contains('Versions').click({ force: true });

    // Get initial frozen datasets row count
    cy.get('[data-testid="datasetRows"]')
      .its('length')
      .then((rowNumber) => {
        cy.wrap(rowNumber).as('datasetRowNumber');
      });

    // Delete frozen dataset
    cy.get('[data-testid="frozen-dataset-delete-button"]')
      .first()
      .click({ force: true })
      .click({ force: true });
    cy.get('@datasetRowNumber').then((datasetRowNumber) => {
      cy.get('[data-testid="datasetRows"]').should('have.length', datasetRowNumber - 1);
    });
  });

  it('that info button logs error message incase of a dataset freeze error', () => {
    cy.intercept('GET', '/api/dataset/history/**', { fixture: 'erroredFrozenDataset' });
    cy.visit('/datasets/');
    cy.get('.dataset-row').eq(0).contains('Versions').click({ force: true });
    cy.get('[data-testid="frozen-dataset-info-button"]').click({ force: true });
    cy.get('.modal-body').should('be.visible').contains('Invalid dataset');
    cy.get('.modal-footer').contains('Close').click();
  });
});
